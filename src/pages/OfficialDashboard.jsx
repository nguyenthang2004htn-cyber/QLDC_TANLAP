import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useReports from '../controllers/useReports';
import AnnouncementManager from '../components/AnnouncementManager';
import useHoGiaDinh from '../controllers/useHoGiaDinh';
import MapDashboard from '../components/MapDashboard';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Home } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (iconComponent, color) => {
  const iconHtml = renderToString(React.cloneElement(iconComponent, { color, size: 24, strokeWidth: 2.5 }));
  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 4px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); width: 32px; height: 32px;">${iconHtml}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};
const residentIcon = createCustomIcon(<Home />, '#3B82F6');

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={position} icon={residentIcon}></Marker> : null;
}

const typeColor = { electricity: '#FEF2F2', water: '#EFF6FF', news: '#F0FDF4', policy: '#FFFBEB' };
const typeBorder = { electricity: 'var(--danger)', water: 'var(--primary)', news: 'var(--secondary)', policy: 'var(--accent)' };

const OfficialDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'reports';

  const { visibleReports, advanceStatus, updateStatusDirectly } = useReports(user?.managedArea || '');
  const { households, updateStatus: updateHgdStatus, removeHousehold, addHousehold, editHousehold } = useHoGiaDinh(null, true, user?.managedArea || '');

  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Household management states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showHgdModal, setShowHgdModal] = useState(false);
  const [hgdForm, setHgdForm] = useState(null);

  const filteredHouseholds = households.filter(hgd => {
    const matchSearch = hgd.ten_chu_ho.toLowerCase().includes(searchTerm.toLowerCase()) || (hgd.dien_thoai || '').includes(searchTerm);
    const matchStatus = filterStatus === 'All' || hgd.trang_thai === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSaveHgd = async (e) => {
    e.preventDefault();
    try {
      if (hgdForm.ho_gia_dinh_id) {
        await editHousehold(hgdForm.ho_gia_dinh_id, hgdForm);
      } else {
        await addHousehold({ 
           chu_ho_id: 0, 
           ten_chu_ho: hgdForm.ten_chu_ho, 
           dia_chi: hgdForm.dia_chi, 
           so_thanh_vien: hgdForm.so_thanh_vien, 
           khu_vuc: user?.managedArea || 'Khu phố 1', 
           nam_sinh: hgdForm.nam_sinh,
           lat: hgdForm.lat,
           lng: hgdForm.lng,
           ghi_chu: hgdForm.ghi_chu 
        });
      }
      setShowHgdModal(false);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const kanbanCols = [
    { status: 'pending', label: 'B1. Tiếp nhận', badgeClass: 'badge-pending' },
    { status: 'verifying', label: 'B2. Xác thực', badgeClass: 'badge-verifying' },
    { status: 'office_processing', label: 'Chờ VP Xử lý', badgeClass: 'badge-verifying' },
    { status: 'processing', label: 'B3. Đang xử lý', badgeClass: 'badge-processing' },
    { status: 'completed', label: 'B4. Hoàn tất', badgeClass: 'badge-completed' },
  ];

  const getPageTitle = () => {
    switch(activeTab) {
      case 'reports': return 'Tiếp nhận & Xử lý Phản ánh';
      case 'hogiadinh': return 'Quản lý Hộ Gia Đình';
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
                      {(r.trang_thai || r.status) === 'pending' && (
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => advanceStatus(r.id)}>
                          Chuyển tiếp
                        </button>
                      )}
                      {(r.trang_thai || r.status) === 'verifying' && (
                        <>
                          <button className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => updateStatusDirectly(r.id, 'processing')}>
                            Tự Xử lý
                          </button>
                          <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => updateStatusDirectly(r.id, 'office_processing')}>
                            Chuyển VP
                          </button>
                        </>
                      )}
                      {(r.trang_thai || r.status) === 'office_processing' && (
                         <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', width: '100%', textAlign: 'center', fontWeight: 600 }}>Văn phòng đang giải quyết</div>
                      )}
                      {(r.trang_thai || r.status) === 'processing' && (
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => {
                          const msg = window.prompt("Nhập nội dung phản hồi cho người dân (Kết quả xử lý):");
                          if (msg !== null) {
                            advanceStatus(r.id, msg);
                          }
                        }}>
                          Hoàn tất
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



      {activeTab === 'hogiadinh' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Danh sách Hộ Gia Đình</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Tìm tên chủ hộ, SĐT..." 
                className="input-field" 
                style={{ padding: '0.5rem', minWidth: '200px', margin: 0 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select 
                className="input-field" 
                style={{ padding: '0.5rem', margin: 0 }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
              <button className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('list')}>Danh sách</button>
              <button className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('map')}>Bản đồ</button>
                  <button className="btn btn-primary" onClick={() => { setHgdForm({ ten_chu_ho: '', dia_chi: '', so_thanh_vien: 1, ghi_chu: '', nam_sinh: new Date().getFullYear(), lat: null, lng: null }); setShowHgdModal(true); }}>
                + Thêm Hộ
              </button>
            </div>
          </div>
          {viewMode === 'list' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Chủ hộ</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Năm sinh</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>SĐT</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Địa chỉ</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Thành viên</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Trạng thái</th>
                  <th style={{ padding: '1rem', color: 'var(--gray-600)' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredHouseholds.map(hgd => (
                  <tr key={hgd.ho_gia_dinh_id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div 
                        style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => alert(`Ghi chú của hộ ${hgd.ten_chu_ho}:\n\n${hgd.ghi_chu || 'Không có ghi chú'}`)}
                        title="Nhấn để xem ghi chú"
                      >
                        {hgd.ten_chu_ho}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{hgd.ngay_khai_bao ? new Date(hgd.ngay_khai_bao).toLocaleDateString() : ''}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{hgd.nam_sinh || 'Trống'}</td>
                    <td style={{ padding: '1rem' }}>{hgd.dien_thoai || 'Trống'}</td>
                    <td style={{ padding: '1rem' }}>{hgd.dia_chi}</td>
                    <td style={{ padding: '1rem' }}>{hgd.so_thanh_vien}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${hgd.trang_thai === 'Đã duyệt' ? 'badge-completed' : (hgd.trang_thai === 'Từ chối' ? 'badge-processing' : 'badge-pending')}`}>
                        {hgd.trang_thai}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {hgd.trang_thai === 'Chờ duyệt' && (
                          <>
                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--secondary)', borderColor: 'var(--secondary)' }} onClick={() => updateHgdStatus(hgd.ho_gia_dinh_id, 'Đã duyệt')}>Duyệt</button>
                            <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => updateHgdStatus(hgd.ho_gia_dinh_id, 'Từ chối')}>Từ chối</button>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setHgdForm(hgd); setShowHgdModal(true); }}>Sửa</button>
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => {
                          if(window.confirm('Bạn có chắc chắn muốn xóa?')) {
                            removeHousehold(hgd.ho_gia_dinh_id);
                          }
                        }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHouseholds.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-600)' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {viewMode === 'map' && (
            <div style={{ height: '600px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-300)', position: 'relative', zIndex: 0 }}>
              <MapContainer center={[10.9333, 108.1000]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {filteredHouseholds.map(hgd => {
                  if (hgd.lat && hgd.lng) {
                    return (
                      <Marker key={hgd.ho_gia_dinh_id} position={[hgd.lat, hgd.lng]} icon={residentIcon}>
                        <Popup>
                          <div style={{ padding: '0.25rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--primary)' }}>{hgd.ten_chu_ho}</h4>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Năm sinh:</strong> {hgd.nam_sinh || 'Trống'}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Địa chỉ:</strong> {hgd.dia_chi}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>SĐT:</strong> {hgd.dien_thoai || 'Trống'}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Thành viên:</strong> {hgd.so_thanh_vien}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Ghi chú:</strong> {hgd.ghi_chu || 'Không có'}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </MapContainer>
            </div>
          )}
        </div>
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

      {showHgdModal && hgdForm && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {hgdForm.ho_gia_dinh_id ? 'Sửa thông tin hộ gia đình' : 'Thêm hộ gia đình mới'}
            </h2>
            <form onSubmit={handleSaveHgd}>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Tên chủ hộ *</label>
                  <input type="text" className="input-field" value={hgdForm.ten_chu_ho} onChange={e => setHgdForm({...hgdForm, ten_chu_ho: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Năm sinh *</label>
                  <input type="number" min="1900" max={new Date().getFullYear()} className="input-field" value={hgdForm.nam_sinh || ''} onChange={e => setHgdForm({...hgdForm, nam_sinh: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Địa chỉ *</label>
                <input type="text" className="input-field" value={hgdForm.dia_chi} onChange={e => setHgdForm({...hgdForm, dia_chi: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Số thành viên *</label>
                <input type="number" min="1" className="input-field" value={hgdForm.so_thanh_vien} onChange={e => setHgdForm({...hgdForm, so_thanh_vien: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Danh sách thành viên / Ghi chú</label>
                <textarea className="input-field" rows="3" value={hgdForm.ghi_chu} onChange={e => setHgdForm({...hgdForm, ghi_chu: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Ghim vị trí nhà trên bản đồ (Tùy chọn)</label>
                <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-300)' }}>
                  <MapContainer center={[10.9333, 108.1000]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <LocationPicker position={hgdForm.lat && hgdForm.lng ? {lat: hgdForm.lat, lng: hgdForm.lng} : null} setPosition={(pos) => setHgdForm({...hgdForm, lat: pos.lat, lng: pos.lng})} />
                  </MapContainer>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                  {hgdForm.lat && hgdForm.lng ? `Đã chọn: ${hgdForm.lat.toFixed(5)}, ${hgdForm.lng.toFixed(5)}` : 'Nhấn vào bản đồ để sửa vị trí'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowHgdModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OfficialDashboard;
