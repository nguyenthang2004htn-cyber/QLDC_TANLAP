import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../controllers/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await handleLogin(username.trim(), password.trim());
    } catch (err) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0, letterSpacing: '-0.05em' }}>DCid</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Hệ thống Quản Lý Công Dân Số</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label className="input-label">Tên đăng nhập / Số điện thoại</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nhập tên tài khoản hoặc số điện thoại..." 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Mật khẩu</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Nhập mật khẩu..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}>
            Đăng Nhập
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Đăng ký tài khoản
            </Link>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Quên mật khẩu?
            </Link>
          </div>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          <p><strong>Tài khoản thử nghiệm (Mật khẩu: 123):</strong></p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Dân cư: <code style={{ backgroundColor: 'var(--gray-100)', padding: '0.2rem' }}>dancu</code></li>
            <li>Cán bộ: <code style={{ backgroundColor: 'var(--gray-100)', padding: '0.2rem' }}>canbo</code></li>
            <li>Chủ tịch: <code style={{ backgroundColor: 'var(--gray-100)', padding: '0.2rem' }}>chutich</code></li>
            <li>IT Admin: <code style={{ backgroundColor: 'var(--gray-100)', padding: '0.2rem' }}>it_admin</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
