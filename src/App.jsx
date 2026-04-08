import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart2, Settings, Home, Trash2, CheckCircle2, CheckSquare, Square, Activity, LayoutGrid, Tag, Palette } from 'lucide-react';
import { usePoolManager } from './hooks/usePoolManager';
import TimeBlock from './components/TimeBlock';
import AddBlockModal from './components/AddBlockModal';
import './index.css';

function App() {
  const { 
    pools, addBlock, updateBlock, removeBlock, bulkRemoveBlocks, moveBlock, 
    getWeekRange, getPoolStats, getWeeklyStats, 
    updateTemplate, addTemplate, removeTemplate,
    addType, updateType, removeType
  } = usePoolManager();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState({ date: null });
  
  // Selection State
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
      if (exists) return prev.filter(item => item.blockId !== blockId);
      return [...prev, { dateStr, blockId }];
    });
  };

  const selectAllOnDay = (dateStr) => {
    const dayBlocks = pools.daily[dateStr] || [];
    const blockIdsOnDay = dayBlocks.map(b => b.id);
    const alreadySelectedOnDay = selectedItems.filter(item => item.dateStr === dateStr).map(item => item.blockId);
    if (alreadySelectedOnDay.length === blockIdsOnDay.length) {
      setSelectedItems(prev => prev.filter(item => item.dateStr !== dateStr));
    } else {
      const toAdd = dayBlocks.filter(b => !alreadySelectedOnDay.includes(b.id)).map(b => ({ dateStr, blockId: b.id }));
      setSelectedItems(prev => [...prev, ...toAdd]);
    }
  };

  const selectAllWeek = () => {
    const all = [];
    weekRange.forEach(dateStr => {
      (pools.daily[dateStr] || []).forEach(b => all.push({ dateStr, blockId: b.id }));
    });
    setSelectedItems(all);
  };

  const clearSelection = () => setSelectedItems([]);

  const applyTemplatesToDay = (dateStr) => {
    pools.templates.forEach(tpl => addBlock('daily', dateStr, tpl));
  };

  const applyTemplatesToWeek = () => {
    if (window.confirm('确认将模板应用到本周所有日期吗？')) {
      weekRange.forEach(dateStr => applyTemplatesToDay(dateStr));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`确认删除选中的 ${selectedItems.length} 个任务吗？`)) {
      bulkRemoveBlocks(selectedItems);
      setSelectedItems([]);
    }
  };

  return (
    <div className="app">
      <nav className="glass" style={{ margin: '20px auto', width: 'fit-content', padding: '6px', display: 'flex', gap: '8px', position: 'sticky', top: '20px', zIndex: 100 }}>
        {[
          { id: 'dashboard', icon: Home, label: '时间池' },
          { id: 'settings', icon: Settings, label: '预置模板' },
          { id: 'types', icon: Tag, label: '分类管理' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
            style={{ background: activeTab === tab.id ? '' : 'transparent', color: activeTab === tab.id ? '' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      <header style={{ padding: '20px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #00f2ff, #7e5bef, #ff3e3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TIME POOL
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.main key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pool-container">
            {/* Weekly Summary Sidebar */}
            <aside className="pool glass" style={{ maxWidth: '320px', height: 'fit-content', position: 'sticky', top: '80px' }}>
              <div className="pool-header">
                <div>
                  <h2 className="pool-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={20} color="var(--primary)" /> 星期概览
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-icon" onClick={applyTemplatesToWeek} title="全周应用模板"><LayoutGrid size={16} /></button>
                  <button className="btn-icon" onClick={selectAllWeek} title="全选本周"><CheckSquare size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div className="glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>已规划时长</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{weeklyStats.totalUsed.toFixed(1)}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>全周余额</span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{weeklyStats.totalRemaining.toFixed(1)}h</span>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    {pools.types.map(t => {
                      const hours = weeklyStats[t.id] || 0;
                      const pct = weeklyStats.totalUsed ? (hours / weeklyStats.totalUsed) * 100 : 0;
                      return (
                        <div key={t.id} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-dim)' }}>
                            <span style={{ color: t.color }}>{t.name}</span>
                            <span>{hours.toFixed(1)}h</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: '100%', background: t.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedItems.length > 0 && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass selected-glow" style={{ padding: '16px', textAlign: 'center', border: '1px solid var(--primary)' }}>
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
                const items = pools.daily[dateStr] || [];
                const stats = getPoolStats(dateStr);
                const isAllSelected = items.length > 0 && items.every(b => selectedItems.some(item => item.blockId === b.id));
                return (
                  <section key={dateStr} className={`pool glass ${isToday ? 'today' : ''}`} style={{ border: isToday ? '1px solid var(--primary)' : '' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, dateStr)}>
                    <div className="pool-header">
                      <div>
                        <h3 className="pool-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isToday ? '今天' : dateStr.split('-').slice(1).join('/')}
                          {items.length > 0 && (
                            <button onClick={() => selectAllOnDay(dateStr)} style={{ background: 'none', border: 'none', color: isAllSelected ? 'var(--primary)' : 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              {isAllSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                            </button>
                          )}
                        </h3>
                        <div className="pool-stats">可用: {stats.remaining.toFixed(1)}h | 占用: {stats.used.toFixed(1)}h</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => applyTemplatesToDay(dateStr)} title="填入模板"><Activity size={16} /></button>
                        <button className="btn-icon" onClick={() => openAddModal(dateStr)} title="添加块"><Plus size={16} /></button>
                      </div>
                    </div>
                    {/* Progress Bar Rendering ... same as before but prettier */}
                    <div className="block-list" style={{ marginTop: '16px' }}>
                      <AnimatePresence>
                        {items.map(block => (
                          <TimeBlock key={block.id} block={block} types={pools.types} selected={selectedItems.some(i => i.blockId === block.id)} onSelect={() => toggleSelect(dateStr, block.id)} onRemove={(id) => removeBlock('daily', dateStr, id)} onUpdate={(data) => updateBlock(dateStr, block.id, data)} onDragStart={(e, id) => handleDragStart(e, id, dateStr)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.main>
        )}

        {activeTab === 'settings' && (
          <motion.main key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="pool glass">
              <div className="pool-header" style={{ marginBottom: '24px' }}>
                <h2 className="pool-title">默认模板管理</h2>
                <button className="btn btn-primary" onClick={() => addTemplate({ name: '新任务', duration: 1, type: pools.types[0]?.id || 'work' })}><Plus size={18} /> 新增模板</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pools.templates.map((tpl, idx) => (
                  <div key={idx} className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 2 }}><label className="label-mini">模板名称</label><input className="glass input-full" value={tpl.name} onChange={e => updateTemplate(idx, { name: e.target.value })} /></div>
                    <div style={{ flex: 1 }}><label className="label-mini">时长 (h)</label><input type="number" step="0.5" className="glass input-full" value={tpl.duration} onChange={e => updateTemplate(idx, { duration: parseFloat(e.target.value) || 0 })} /></div>
                    <div style={{ flex: 1 }}><label className="label-mini">分类</label>
                      <select className="glass input-full" style={{ background: 'var(--surface)' }} value={tpl.type} onChange={e => updateTemplate(idx, { type: e.target.value })}>
                        {pools.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <button className="btn-icon" onClick={() => removeTemplate(idx)} style={{ color: '#ff3e3e', marginTop: '14px' }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {activeTab === 'types' && (
          <motion.main key="types" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="pool glass">
              <div className="pool-header" style={{ marginBottom: '24px' }}>
                <h2 className="pool-title">分类词条管理</h2>
                <button className="btn btn-primary" onClick={() => addType({ name: '新分类', color: '#ffffff' })}><Plus size={18} /> 添加分类</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pools.types.map((type) => (
                  <div key={type.id} className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `6px solid ${type.color}` }}>
                    <div style={{ flex: 2 }}><label className="label-mini">分类名称</label><input className="glass input-full" value={type.name} onChange={e => updateType(type.id, { name: e.target.value })} /></div>
                    <div style={{ flex: 1 }}><label className="label-mini">主题色</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="color" value={type.color} onChange={e => updateType(type.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '32px', height: '32px', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{type.color.toUpperCase()}</span>
                      </div>
                    </div>
                    <button className="btn-icon" onClick={() => removeType(type.id)} style={{ color: '#ff3e3e', marginTop: '14px' }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <div className="glass" style={{ marginTop: '32px', padding: '16px', fontSize: '0.85rem', color: 'var(--text-dim)', lineBreak: 'anywhere' }}>
                💡 修改分类词条会立即影响 Dashboard 的颜色显示。如果删除某个分类，原本属于该分类的块将回退到默认颜色。
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <AddBlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={(data) => addBlock('daily', modalContext.date, data)} DEFAULT_TEMPLATES={pools.templates} TYPES={pools.types} />
    </div>
  );
}

export default App;
