import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const usePoolManager = () => {
  const [pools, setPools] = useState(() => {
    const saved = localStorage.getItem('time-pools');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Data migration for dynamic types
      if (!parsed.types) {
        parsed.types = [
          { id: 'work', name: '工作', color: '#7e5bef' },
          { id: 'sleep', name: '睡觉', color: '#00f2ff' },
          { id: 'other', name: '其他', color: '#ffcc00' }
        ];
      }
      return parsed;
    }
    return {
      daily: {}, 
      templates: [
        { name: '睡觉', duration: 8, type: 'sleep', priority: 1, note: '每日保障' },
        { name: '用餐', duration: 2, type: 'other', priority: 2, note: '早午晚餐' },
        { name: '专注工作', duration: 4, type: 'work', priority: 1, note: '核心输出' }
      ],
      types: [
        { id: 'work', name: '工作', color: '#7e5bef' },
        { id: 'sleep', name: '睡觉', color: '#00f2ff' },
        { id: 'other', name: '其他', color: '#ffcc00' }
      ]
    };
  });

  const getWeekRange = () => {
    const now = new Date();
    let resetTime = startOfDay(now);
    resetTime.setHours(1);
    const referenceDay = now < resetTime ? addDays(now, -1) : now;
    return Array.from({ length: 8 }).map((_, i) => format(addDays(referenceDay, i), 'yyyy-MM-dd'));
  };

  const weekRange = useMemo(() => getWeekRange(), []);

  useEffect(() => {
    let changed = false;
    const newDaily = { ...pools.daily };
    
    weekRange.forEach(dateStr => {
      if (!newDaily[dateStr] || newDaily[dateStr].length === 0) {
        newDaily[dateStr] = pools.templates.map(tpl => ({
          ...tpl,
          id: uuidv4(),
          completedTime: 0,
          note: '自动预置',
          createdAt: new Date().toISOString()
        }));
        changed = true;
      }
    });

    if (changed) {
      setPools(prev => ({ ...prev, daily: newDaily }));
    }
  }, [weekRange, pools.templates]);

  useEffect(() => {
    localStorage.setItem('time-pools', JSON.stringify(pools));
  }, [pools]);

  const getPassedHours = () => {
    const now = new Date();
    let resetTime = startOfDay(now);
    resetTime.setHours(1);
    if (now < resetTime) return 0;
    const diffMs = now - resetTime;
    return Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
  };

  const getPoolStats = (dateStr) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isToday = dateStr === todayStr;
    const items = pools.daily[dateStr] || [];
    const used = items.reduce((acc, b) => acc + Math.max(0, Number(b.duration) - Number(b.completedTime || 0)), 0);
    const passed = isToday ? getPassedHours() : 0;
    return { used, passed, remaining: Math.max(0, 24 - used - passed), total: 24 };
  };

  const getWeeklyStats = () => {
    const stats = { totalUsed: 0, totalPassed: 0, totalRemaining: 0 };
    pools.types.forEach(t => { stats[t.id] = 0; });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    weekRange.forEach(dateStr => {
      const dayBlocks = pools.daily[dateStr] || [];
      const dayPassed = dateStr === todayStr ? getPassedHours() : 0;
      stats.totalPassed += dayPassed;
      let dayUsed = 0;
      dayBlocks.forEach(b => {
        const effective = Math.max(0, Number(b.duration) - Number(b.completedTime || 0));
        if (stats[b.type] !== undefined) {
          stats[b.type] += effective;
        } else {
          const otherId = pools.types[pools.types.length - 1]?.id || 'other';
          stats[otherId] = (stats[otherId] || 0) + effective;
        }
        dayUsed += effective;
      });
      stats.totalUsed += dayUsed;
      stats.totalRemaining += Math.max(0, 24 - dayUsed - dayPassed);
    });
    return stats;
  };

  const addBlock = (scope, dateStr, blockData) => {
    const newBlock = { id: uuidv4(), completedTime: 0, ...blockData, createdAt: new Date().toISOString() };
    setPools(prev => ({
      ...prev,
      daily: { ...prev.daily, [dateStr]: [...(prev.daily[dateStr] || []), newBlock] }
    }));
  };

  const bulkAddBlocks = (items) => {
    setPools(prev => {
      const newDaily = { ...prev.daily };
      items.forEach(({ dateStr, blockData }) => {
        const newBlock = { id: uuidv4(), completedTime: 0, ...blockData, createdAt: new Date().toISOString() };
        newDaily[dateStr] = [...(newDaily[dateStr] || []), newBlock];
      });
      return { ...prev, daily: newDaily };
    });
  };

  const updateBlock = (dateStr, blockId, newData) => {
    setPools(prev => ({
      ...prev,
      daily: {
        ...prev.daily,
        [dateStr]: prev.daily[dateStr].map(b => b.id === blockId ? { ...b, ...newData } : b)
      }
    }));
  };

  const removeBlock = (scope, dateStr, blockId) => {
    setPools(prev => ({
      ...prev,
      daily: { ...prev.daily, [dateStr]: (prev.daily[dateStr] || []).filter(b => b.id !== blockId) }
    }));
  };

  const bulkRemoveBlocks = (items) => {
    setPools(prev => {
      const newDaily = { ...prev.daily };
      items.forEach(({ dateStr, blockId }) => {
        if (newDaily[dateStr]) {
          newDaily[dateStr] = newDaily[dateStr].filter(b => b.id !== blockId);
        }
      });
      return { ...prev, daily: newDaily };
    });
  };

  const moveBlock = (fromScope, fromDate, toScope, toDate, blockId) => {
    setPools(prev => {
      const block = prev.daily[fromDate]?.find(b => b.id === blockId);
      if (!block) return prev;
      const newDaily = { ...prev.daily };
      newDaily[fromDate] = newDaily[fromDate].filter(b => b.id !== blockId);
      newDaily[toDate] = [...(newDaily[toDate] || []), block];
      return { ...prev, daily: newDaily };
    });
  };

  const updateTemplate = (index, newData) => {
    setPools(prev => ({
      ...prev,
      templates: prev.templates.map((t, i) => i === index ? { ...t, ...newData } : t)
    }));
  };

  const addTemplate = (template) => {
    setPools(prev => ({ ...prev, templates: [...prev.templates, template] }));
  };

  const removeTemplate = (index) => {
    setPools(prev => ({ ...prev, templates: prev.templates.filter((_, i) => i !== index) }));
  };

  const addType = (type) => {
    setPools(prev => ({ ...prev, types: [...prev.types, { ...type, id: uuidv4() }] }));
  };

  const updateType = (id, newData) => {
    setPools(prev => ({
      ...prev,
      types: prev.types.map(t => t.id === id ? { ...t, ...newData } : t)
    }));
  };

  const removeType = (id) => {
    setPools(prev => ({
      ...prev,
      types: prev.types.filter(t => t.id !== id)
    }));
  };

  return {
    pools,
    addBlock,
    bulkAddBlocks,
    updateBlock,
    removeBlock,
    bulkRemoveBlocks,
    moveBlock,
    getWeekRange,
    getPoolStats,
    getWeeklyStats,
    updateTemplate,
    addTemplate,
    removeTemplate,
    addType,
    updateType,
    removeType
  };
};
