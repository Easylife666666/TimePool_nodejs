import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, GripVertical } from 'lucide-react';

const TimeBlock = ({ block, onRemove, onDragStart }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`time-block glass ${block.type}`}
      draggable
      onDragStart={(e) => onDragStart(e, block.id)}
    >
      <div className="block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="block-name">{block.name}</div>
        <button 
          onClick={() => onRemove(block.id)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="block-meta">
        <span>{block.duration}h</span>
        <span>{block.type}</span>
        {block.priority && <span>P{block.priority}</span>}
      </div>
    </motion.div>
  );
};

export default TimeBlock;
