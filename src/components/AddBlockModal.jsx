import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddBlockModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    type: 'work',
    priority: '3',
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      duration: parseFloat(formData.duration) || 0,
      priority: parseInt(formData.priority) || 3
    });
    setFormData({ name: '', duration: '', type: 'work', priority: '3', note: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass" style={{ padding: '32px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>添加新块</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            className="glass" 
            style={{ padding: '12px', border: 'none', color: 'white' }} 
            placeholder="名称" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            className="glass" 
            style={{ padding: '12px', border: 'none', color: 'white' }} 
            placeholder="时长 (小时)" 
            type="number" 
            step="0.5"
            value={formData.duration}
            onChange={e => setFormData({...formData, duration: e.target.value})}
            required
          />
          <select 
            className="glass" 
            style={{ padding: '12px', border: 'none', color: 'white', background: 'var(--surface)' }}
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="work">工作 (Work)</option>
            <option value="sleep">睡觉 (Sleep)</option>
            <option value="other">其他 (Other)</option>
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }}>取消</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>添加</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlockModal;
