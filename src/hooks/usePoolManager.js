import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const usePoolManager = () => {
  const [pools, setPools] = useState(() => {
    const saved = localStorage.getItem('time-pools');
    if (saved) return JSON.parse(saved);
    return {
      weekly: [],
      daily: {} // date string -> blocks
    };
  });

  useEffect(() => {
    localStorage.setItem('time-pools', JSON.stringify(pools));
  }, [pools]);

  const getWeekRange = () => {
    const today = startOfDay(new Date());
    return Array.from({ length: 8 }).map((_, i) => format(addDays(today, i), 'yyyy-MM-dd'));
  };

  const addBlock = (scope, dateStr, blockData) => {
    const newBlock = {
      id: uuidv4(),
      ...blockData,
      createdAt: new Date().toISOString()
    };

    setPools(prev => {
      if (scope === 'weekly') {
        return { ...prev, weekly: [...prev.weekly, newBlock] };
      } else {
        const dayBlocks = prev.daily[dateStr] || [];
        return {
          ...prev,
          daily: { ...prev.daily, [dateStr]: [...dayBlocks, newBlock] }
        };
      }
    });
  };

  const removeBlock = (scope, dateStr, blockId) => {
    setPools(prev => {
      if (scope === 'weekly') {
        return { ...prev, weekly: prev.weekly.filter(b => b.id !== blockId) };
      } else {
        return {
          ...prev,
          daily: {
            ...prev.daily,
            [dateStr]: prev.daily[dateStr].filter(b => b.id !== blockId)
          }
        };
      }
    });
  };

  const moveBlock = (fromScope, fromDate, toScope, toDate, blockId) => {
    setPools(prev => {
      let block;
      let newWeekly = [...prev.weekly];
      let newDaily = { ...prev.daily };

      // Extract
      if (fromScope === 'weekly') {
        block = newWeekly.find(b => b.id === blockId);
        newWeekly = newWeekly.filter(b => b.id !== blockId);
      } else {
        block = newDaily[fromDate]?.find(b => b.id === blockId);
        newDaily[fromDate] = newDaily[fromDate]?.filter(b => b.id !== blockId);
      }

      if (!block) return prev;

      // Inject
      if (toScope === 'weekly') {
        newWeekly.push(block);
      } else {
        newDaily[toDate] = [...(newDaily[toDate] || []), block];
      }

      return { weekly: newWeekly, daily: newDaily };
    });
  };

  const getDayTotal = (dateStr) => {
    return (pools.daily[dateStr] || []).reduce((acc, b) => acc + Number(b.duration), 0);
  };

  const getWeeklyTotal = () => {
    return pools.weekly.reduce((acc, b) => acc + Number(b.duration), 0);
  };

  return {
    pools,
    addBlock,
    removeBlock,
    moveBlock,
    getWeekRange,
    getDayTotal,
    getWeeklyTotal
  };
};
