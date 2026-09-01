import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllUsersApi, updateUserRoleApi, deleteUserApi } from '../services/api';
import useReports from '../controllers/useReports';
import { createUserApi } from '../services/api';

const SystemAdmin = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'users';

  const { visibleReports: reports } = useReports();
  const [allUsers, setAllUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    ten_dang_nhap: '',
    mat_khau: '',
    ho_ten: '',
    vai_tro: 'citizen',
    managed_area: '',
    cho_thuong_tru: '',
    que_quan: '',
    nam_sinh: ''
  });
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' });
  
  const fetchUsers = async () => {
    try {
      const data = await getAllUsersApi();
      if (Array.isArray(data)) setAllUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'users': return 'Quản lý Tài khoản (DB)';
      case 'data': return 'Sửa chữa Dữ liệu Gốc';
      case 'reports': return 'Dữ liệu Phản ánh (Raw)';
      default: return 'Quản Trị Hệ Thống (IT)';
    }
  };

  const handleCreateChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateMessage({ type: '', text: '' });

    if (!createFormData.ten_dang_nhap || !createFormData.mat_khau || !createFormData.ho_ten) {
      setCreateMessage({ type: 'error', text: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc' });
      return;
    }

    if (createFormData.vai_tro === 'official' && !createFormData.managed_area) {
      setCreateMessage({ type: 'error', text: 'Phải chỉ định khu vực quản lý cho cán bộ' });
      return;
    }

    try {
      await createUserApi(createFormData);
      setCreateMessage({ type: 'success', text: 'Tài khoản mới được tạo thành công!' });
      setCreateFormData({
        ten_dang_nhap: '',
        mat_khau: '',
        ho_ten: '',
        vai_tro: 'citizen',
        managed_area: '',
        cho_thuong_tru: '',
        que_quan: '',
        nam_sinh: ''
      });
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err) {
      setCreateMessage({ type: 'error', text: err.message || 'Lỗi khi tạo tài khoản' });
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">Dành riêng cho IT Admin: Can thiệp và sửa chữa dữ liệu hệ thống.</p>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Bảng dữ liệu Tài Khoản (TaiKhoan)</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Tổng số: {allUsers.length} tài khoản</span>
          </div>

            {/* Tạo Tài Khoản Mới */}
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid var(--gray-200)' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{ marginBottom: showCreateForm ? '1rem' : 0, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                {showCreateForm ? '❌ Hủy' : '➕ Thêm Tài Khoản Mới'}
              </button>

              {showCreateForm && (
                <div style={{ backgroundColor: '#F9FAFB', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginTop: '1rem' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>📝 Tạo Tài Khoản Mới</h4>

                  {createMessage.text && (
                    <div style={{
                      backgroundColor: createMessage.type === 'error' ? '#FEE2E2' : '#D1FAE5',
                      color: createMessage.type === 'error' ? '#B91C1C' : '#03543F',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      {createMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleCreateSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="input-group">
                        <label className="input-label">Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          name="ten_dang_nhap"
                          className="input-field"
                          placeholder="Ví dụ: nguyenvan"
                          value={createFormData.ten_dang_nhap}
                          onChange={handleCreateChange}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Mật khẩu <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="password"
                          name="mat_khau"
                          className="input-field"
                          placeholder="Nhập mật khẩu"
                          value={createFormData.mat_khau}
                          onChange={handleCreateChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                      <label className="input-label">Họ và tên <span style={{ color: 'red' }}>*</span></label>
                      <input
                        type="text"
                        name="ho_ten"
                        className="input-field"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={createFormData.ho_ten}
                        onChange={handleCreateChange}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="input-group">
                        <label className="input-label">Vai trò <span style={{ color: 'red' }}>*</span></label>
                        <select
                          name="vai_tro"
                          className="input-field"
                          value={createFormData.vai_tro}
                          onChange={handleCreateChange}
                          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)' }}
                        >
                          <option value="citizen">Công dân (citizen)</option>
                          <option value="official">Cán bộ (official)</option>
                          <option value="office">Văn phòng (office)</option>
                          <option value="admin">Quản trị viên (admin)</option>
                        </select>
                      </div>
                      {createFormData.vai_tro === 'official' && (
                        <div className="input-group">
                          <label className="input-label">Khu vực quản lý <span style={{ color: 'red' }}>*</span></label>
                          <input
                            type="text"
                            name="managed_area"
                            className="input-field"
                            placeholder="Ví dụ: Khu phố 1"
                            value={createFormData.managed_area}
                            onChange={handleCreateChange}
                            required={createFormData.vai_tro === 'official'}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="input-group">
                        <label className="input-label">Chỗ thường trú</label>
                        <input
                          type="text"
                          name="cho_thuong_tru"
                          className="input-field"
                          placeholder="Tùy chọn"
                          value={createFormData.cho_thuong_tru}
                          onChange={handleCreateChange}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Quê quán</label>
                        <input
                          type="text"
                          name="que_quan"
                          className="input-field"
                          placeholder="Tùy chọn"
                          value={createFormData.que_quan}
                          onChange={handleCreateChange}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Năm sinh</label>
                        <input
                          type="number"
                          name="nam_sinh"
                          className="input-field"
                          placeholder="Ví dụ: 1990"
                          value={createFormData.nam_sinh}
                          onChange={handleCreateChange}
                          min="1900"
                          max="2100"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                      ✅ Tạo Tài Khoản
                    </button>
                  </form>
                </div>
              )}
            </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-600)' }}>
                  <th style={{ padding: '1rem 0' }}>ID</th>
                  <th style={{ padding: '1rem 0' }}>Tên đăng nhập</th>
                  <th style={{ padding: '1rem 0' }}>Họ tên</th>
                  <th style={{ padding: '1rem 0' }}>Vai trò hiện tại</th>
                  <th style={{ padding: '1rem 0' }}>Khu vực QL</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>#{u.id}</td>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{u.ten_dang_nhap}</td>
                    <td style={{ padding: '1rem 0' }}>{u.ho_ten}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span className={`badge ${u.vai_tro === 'superadmin' ? 'badge-danger' : u.vai_tro === 'admin' ? 'badge-processing' : ['official', 'office'].includes(u.vai_tro) ? 'badge-verifying' : 'badge-completed'}`}>
                        {u.vai_tro}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>{u.managed_area || 'N/A'}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      {u.vai_tro !== 'superadmin' && (
                        <>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', fontSize: '0.8rem' }} onClick={async () => {
                            const newRole = window.prompt("Nhập vai trò mới (citizen, official, office, admin):", u.vai_tro);
                            if (newRole && ['citizen', 'official', 'office', 'admin'].includes(newRole)) {
                              let newArea = u.managed_area;
                              if (newRole === 'official') newArea = window.prompt("Nhập khu phố quản lý:", u.managed_area || 'Khu phố 1');
                              await updateUserRoleApi(u.id, { vai_tro: newRole, managed_area: newArea });
                              fetchUsers();
                            } else if (newRole) {
                              alert("Vai trò không hợp lệ!");
                            }
                          }}>Đổi quyền</button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} onClick={async () => {
                            if (window.confirm(`Chắc chắn xóa tài khoản ${u.ten_dang_nhap}? Hành động này xóa bản ghi trong DB!`)) {
                              await deleteUserApi(u.id);
                              fetchUsers();
                            }
                          }}>Xóa Data</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {allUsers.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gray-600)' }}>Đang tải dữ liệu...</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Công Cụ Sửa Chữa Dữ Liệu</h3>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h4 style={{ color: '#B91C1C', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Cảnh báo Nguy Hiểm
            </h4>
            <p style={{ color: '#991B1B', margin: 0, fontSize: '0.875rem' }}>
              Việc thao tác trực tiếp trên dữ liệu gốc (Raw Data) có thể gây ảnh hưởng nghiêm trọng đến hệ thống. Vui lòng chỉ sử dụng khi bạn hiểu rõ cấu trúc Database.
            </p>
          </div>
          <div className="grid-2" style={{ gap: '1rem' }}>
             <button className="btn btn-outline" onClick={() => alert('Mở bảng dữ liệu Phản ánh (Đang phát triển)')}>Quản lý DB Phản ánh (JSON/SQL)</button>
             <button className="btn btn-outline" onClick={() => alert('Mở bảng dữ liệu Cư dân (Đang phát triển)')}>Quản lý DB Cư dân (JSON/SQL)</button>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Kho Lưu Trữ Phản Ánh Của Người Dân</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Tổng số: {reports?.length || 0} phản ánh</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-600)' }}>
                  <th style={{ padding: '1rem 0' }}>Mã PA</th>
                  <th style={{ padding: '1rem 0' }}>Tiêu đề</th>
                  <th style={{ padding: '1rem 0' }}>Người gửi</th>
                  <th style={{ padding: '1rem 0' }}>Khu vực</th>
                  <th style={{ padding: '1rem 0' }}>Ngày gửi</th>
                  <th style={{ padding: '1rem 0' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {reports && reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>#{r.id}</td>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{r.tieu_de}</td>
                    <td style={{ padding: '1rem 0' }}>{r.citizen || `User #${r.nguoi_dan_id}`}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>{r.khu_pho}</td>
                    <td style={{ padding: '1rem 0' }}>{new Date(r.ngay_gui).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span className={`badge badge-${r.trang_thai || r.status}`}>
                        {r.trang_thai === 'pending' ? 'Tiếp nhận' : 
                         r.trang_thai === 'verifying' ? 'Xác thực' : 
                         r.trang_thai === 'processing' ? 'Đang xử lý' : 'Hoàn tất'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!reports || reports.length === 0) && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gray-600)' }}>Chưa có dữ liệu phản ánh...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdmin;
