import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, ChevronUp, ChevronDown, Check, RotateCcw, Clock } from 'lucide-react';

const TimeBlock = ({ block, selected, onSelect, onRemove, onUpdate, onDragStart, types = [] }) => {
  const effective = Math.max(0, parseFloat((block.duration - (block.completedTime || 0)).toFixed(1)));
  const progressPct = ( (block.completedTime || 0) / block.duration ) * 100;

  // Find the color for this block's type
  const typeInfo = types.find(t => t.id === block.type) || { color: 'var(--primary)', name: block.type };
  const blockColor = typeInfo.color;

  const adjustCompleted = (delta) => {
    const newVal = Math.max(0, Math.min(block.duration, (block.completedTime || 0) + delta));
    onUpdate({ completedTime: newVal });
  };

  const adjustDuration = (delta) => {
    const newVal = Math.max(0.5, block.duration + delta);
    onUpdate({ duration: newVal });
  };

  const setFull = () => onUpdate({ completedTime: block.duration });
  const setClear = () => onUpdate({ completedTime: 0 });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        borderColor: selected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
        boxShadow: selected ? `0 0 15px ${blockColor}33` : 'none'
      }}
      className={`time-block glass ${selected ? 'selected' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
      style={{ 
        position: 'relative',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeft: `4px solid ${blockColor}`
      }}
      onClick={(e) => {
        if (e.target.closest('button')) return;
        onSelect();
      }}
    >
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'rgba(255,255,255,0.05)', width: '100%', pointerEvents: 'none', zIndex: 0
      }}>
        <div style={{
          height: '100%', width: `${progressPct}%`, background: blockColor, opacity: 0.4, transition: 'width 0.3s'
        }} />
      </div>

      <div className="block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={selected} 
            onChange={onSelect} 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              accentColor: blockColor, 
              width: '14px', 
              height: '14px',
              cursor: 'pointer'
            }} 
          />
          <div className="block-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            {progressPct >= 100 && <CheckCircle2 size={14} color={blockColor} />}
            {block.name}
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          className="btn-icon"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="block-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <Clock size={12} /> <span>总时长</span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '4px', padding: '0 4px' }}>
              <button className="adjust-btn-mini" onClick={(e) => { e.stopPropagation(); adjustDuration(-0.5); }}>-</button>
              <span style={{ minWidth: '24px', textAlign: 'center' }}>{block.duration}h</span>
              <button className="adjust-btn-mini" onClick={(e) => { e.stopPropagation(); adjustDuration(0.5); }}>+</button>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: blockColor }}>剩余 {effective}h</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>已完成量</span>
           <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--surface)', borderRadius: '6px', padding: '2px' }}>
            <button className="adjust-btn" onClick={(e) => { e.stopPropagation(); setClear(); }} title="清空"><RotateCcw size={10} /></button>
            <button className="adjust-btn" onClick={(e) => { e.stopPropagation(); adjustCompleted(-0.5); }}><ChevronDown size={10} /></button>
            <span style={{ fontSize: '10px', minWidth: '20px', textAlign: 'center', color: 'white' }}>{block.completedTime || 0}</span>
            <button className="adjust-btn" onClick={(e) => { e.stopPropagation(); adjustCompleted(0.5); }}><ChevronUp size={10} /></button>
            <button className="adjust-btn" onClick={(e) => { e.stopPropagation(); setFull(); }} title="加满"><Check size={10} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeBlock;
