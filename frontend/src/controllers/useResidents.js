import { useState, useEffect, useCallback } from 'react';
import { getResidents as fetchResidents, createResident } from '../services/api';
import { getFilteredByArea } from '../utils/localDatabase';

/**
 * Controller hook xử lý CRUD cư dân
 * Tách business logic ra khỏi OfficialDashboard.jsx và AdminDashboard.jsx (View)
 */
const useResidents = (managedArea = '') => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadResidents = useCallback(async () => {
    try {
      const data = await fetchResidents(managedArea);
      setResidents(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu cư dân:', error);
    }
  }, [managedArea]);

  useEffect(() => {
    if (managedArea !== undefined) loadResidents();
  }, [loadResidents, managedArea]);

  const addResident = async () => {
    const name = window.prompt('Họ tên chủ hộ:');
    if (!name) return;
    const address = window.prompt('Địa chỉ:') || 'Đang cập nhật';
    const phone = window.prompt('Số điện thoại:') || 'Đang cập nhật';
    const area = window.prompt('Khu vực / Khu phố (ví dụ: Khu phố 2):') || 'Chưa xác định';

    try {
      await createResident({
        ho_ten: name,
        dia_chi: address,
        so_thanh_vien: 1,
        trang_thai: 'Thường trú',
        khu_pho: area,
        chu_ho_id: 1,
      });
      loadResidents();
    } catch (error) {
      console.error('Lỗi tạo cư dân:', error);
    }
  };

  const deleteResident = (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa hộ dân này?')) {
      setResidents((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filteredResidents = getFilteredByArea(residents, managedArea).filter((r) =>
    `${r.ho_ten || r.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${r.dia_chi || r.address}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    residents,
    filteredResidents,
    searchTerm,
    setSearchTerm,
    loadResidents,
    addResident,
    deleteResident,
  };
};

export default useResidents;
