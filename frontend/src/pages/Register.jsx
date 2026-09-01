import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    mat_khau: '',
    confirm_mat_khau: '',
    ho_ten: '',
    cho_thuong_tru: '',
    que_quan: '',
    nam_sinh: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.mat_khau !== formData.confirm_mat_khau) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await registerApi({
        ten_dang_nhap: formData.ten_dang_nhap.trim(),
        mat_khau: formData.mat_khau.trim(),
        ho_ten: formData.ho_ten.trim(),
        cho_thuong_tru: formData.cho_thuong_tru,
        que_quan: formData.que_quan,
        nam_sinh: formData.nam_sinh || null
      });
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0, letterSpacing: '-0.05em' }}>Đăng Ký Tài Khoản</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Trở thành công dân số DCid</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#D1FAE5', color: 'var(--secondary-hover)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label className="input-label">Tên đăng nhập <span style={{color: 'red'}}>*</span></label>
            <input type="text" name="ten_dang_nhap" className="input-field" placeholder="Nhập tên đăng nhập..." value={formData.ten_dang_nhap} onChange={handleChange} required />
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Mật khẩu <span style={{color: 'red'}}>*</span></label>
              <input type="password" name="mat_khau" className="input-field" placeholder="Nhập mật khẩu" value={formData.mat_khau} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label">Xác nhận <span style={{color: 'red'}}>*</span></label>
              <input type="password" name="confirm_mat_khau" className="input-field" placeholder="Nhập lại mật khẩu" value={formData.confirm_mat_khau} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Họ và tên <span style={{color: 'red'}}>*</span></label>
            <input type="text" name="ho_ten" className="input-field" placeholder="Ví dụ: Nguyễn Văn A" value={formData.ho_ten} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="input-label">Chỗ thường trú <span style={{color: 'red'}}>*</span></label>
            <input type="text" name="cho_thuong_tru" className="input-field" placeholder="Ví dụ: 123 Đường A, Khu phố 1" value={formData.cho_thuong_tru} onChange={handleChange} required />
          </div>
          
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Quê quán</label>
              <input type="text" name="que_quan" className="input-field" placeholder="Tuỳ chọn" value={formData.que_quan} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Năm sinh</label>
              <input type="number" name="nam_sinh" className="input-field" placeholder="Ví dụ: 1990" value={formData.nam_sinh} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--gray-600)' }}>Đã có tài khoản? </span>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
