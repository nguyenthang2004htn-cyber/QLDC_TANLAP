const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Lỗi khi gọi API');
  }
  return data;
};

export const loginApi = (payload) => request('/api/login', { method: 'POST', body: JSON.stringify(payload) });
export const registerApi = (payload) => request('/api/register', { method: 'POST', body: JSON.stringify(payload) });
export const requestOtpApi = (payload) => request('/api/forgot-password/request', { method: 'POST', body: JSON.stringify(payload) });
export const verifyOtpApi = (payload) => request('/api/forgot-password/verify', { method: 'POST', body: JSON.stringify(payload) });
export const resetPasswordApi = (payload) => request('/api/forgot-password/reset', { method: 'POST', body: JSON.stringify(payload) });

export const getProfile = (id) => request(`/api/profile/${id}`);
export const updateProfile = (id, payload) => request(`/api/profile/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const getResidents = (area) => request(`/api/residents${area ? `?area=${encodeURIComponent(area)}` : ''}`);
export const getReports = (area, citizenId) => request(`/api/reports${area ? `?area=${encodeURIComponent(area)}` : ''}${citizenId ? `${area ? '&' : '?'}citizenId=${encodeURIComponent(citizenId)}` : ''}`);
export const submitReport = (payload) => request('/api/reports', { method: 'POST', body: JSON.stringify(payload) });
export const uploadFileApi = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || 'Lỗi khi tải file lên');
    }
    return data;
  });
};
export const updateReportStatus = (reportId, status, message = null) => request(`/api/reports/${reportId}`, { method: 'PATCH', body: JSON.stringify({ trang_thai: status, message }) });
export const getAnnouncements = () => request('/api/announcements');
export const createAnnouncement = (payload) => request('/api/announcements', { method: 'POST', body: JSON.stringify(payload) });
export const updateAnnouncement = (id, payload) => request(`/api/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteAnnouncementApi = (id) => request(`/api/announcements/${id}`, { method: 'DELETE' });
export const createResident = (payload) => request('/api/residents', { method: 'POST', body: JSON.stringify(payload) });
export const getProcedures = () => request('/api/procedures');

// Hộ Gia Đình API
export const submitHoGiaDinh = (payload) => request('/api/hogiadinh', { method: 'POST', body: JSON.stringify(payload) });
export const getMyHoGiaDinh = (chu_ho_id) => request(`/api/hogiadinh/me?chu_ho_id=${chu_ho_id}`);
export const getAllHoGiaDinh = (area) => request(`/api/hogiadinh${area ? `?managedArea=${encodeURIComponent(area)}` : ''}`);
export const updateHoGiaDinh = (id, payload) => request(`/api/hogiadinh/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const updateHoGiaDinhStatus = (id, status) => request(`/api/hogiadinh/${id}/status`, { method: 'PUT', body: JSON.stringify({ trang_thai: status }) });
export const deleteHoGiaDinh = (id) => request(`/api/hogiadinh/${id}`, { method: 'DELETE' });

// Admin API
export const getAllUsersApi = () => request('/api/admin/users');
export const updateUserRoleApi = (id, payload) => request(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteUserApi = (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' });
export const createUserApi = (payload) => request('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
