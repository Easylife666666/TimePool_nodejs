import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart2, Settings, Home, Trash2, CheckCircle2, CheckSquare, Square, XCircle } from 'lucide-react';
import { usePoolManager } from './hooks/usePoolManager';
import TimeBlock from './components/TimeBlock';
import AddBlockModal from './components/AddBlockModal';
import './index.css';

function App() {
  const { 
    pools, addBlock, updateBlock, removeBlock, bulkRemoveBlocks, moveBlock, 
    getWeekRange, getPoolStats, getWeeklyStats, 
    updateTemplate, addTemplate, removeTemplate
  } = usePoolManager();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState({ date: null });
  
  // Selection State: Array of { dateStr, blockId }
  const [selectedItems, setSelectedItems] = useState([]);

  const weekRange = getWeekRange();
  const weeklyStats = getWeeklyStats();

  const handleDragStart = (e, blockId, fromDate) => {
    e.dataTransfer.setData('blockId', blockId);
    e.dataTransfer.setData('fromDate', fromDate);
  };

  const handleDrop = (e, toDate) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    const fromDate = e.dataTransfer.getData('fromDate');
    if (fromDate === toDate) return;
    moveBlock('daily', fromDate, 'daily', toDate, blockId);
  };

  const openAddModal = (date) => {
    setModalContext({ date });
    setIsModalOpen(true);
  };

  // Selection Handlers
  const toggleSelect = (dateStr, blockId) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.blockId === blockId);
      if (exists) {
        return prev.filter(item => item.blockId !== blockId);
      } else {
        return [...prev, { dateStr, blockId }];
      }
    });
  };

  const selectAllOnDay = (dateStr) => {
    const dayBlocks = pools.daily[dateStr] || [];
    const blockIdsOnDay = dayBlocks.map(b => b.id);
    const alreadySelectedOnDay = selectedItems.filter(item => item.dateStr === dateStr).map(item => item.blockId);
    
    if (alreadySelectedOnDay.length === blockIdsOnDay.length) {
      // Toggle off if all are already selected
      setSelectedItems(prev => prev.filter(item => item.dateStr !== dateStr));
    } else {
      // Select all (adding only those not yet selected)
      const toAdd = dayBlocks
        .filter(b => !alreadySelectedOnDay.includes(b.id))
        .map(b => ({ dateStr, blockId: b.id }));
      setSelectedItems(prev => [...prev, ...toAdd]);
    }
  };

  const clearSelection = () => setSelectedItems([]);

  const handleBulkDelete = () => {
    if (window.confirm(`确认删除选中的 ${selectedItems.length} 个任务吗？`)) {
      bulkRemoveBlocks(selectedItems);
      setSelectedItems([]);
    }
  };

  return (
    <div className="app">
      <nav className="glass" style={{ margin: '20px auto', width: 'fit-content', padding: '6px', display: 'flex', gap: '8px', position: 'sticky', top: '20px', zIndex: 100 }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
          style={{ background: activeTab === 'dashboard' ? '' : 'transparent', color: activeTab === 'dashboard' ? '' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Home size={18} /> 时间池
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
          style={{ background: activeTab === 'settings' ? '' : 'transparent', color: activeTab === 'settings' ? '' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Settings size={18} /> 预置管理
        </button>
      </nav>

      <header style={{ padding: '20px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #00f2ff, #7e5bef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TIME POOL
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="pool-container"
          >
            {/* Weekly Summary Sidebar */}
            <aside className="pool glass" style={{ maxWidth: '320px', height: 'fit-content', position: 'sticky', top: '80px' }}>
              <div className="pool-header">
                <div>
                  <h2 className="pool-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={20} color="var(--primary)" /> 星期概览
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div className="glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>待完成总量</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{weeklyStats.totalUsed.toFixed(1)}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>全周可用池</span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{weeklyStats.totalRemaining.toFixed(1)}h</span>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    {['work', 'sleep', 'other'].map(type => {
                      const hours = weeklyStats[type] || 0;
                      const pct = weeklyStats.totalUsed ? (hours / weeklyStats.totalUsed) * 100 : 0;
                      const label = type === 'work' ? '工作' : type === 'sleep' ? '睡觉' : '其他';
                      return (
                        <div key={type} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-dim)' }}>
                            <span>{label}</span>
                            <span>{hours.toFixed(1)}h</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              style={{ height: '100%', background: `var(--${type})` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedItems.length > 0 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass selected-glow" 
                    style={{ padding: '16px', textAlign: 'center', border: '1px solid var(--primary)' }}
                  >
                    <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>已选中 <strong>{selectedItems.length}</strong> 项</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }} onClick={clearSelection}>取消</button>
                      <button className="btn btn-primary" style={{ flex: 1, background: '#ff3e3e', fontSize: '0.8rem' }} onClick={handleBulkDelete}>删除</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </aside>

            {/* Daily Pools */}
            <div style={{ flex: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {weekRange.map((dateStr, idx) => {
                const isToday = idx === 0;
                const dayBlocks = pools.daily[dateStr] || [];
                const stats = getPoolStats(dateStr);
                const isAllSelected = dayBlocks.length > 0 && dayBlocks.every(b => selectedItems.some(item => item.blockId === b.id));

                return (
                  <section 
                    key={dateStr}
                    className={`pool glass ${isToday ? 'today' : ''}`}
                    style={{ border: isToday ? '1px solid var(--primary)' : '' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className="pool-header">
                      <div>
                        <h3 className="pool-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isToday ? '今天' : dateStr.split('-').slice(1).join('/')}
                          {dayBlocks.length > 0 && (
                            <button 
                              onClick={() => selectAllOnDay(dateStr)}
                              style={{ background: 'none', border: 'none', color: isAllSelected ? 'var(--primary)' : 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.65rem' }}
                            >
                              {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />} 全选
                            </button>
                          )}
                        </h3>
                        <div className="pool-stats">
                          剩余: {stats.remaining.toFixed(1)}h | 已分配: {stats.used.toFixed(1)}h
                        </div>
                      </div>
                      <button className="btn-icon" onClick={() => openAddModal(dateStr)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      {stats.passed > 0 && (
                        <div style={{ height: '100%', width: `${(stats.passed / 24) * 100}%`, background: 'rgba(255,255,255,0.1)' }} />
                      )}
                      {stats.used > 0 && (
                        <motion.div 
                          animate={{ width: `${(stats.used / 24) * 100}%` }}
                          style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}
                        />
                      )}
                    </div>

                    <div className="block-list" style={{ marginTop: '16px' }}>
                      <AnimatePresence>
                        {dayBlocks.map(block => (
                          <TimeBlock 
                            key={block.id} 
                            block={block} 
                            selected={selectedItems.some(item => item.blockId === block.id)}
                            onSelect={() => toggleSelect(dateStr, block.id)}
                            onRemove={(id) => removeBlock('daily', dateStr, id)}
                            onUpdate={(data) => updateBlock(dateStr, block.id, data)}
                            onDragStart={(e, id) => handleDragStart(e, id, dateStr)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.main>
        ) : (
          <motion.main 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
          >
            <div className="pool glass">
              <div className="pool-header" style={{ marginBottom: '24px' }}>
                <h2 className="pool-title">默认模板管理</h2>
                <button className="btn btn-primary" onClick={() => addTemplate({ name: '新任务', duration: 1, type: 'work' })}>
                  <Plus size={18} /> 新增模板
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pools.templates.map((tpl, idx) => (
                  <div key={idx} className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>模板名称</label>
                      <input 
                        className="glass" 
                        style={{ padding: '10px', width: '100%', border: 'none', color: 'white' }}
                        value={tpl.name}
                        onChange={(e) => updateTemplate(idx, { name: e.target.value })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>默认时长 (h)</label>
                      <input 
                        className="glass" 
                        style={{ padding: '10px', width: '100%', border: 'none', color: 'white' }}
                        type="number" step="0.5"
                        value={tpl.duration}
                        onChange={(e) => updateTemplate(idx, { duration: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>类型</label>
                      <select 
                        className="glass" 
                        style={{ padding: '10px', width: '100%', border: 'none', color: 'white', background: 'var(--surface)' }}
                        value={tpl.type}
                        onChange={(e) => updateTemplate(idx, { type: e.target.value })}
                      >
                        <option value="work">工作</option>
                        <option value="sleep">睡觉</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                    <button 
                      className="btn-icon" 
                      onClick={() => removeTemplate(idx)}
                      style={{ marginTop: '18px', color: '#ff3e3e' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="glass" style={{ marginTop: '32px', padding: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                ℹ️ 修改模板后，仅会影响<strong>新生成</strong>的日期池子。已经存在的日期模块不会被自动修改。
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <AddBlockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(data) => addBlock('daily', modalContext.date, data)}
        DEFAULT_TEMPLATES={pools.templates}
      />
    </div>
  );
}

export default App;
