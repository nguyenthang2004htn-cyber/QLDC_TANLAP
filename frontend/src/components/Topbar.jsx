import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CircleUser, Bell, Menu } from 'lucide-react';
import useOfficialNotifications from '../controllers/useOfficialNotifications';

const Topbar = ({ onToggleMobile }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  
  // Hook thông báo cho cán bộ
  const officialNotifications = useOfficialNotifications(user?.managedArea || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = {
    citizen: 'var(--secondary)',
    official: '#2563EB',
    admin: 'var(--primary)',
  };

  // Lấy danh sách thông báo theo role
  const notificationsList = user?.role === 'official' 
    ? officialNotifications.notificationsList 
    : [];
  
  const unreadCount = user?.role === 'official'
    ? officialNotifications.newReportCount
    : 0;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          type="button" 
          className="mobile-toggle-btn"
          onClick={onToggleMobile}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
        >
          <Menu size={24} color="var(--dark)" />
        </button>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>
            Xin chào, <span style={{ color: roleColor[user?.role] }}>{user?.name}</span>!
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{user?.roleName}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Chuông thông báo cho cán bộ */}
        {user?.role === 'official' && (
          <div style={{ position: 'relative' }}>
            <button 
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Thông báo phản ánh mới"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                position: 'relative', 
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: showDropdown ? 'var(--gray-200)' : '#F1F5F9',
                transition: 'all 0.2s',
                width: '38px',
                height: '38px'
              }}
            >
              <Bell size={18} color="var(--dark)" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px white',
                  padding: '0 3px',
                  animation: 'pulse 2s infinite'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '120%',
                width: '360px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--gray-200)',
                zIndex: 9999,
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1F2937' }}>🔔 Phản ánh mới</span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-600)', margin: '0.25rem 0 0 0' }}>{unreadCount > 0 ? `${unreadCount} yêu cầu chưa đọc` : 'Không có yêu cầu mới'}</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      type="button"
                      onClick={() => {
                        officialNotifications.markAllAsRead();
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, padding: '0.4rem 0.6rem' }}
                    >
                      Đánh dấu tất cả
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notificationsList.length === 0 ? (
                    <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                      ✓ Không có yêu cầu mới nào
                    </div>
                  ) : (
                    notificationsList.map(n => (
                      <div 
                        key={n.id} 
                        style={{ 
                          padding: '0.75rem 1rem', 
                          borderBottom: '1px solid var(--gray-100)', 
                          backgroundColor: n.read ? '#FAFAFA' : '#FEF3F2',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer',
                          borderLeft: n.read ? 'none' : '3px solid #ef4444'
                        }}
                        onClick={() => {
                          officialNotifications.markAsRead(n.id);
                          setShowDropdown(false);
                          navigate('/official?tab=reports');
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.775rem', color: n.read ? 'var(--dark)' : '#ef4444', wordBreak: 'break-word', flex: 1 }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--gray-600)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{n.time}</span>
                        </div>
                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.725rem', color: 'var(--gray-700)', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        {n.phone && (
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--gray-600)' }}>
                            📞 {n.phone}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {notificationsList.length > 0 && (
                  <div style={{ padding: '0.5rem', borderTop: '1px solid var(--gray-200)', textAlign: 'center' }}>
                    <button 
                      type="button"
                      onClick={() => officialNotifications.clearNotifications()}
                      style={{ background: 'none', border: 'none', color: 'var(--gray-600)', fontSize: '0.7rem', cursor: 'pointer', padding: '0.3rem 0.6rem' }}
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="topbar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CircleUser size={32} color={roleColor[user?.role] || 'var(--gray-600)'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dark)' }}>{user?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{user?.roleName}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Topbar;
