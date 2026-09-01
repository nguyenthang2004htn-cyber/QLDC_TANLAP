import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useReports from '../controllers/useReports';
import useAnnouncements from '../controllers/useAnnouncements';
import MapDashboard from '../components/MapDashboard';

const typeColor = { electricity: '#FEF2F2', water: '#EFF6FF', news: '#F0FDF4', policy: '#FFFBEB' };
const typeBorder = { electricity: 'var(--danger)', water: 'var(--primary)', news: 'var(--secondary)', policy: 'var(--accent)' };

const OfficialDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'reports';

  const { visibleReports, advanceStatus } = useReports(user?.managedArea || '');
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();

  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const kanbanCols = [
    { status: 'pending', label: 'B1. Tiếp nhận', badgeClass: 'badge-pending' },
    { status: 'verifying', label: 'B2. Xác thực', badgeClass: 'badge-verifying' },
    { status: 'processing', label: 'B3. Đang xử lý', badgeClass: 'badge-processing' },
    { status: 'completed', label: 'B4. Hoàn tất', badgeClass: 'badge-completed' },
  ];

  const getPageTitle = () => {
    switch(activeTab) {
      case 'reports': return 'Tiếp nhận & Xử lý Phản ánh';
      case 'announcements': return 'Đăng tải Thông báo Phường';
      default: return 'Bảng Điều Khiển Cán Bộ';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">Thực hiện các nghiệp vụ quản lý trực tiếp từ bảng điều khiển.</p>
      </div>

      {activeTab === 'reports' && (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Phản ánh mới</p>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--danger)' }}>{visibleReports.filter(r => (r.trang_thai || r.status) === 'pending').length}</h2>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Đang xử lý</p>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--primary)' }}>{visibleReports.filter(r => ['processing', 'verifying'].includes(r.trang_thai || r.status)).length}</h2>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--secondary)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Hoàn tất</p>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', color: 'var(--secondary)' }}>{visibleReports.filter(r => (r.trang_thai || r.status) === 'completed').length}</h2>
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
                      {(r.trang_thai || r.status) !== 'completed' && (
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => {
                          const currentStatus = r.trang_thai || r.status;
                          if (currentStatus === 'processing') {
                            const msg = window.prompt("Nhập nội dung phản hồi cho người dân (Kết quả xử lý):");
                            if (msg !== null) {
                              advanceStatus(r.id, msg);
                            }
                          } else {
                            advanceStatus(r.id);
                          }
                        }}>
                          Chuyển tiếp
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
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Thông Báo Đã Đăng Tải</h3>
              <button className="btn btn-primary" onClick={addAnnouncement}>Đăng thông báo mới</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ padding: '1rem', backgroundColor: typeColor[a.loai] || '#F9FAFB', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${typeBorder[a.loai] || 'var(--gray-300)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem' }}>{a.tieu_de || a.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--dark)', margin: '0 0 0.25rem' }}>{a.noi_dung || a.content}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{a.ngay_dang || a.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Sửa</button>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => deleteAnnouncement(a.id)}>Xóa</button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>Chưa có thông báo nào.</p>}
            </div>
          </div>
        </div>
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

export default OfficialDashboard;
