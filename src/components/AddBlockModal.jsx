import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

const AddBlockModal = (props) => {
  const { isOpen, onClose, onAdd, DEFAULT_TEMPLATES, TYPES = [] } = props;
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    completedTime: '0',
    type: TYPES[0]?.id || 'work',
    priority: '3',
    note: ''
  });

  if (!isOpen) return null;

  const applyTemplate = (tpl) => {
    setFormData({
      name: tpl.name,
      duration: tpl.duration.toString(),
      completedTime: (tpl.completedTime || 0).toString(),
      type: tpl.type,
      priority: tpl.priority.toString(),
      note: tpl.note || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      duration: parseFloat(formData.duration) || 0,
      completedTime: parseFloat(formData.completedTime) || 0,
      priority: parseInt(formData.priority) || 3
    });
    setFormData({ name: '', duration: '', completedTime: '0', type: TYPES[0]?.id || 'work', priority: '3', note: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass" style={{ padding: '32px', width: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>添加新块</h2>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DEFAULT_TEMPLATES?.map(tpl => (
            <button 
              key={tpl.name}
              type="button"
              className="glass"
              style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              onClick={() => applyTemplate(tpl)}
            >
              +{tpl.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            className="glass" 
            style={{ padding: '12px', border: 'none', color: 'white' }} 
            placeholder="名称" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>总时长 (h)</label>
              <input 
                className="glass" 
                style={{ padding: '12px', border: 'none', color: 'white', width: '100%' }} 
                type="number" 
                step="0.5"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>已完成 (h)</label>
              <input 
                className="glass" 
                style={{ padding: '12px', border: 'none', color: 'white', width: '100%' }} 
                type="number" 
                step="0.5"
                value={formData.completedTime}
                onChange={e => setFormData({...formData, completedTime: e.target.value})}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '4px' }}>分类 (Type)</label>
            <select 
              className="glass" 
              style={{ padding: '12px', border: 'none', color: 'white', background: 'var(--surface)' }}
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              {TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
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
