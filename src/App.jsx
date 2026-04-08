import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, RotateCcw } from 'lucide-react';
import { usePoolManager } from './hooks/usePoolManager';
import TimeBlock from './components/TimeBlock';
import AddBlockModal from './components/AddBlockModal';
import './index.css';

function App() {
  const { 
    pools, addBlock, removeBlock, moveBlock, 
    getWeekRange, getDayTotal, getWeeklyTotal 
  } = usePoolManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState({ scope: 'weekly', date: null });

  const weekRange = getWeekRange();

  const handleDragStart = (e, blockId, fromScope, fromDate) => {
    e.dataTransfer.setData('blockId', blockId);
    e.dataTransfer.setData('fromScope', fromScope);
    e.dataTransfer.setData('fromDate', fromDate || '');
  };

  const handleDrop = (e, toScope, toDate) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    const fromScope = e.dataTransfer.getData('fromScope');
    const fromDate = e.dataTransfer.getData('fromDate');

    if (fromScope === toScope && fromDate === toDate) return;

    moveBlock(fromScope, fromDate, toScope, toDate, blockId);
  };

  const openAddModal = (scope, date = null) => {
    setModalContext({ scope, date });
    setIsModalOpen(true);
  };

  return (
    <div className="app">
      <header style={{ padding: '40px 24px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #00f2ff, #7e5bef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TIME POOL
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>动态时间流动管理系统</p>
      </header>

      <main className="pool-container">
        {/* Weekly Pool */}
        <section 
          className="pool glass"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'weekly', null)}
        >
          <div className="pool-header">
            <div>
              <h2 className="pool-title">星期池子</h2>
              <div className="pool-stats">流动储备: {getWeeklyTotal()}h</div>
            </div>
            <button className="btn btn-primary" onClick={() => openAddModal('weekly')}>
              <Plus size={18} />
            </button>
          </div>
          <div className="block-list">
            <AnimatePresence>
              {pools.weekly.map(block => (
                <TimeBlock 
                  key={block.id} 
                  block={block} 
                  onRemove={(id) => removeBlock('weekly', null, id)}
                  onDragStart={(e, id) => handleDragStart(e, id, 'weekly', null)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Daily Pools */}
        <div style={{ flex: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {weekRange.map((dateStr, idx) => {
            const isToday = idx === 0;
            const dayBlocks = pools.daily[dateStr] || [];
            const dayTotal = getDayTotal(dateStr);

            return (
              <section 
                key={dateStr}
                className={`pool glass ${isToday ? 'today' : ''}`}
                style={{ border: isToday ? '1px solid var(--primary)' : '' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'daily', dateStr)}
              >
                <div className="pool-header">
                  <div>
                    <h3 className="pool-title" style={{ fontSize: '1rem' }}>
                      {isToday ? '今天' : dateStr.split('-').slice(1).join('/')}
                    </h3>
                    <div className="pool-stats">已用: {dayTotal}h / 24h</div>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    onClick={() => openAddModal('daily', dateStr)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((dayTotal / 24) * 100, 100)}%` }}
                    style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}
                  />
                </div>

                <div className="block-list" style={{ marginTop: '12px' }}>
                  <AnimatePresence>
                    {dayBlocks.map(block => (
                      <TimeBlock 
                        key={block.id} 
                        block={block} 
                        onRemove={(id) => removeBlock('daily', dateStr, id)}
                        onDragStart={(e, id) => handleDragStart(e, id, 'daily', dateStr)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <AddBlockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(data) => addBlock(modalContext.scope, modalContext.date, data)}
      />

      <footer style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--work)' }} /> 工作</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sleep)' }} /> 睡眠</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--other)' }} /> 其他</span>
        </div>
        &copy; 2026 Time Pool App. Built for Flow.
      </footer>
    </div>
  );
}

export default App;
