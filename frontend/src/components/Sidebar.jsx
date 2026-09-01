import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { X } from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  if (!user) return null;

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  // Helper cho active class
  const getNavClass = (tabKey, defaultTab) => {
    if (!currentTab && tabKey === defaultTab) return 'nav-item active';
    if (currentTab === tabKey) return 'nav-item active';
    return 'nav-item';
  };

  return (
    <>
      {/* Overlay cho Mobile */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen && setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', fontWeight: 800, margin: 0, letterSpacing: '-0.05em' }}>DCid</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--gray-600)' }}>Quản Lý Công Dân Số</span>
          </div>
          <button 
            type="button" 
            className="mobile-toggle-btn"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={24} color="var(--dark)" />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {/* Menu của Người Dân */}
          {user.role === 'citizen' && (
            <>
              <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gray-600)', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.5rem' }}>Dịch vụ Công dân</div>
              <NavLink to="/citizen?tab=report" onClick={handleNavClick} className={getNavClass('report', 'report')}>Gửi Phản Ánh Sự cố</NavLink>
              <NavLink to="/citizen?tab=myreports" onClick={handleNavClick} className={getNavClass('myreports', null)}>Lịch sử & Phản hồi</NavLink>
              <NavLink to="/citizen?tab=news" onClick={handleNavClick} className={getNavClass('news', null)}>Thông Báo Phường</NavLink>
              <NavLink to="/citizen?tab=chatbot" onClick={handleNavClick} className={getNavClass('chatbot', null)}>Hỏi đáp cùng Trợ lý AI</NavLink>
              <NavLink to="/citizen?tab=links" onClick={handleNavClick} className={getNavClass('links', null)}>Liên kết Dịch vụ công</NavLink>
            </>
          )}

          {/* Menu của Cán bộ */}
          {user.role === 'official' && (
            <>
              <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gray-600)', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.5rem' }}>Tác nghiệp Cán bộ</div>
              <NavLink to="/official?tab=reports" onClick={handleNavClick} className={getNavClass('reports', 'reports')}>Tiếp nhận & Xử lý Phản ánh</NavLink>
              <NavLink to="/official?tab=announcements" onClick={handleNavClick} className={getNavClass('announcements', null)}>Đăng tải Thông báo</NavLink>
              <NavLink to="/official?tab=map" onClick={handleNavClick} className={getNavClass('map', null)}>Bản đồ Sự cố</NavLink>
            </>
          )}

          {/* Menu của Chủ tịch */}
          {user.role === 'admin' && (
            <>
              <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gray-600)', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.5rem' }}>Quản trị Hệ thống</div>
              <NavLink to="/admin?tab=map" onClick={handleNavClick} className={getNavClass('map', 'map')}>Bản đồ Sự cố & Dân cư</NavLink>
              <NavLink to="/admin?tab=reports" onClick={handleNavClick} className={getNavClass('reports', null)}>Theo dõi Phản ánh</NavLink>
              <NavLink to="/admin?tab=archive" onClick={handleNavClick} className={getNavClass('archive', null)}>Kho Lưu Trữ Phản Ánh</NavLink>
              <NavLink to="/admin?tab=stats" onClick={handleNavClick} className={getNavClass('stats', null)}>Báo cáo Thống kê</NavLink>
              <NavLink to="/admin?tab=meetings" onClick={handleNavClick} className={getNavClass('meetings', null)}>Lịch Họp Giao Ban</NavLink>
            </>
          )}

          {/* Menu của IT Admin */}
          {user.role === 'superadmin' && (
            <>
              <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: '#B91C1C', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.5rem' }}>Bảo Trì Hệ Thống</div>
              <NavLink to="/system-admin?tab=users" onClick={handleNavClick} className={getNavClass('users', 'users')} style={{ color: '#991B1B' }}>Quản lý Tài Khoản (DB)</NavLink>
              <NavLink to="/system-admin?tab=data" onClick={handleNavClick} className={getNavClass('data', null)} style={{ color: '#991B1B' }}>Sửa Chữa Dữ Liệu Gốc</NavLink>
              <NavLink to="/system-admin?tab=reports" onClick={handleNavClick} className={getNavClass('reports', null)} style={{ color: '#991B1B' }}>Lưu Trữ Phản Ánh</NavLink>
            </>
          )}
        </nav>

        {/* Hiển thị vai trò */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-200)' }}>
          <NavLink to="/profile" onClick={handleNavClick} className="nav-item" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Cài đặt cá nhân
          </NavLink>
          <span className={`badge ${user.role === 'superadmin' ? 'badge-danger' : user.role === 'admin' ? 'badge-processing' : user.role === 'official' ? 'badge-verifying' : 'badge-completed'}`}>
            {user.roleName}
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
