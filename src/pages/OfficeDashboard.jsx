import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useReports from '../controllers/useReports';
import AnnouncementManager from '../components/AnnouncementManager';
import MapDashboard from '../components/MapDashboard';

const typeColor = { electricity: '#FEF2F2', water: '#EFF6FF', news: '#F0FDF4', policy: '#FFFBEB' };
const typeBorder = { electricity: 'var(--danger)', water: 'var(--primary)', news: 'var(--secondary)', policy: 'var(--accent)' };

const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'reports';

  const { visibleReports, advanceStatus, updateStatusDirectly } = useReports('');


  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const kanbanCols = [
    { status: 'office_processing', label: 'Tiếp nhận từ Cán bộ', badgeClass: 'badge-verifying' },
  ];

  const getPageTitle = () => {
    switch(activeTab) {
      case 'reports': return 'Tiếp nhận & Xử lý Phản ánh';
      case 'announcements': return 'Đăng tải Thông báo';
      case 'map': return 'Bản đồ Sự cố';
      default: return 'Bảng Điều Khiển Văn Phòng';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">Thực hiện các nghiệp vụ văn phòng trực tiếp từ bảng điều khiển.</p>
      </div>

      {activeTab === 'reports' && (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Chờ VP xử lý</p>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--danger)' }}>{visibleReports.filter(r => (r.trang_thai || r.status) === 'office_processing').length}</h2>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Đã trả về</p>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--primary)' }}>{visibleReports.filter(r => ['processing', 'completed'].includes(r.trang_thai || r.status)).length}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', overflowX: 'auto' }}>
            {kanbanCols.map(col => (
              <div key={col.status} style={{ backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '1rem', minWidth: '240px' }}>
                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  <span>{col.label}</span>
                  <span className={`badge ${col.badgeClass}`}>{visibleReports.filter(r => (r.trang_thai || r.status) === col.status).length}</span>
                </h3>

                {visibleReports.filter(r => (r.trang_thai || r.status) === col.status).map(r => (
                  <div key={r.id} className="card" style={{ padding: '0.75rem', marginBottom: '0.75rem', borderTop: `3px solid ${r.urgent ? 'var(--danger)' : 'transparent'}` }}>
                    {r.urgent && <span className="badge" style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', marginBottom: '0.5rem', display: 'inline-block' }}>Cấp bách</span>}
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{r.tieu_de || r.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>SĐT: {r.so_dien_thoai || 'Trống'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>CM: {r.chuyen_muc || 'Không phân loại'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>{r.dia_chi || r.address}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-600)', margin: '0.5rem 0' }}>Hạn XL: {r.han_xu_ly || 'Chưa có'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>{r.ngay_gui || r.time}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => {
                        setSelectedReport(r);
                        setShowModal(true);
                      }}>
                        Xem chi tiết
                      </button>
                      {(r.trang_thai || r.status) === 'office_processing' && (
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => {
                          const msg = window.prompt("Nhập nội dung xử lý của VP (để gửi lại cán bộ):");
                          if (msg !== null) {
                            updateStatusDirectly(r.id, 'processing', msg);
                          }
                        }}>
                          Hoàn tất & Trả Cán bộ
                        </button>
                      )}
                    </div>
                    {(r.trang_thai || r.status) === 'completed' && (
                      <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                        Đã hoàn tất
                      </div>
                    )}
                  </div>
                ))}

                {visibleReports.filter(r => (r.trang_thai || r.status) === col.status).length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.8rem', padding: '1rem 0' }}>Không có phản ánh</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManager />
      )}

      {activeTab === 'map' && (
        <MapDashboard reports={visibleReports} />
      )}

      {showModal && selectedReport && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>Chi tiết phản ánh</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><strong>Người gửi:</strong> {selectedReport.citizen || selectedReport.ho_ten || 'Trống'}</div>
              <div><strong>SĐT:</strong> {selectedReport.so_dien_thoai || 'Trống'}</div>
              <div><strong>Ngày gửi:</strong> {selectedReport.ngay_gui || selectedReport.time}</div>
              <div><strong>Nguồn:</strong> {selectedReport.nguon || 'App người dân'}</div>
              <div><strong>Hình thức:</strong> {selectedReport.hinh_thuc || selectedReport.loai}</div>
              <div><strong>Lĩnh vực:</strong> {selectedReport.linh_vuc || 'Trống'}</div>
              <div><strong>Chuyên mục:</strong> {selectedReport.chuyen_muc || 'Trống'}</div>
              <div><strong>Hạn xử lý:</strong> <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{selectedReport.han_xu_ly || 'Trống'}</span></div>
              <div style={{ gridColumn: 'span 2' }}><strong>Địa chỉ:</strong> {selectedReport.dia_chi || selectedReport.address}</div>
            </div>

            <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{selectedReport.tieu_de || selectedReport.title}</h4>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedReport.noi_dung || selectedReport.content}</p>
            </div>

            {selectedReport.hinh_anh && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>Hình ảnh / Video bằng chứng:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {selectedReport.hinh_anh.toLowerCase().endsWith('.mp4') || selectedReport.hinh_anh.toLowerCase().match(/\.(mov|avi|webm)$/) ? (
                    <video src={selectedReport.hinh_anh.startsWith('http') ? selectedReport.hinh_anh : `http://localhost:3000${selectedReport.hinh_anh}`} controls style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <img src={selectedReport.hinh_anh.startsWith('http') ? selectedReport.hinh_anh : `http://localhost:3000${selectedReport.hinh_anh}`} alt="Bằng chứng" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--gray-200)' }} />
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OfficeDashboard;
