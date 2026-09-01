import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import useAnnouncements from '../controllers/useAnnouncements';

const typeColor = { electricity: '#FEF2F2', water: '#EFF6FF', news: '#F0FDF4', policy: '#FFFBEB' };
const typeBorder = { electricity: 'var(--danger)', water: 'var(--primary)', news: 'var(--secondary)', policy: 'var(--accent)' };
const typeLabels = { electricity: 'Điện', water: 'Nước', news: 'Tin tức', policy: 'Chính sách' };

const AnnouncementManager = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    tieu_de: '',
    noi_dung: '',
    loai: 'news'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ tieu_de: '', noi_dung: '', loai: 'news' });
    setShowModal(true);
  };

  const handleOpenEdit = (announcement) => {
    setEditingId(announcement.id || announcement.thong_bao_id);
    setFormData({
      tieu_de: announcement.tieu_de || announcement.title || '',
      noi_dung: announcement.noi_dung || announcement.content || '',
      loai: announcement.loai || announcement.type || 'news'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAnnouncement(editingId, formData);
      } else {
        await addAnnouncement(formData);
      }
      setShowModal(false);
    } catch (err) {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Thông Báo Đã Đăng Tải</h3>
          <button className="btn btn-primary" onClick={handleOpenAdd}>+ Đăng thông báo mới</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(a => (
            <div key={a.id || a.thong_bao_id} style={{ padding: '1rem', backgroundColor: typeColor[a.loai || a.type] || '#F9FAFB', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${typeBorder[a.loai || a.type] || 'var(--gray-300)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'white', border: `1px solid ${typeBorder[a.loai || a.type]}`, color: typeBorder[a.loai || a.type], marginBottom: '0.5rem', display: 'inline-block' }}>
                  {typeLabels[a.loai || a.type] || 'Khác'}
                </span>
                <h4 style={{ margin: '0 0 0.25rem' }}>{a.tieu_de || a.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--dark)', margin: '0 0 0.25rem', whiteSpace: 'pre-wrap' }}>{a.noi_dung || a.content}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{a.ngay_dang || a.date ? new Date(a.ngay_dang || a.date).toLocaleString('vi-VN') : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleOpenEdit(a)}>Sửa</button>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => handleDelete(a.id || a.thong_bao_id)}>Xóa</button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>Chưa có thông báo nào.</p>}
        </div>
      </div>

      {showModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {editingId ? 'Sửa thông báo' : 'Thêm thông báo mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Tiêu đề *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.tieu_de} 
                  onChange={e => setFormData({...formData, tieu_de: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Loại thông báo *</label>
                <select 
                  className="input-field" 
                  value={formData.loai} 
                  onChange={e => setFormData({...formData, loai: e.target.value})} 
                  required
                >
                  <option value="news">Tin tức chung</option>
                  <option value="electricity">Lịch cúp điện</option>
                  <option value="water">Lịch cúp nước</option>
                  <option value="policy">Chính sách mới</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Nội dung *</label>
                <textarea 
                  className="input-field" 
                  rows="5" 
                  value={formData.noi_dung} 
                  onChange={e => setFormData({...formData, noi_dung: e.target.value})} 
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thông báo</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AnnouncementManager;
