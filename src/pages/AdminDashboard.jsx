import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AuthContext } from '../context/AuthContext';
import { getFilteredByArea } from '../utils/localDatabase';
import useReports from '../controllers/useReports';
import AnnouncementManager from '../components/AnnouncementManager';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho icon của Leaflet trong React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const statusBadge = { pending: 'badge-pending', verifying: 'badge-verifying', processing: 'badge-processing', completed: 'badge-completed' };

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'map';

  const { reports, visibleReports } = useReports('');
  const [meetings, setMeetings] = useState([
    { id: 1, time: '08:00', date: '28/05/2026', title: 'Triển khai phòng chống sốt xuất huyết', members: 'Chủ tịch, Trạm Y tế, Trưởng 5 Khu phố' },
    { id: 2, time: '14:00', date: '30/05/2026', title: 'Sơ kết công tác an ninh trật tự tháng 5', members: 'Chủ tịch, Công an Phường, Bảo vệ dân phố' }
  ]);

  const mapCenter = [10.9333, 108.1000];

  const handleDeleteMeeting = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch họp này?")) {
      setMeetings(meetings.filter(m => m.id !== id));
    }
  };

  const handleAddMeeting = () => {
    const title = window.prompt("Nhập chủ đề cuộc họp:");
    if (title) {
      setMeetings([...meetings, {
        id: Date.now(), time: '08:00',
        date: new Date().toLocaleDateString('vi-VN'),
        title, members: 'Chủ tịch, Các ban ngành'
      }]);
    }
  };



  const getPageTitle = () => {
    switch(activeTab) {
      case 'map': return 'Bản đồ Quản lý Toàn cảnh';
      case 'reports': return 'Danh sách Phản ánh Tổng hợp';
      case 'archive': return 'Kho Lưu Trữ Phản Ánh';
      case 'stats': return 'Báo cáo Thống kê Phường';
      case 'meetings': return 'Lịch Họp Ban Ngành';
      case 'announcements': return 'Đăng tải Thông báo Phường';
      default: return 'Bảng Điều Khiển Quản Trị';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">Kiểm soát tổng quan và chỉ đạo công tác địa bàn phường.</p>
      </div>

      {activeTab === 'map' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Bản đồ phân bổ hộ dân & Sự cố</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }}></div> Hộ dân</span>
              <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></div> Điểm nóng sự cố</span>
            </div>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
              />
              <Marker position={[10.9350, 108.1020]}><Popup>Hộ gia đình: Nguyễn Văn A <br/> Khu phố 1</Popup></Marker>
              <Marker position={[10.9310, 108.0980]}><Popup>Hộ gia đình: Trần Thị B <br/> Khu phố 2</Popup></Marker>
              <Marker position={[10.9333, 108.1050]} icon={redIcon}><Popup><b style={{color: 'red'}}>Sự cố:</b> Tai nạn giao thông <br/> Trạng thái: Đang xử lý</Popup></Marker>
              <Marker position={[10.9380, 108.0950]} icon={redIcon}><Popup><b style={{color: 'red'}}>Sự cố:</b> Bể ống nước <br/> Trạng thái: Mới tiếp nhận</Popup></Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Toàn bộ phản ánh trên địa bàn</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>{visibleReports.length} phản ánh</span>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {visibleReports.map(r => (
              <div key={r.id} className="card" style={{ padding: '1rem', borderLeft: r.urgent ? '4px solid var(--danger)' : '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>{r.title}</h4>
                    <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.9rem' }}><strong>Người phản ánh:</strong> {r.citizen}</p>
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--gray-600)', fontSize: '0.9rem' }}><strong>Địa chỉ:</strong> {r.address}</p>
                  </div>
                  <span className={`badge ${statusBadge[r.status] || 'badge-pending'}`} style={{ height: 'fit-content' }}>{r.statusText}</span>
                </div>
              </div>
            ))}
            {visibleReports.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-600)' }}>Không có phản ánh.</div>}
          </div>
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Kho Lưu Trữ Phản Ánh</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Tổng cộng: {reports.length} bản ghi</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-600)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Mã PA</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Người gửi</th>
                  <th style={{ padding: '1rem 0.5rem' }}>SĐT</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Nội dung chính</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Hình thức / Lĩnh vực</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Ngày gửi</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--gray-600)' }}>#{r.id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{r.ho_ten || r.citizen || 'Ẩn danh'}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{r.so_dien_thoai || 'Trống'}</td>
                    <td style={{ padding: '1rem 0.5rem', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{r.tieu_de || r.title}</div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--gray-600)' }}>{r.noi_dung || r.content}</div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div>{r.hinh_thuc || r.loai || 'Trống'}</div>
                      <div style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>{r.linh_vuc || 'Trống'}</div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>{r.ngay_gui || r.time}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`badge ${statusBadge[r.trang_thai || r.status] || 'badge-pending'}`}>{r.trang_thai || r.statusText || r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-600)' }}>Kho lưu trữ trống.</div>}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Tổng số hộ dân</p>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>3,450</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>+12 hộ trong tháng này</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Thu nhập TB / người</p>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>7.5 Tr</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>+5% so với năm ngoái</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Hộ nghèo / Cận nghèo</p>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>124</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Giảm 15 hộ so với năm ngoái</p>
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Lịch họp Ban ngành Phường</h3>
            <button className="btn btn-primary" onClick={handleAddMeeting}>Tạo lịch họp</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-600)' }}><th style={{ padding: '1rem 0' }}>Thời gian</th><th style={{ padding: '1rem 0' }}>Chủ đề</th><th style={{ padding: '1rem 0' }}>Thành phần</th><th style={{ padding: '1rem 0', textAlign: 'right' }}>Hành động</th></tr></thead>
              <tbody>
                {meetings.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '1rem 0', width: '120px' }}><strong>{m.time}</strong><br/><span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{m.date}</span></td>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{m.title}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>{m.members}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', fontSize: '0.8rem' }}>Sửa</button>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => handleDeleteMeeting(m.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {meetings.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gray-600)' }}>Không có lịch họp nào.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManager />
      )}

    </div>
  );
};

export default AdminDashboard;
