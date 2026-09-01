import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestOtpApi, verifyOtpApi, resetPasswordApi } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Yêu cầu lấy mã OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const res = await requestOtpApi({ username: username.trim() });
      setSuccess(`Đã gửi mã OTP. Mã OTP của bạn là: ${res.mockOtp}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không thể yêu cầu OTP');
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await verifyOtpApi({ username: username.trim(), otp: otp.trim() });
      setSuccess('Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({ username: username.trim(), otp: otp.trim(), newPassword: newPassword.trim() });
      setSuccess('Đặt lại mật khẩu thành công! Chuyển hướng đến đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: 0, letterSpacing: '-0.05em' }}>Quên Mật Khẩu</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {step === 1 && 'Nhập tên đăng nhập để nhận mã OTP'}
            {step === 2 && 'Nhập mã OTP đã được gửi cho bạn'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản'}
          </p>
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

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Tên đăng nhập</label>
              <input type="text" className="input-field" placeholder="Nhập tài khoản..." value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Mã xác thực (OTP)</label>
              <input type="text" className="input-field" placeholder="Nhập 6 số..." value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
                Quay lại
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label className="input-label">Mật khẩu mới</label>
              <input type="password" className="input-field" placeholder="Nhập mật khẩu mới..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Xác nhận mật khẩu</label>
              <input type="password" className="input-field" placeholder="Nhập lại mật khẩu..." value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
