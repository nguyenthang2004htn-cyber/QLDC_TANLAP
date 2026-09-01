import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../services/api';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [residence, setResidence] = useState('');
  const [hometown, setHometown] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || user.ho_ten || '');
      setPassword('');
      setResidence(user.residence || user.cho_thuong_tru || '');
      setHometown(user.hometown || user.que_quan || '');
      setBirthYear(user.birthYear || user.nam_sinh || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ho_ten: name,
      cho_thuong_tru: residence,
      que_quan: hometown,
      nam_sinh: birthYear ? parseInt(birthYear, 10) : null,
    };

    if (password.trim()) {
      payload.mat_khau = password;
    }

    try {
      await updateProfile(user.id, payload);
      const updates = { name, residence, hometown, birthYear };
      if (password.trim()) updates.password = password;
      updateUser(updates);
      setSuccess(true);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSuccess(false);
      setError(err.message || 'Lỗi khi cập nhật hồ sơ.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cài đặt Thông tin Cá nhân</h1>
        <p className="page-subtitle">Cập nhật tên, mật khẩu, nơi thường trú, quê quán và năm sinh.</p>
      </div>

      {success && (
        <div style={{ backgroundColor: '#DEF7EC', color: '#03543F', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #A7F3D0' }}>
          Thông tin cá nhân đã được cập nhật thành công.
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Tên đầy đủ</label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu mới</label>
            <input type="password" className="input-field" placeholder="Để trống nếu không đổi" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Nơi thường trú</label>
            <input type="text" className="input-field" value={residence} onChange={(e) => setResidence(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Quê quán</label>
            <input type="text" className="input-field" value={hometown} onChange={(e) => setHometown(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Năm sinh</label>
            <input type="number" className="input-field" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} min="1900" max="2100" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', padding: '0.75rem 1.25rem' }}>
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
