import { useState, useEffect, useCallback } from 'react';
import { getMyHoGiaDinh, getAllHoGiaDinh, submitHoGiaDinh, updateHoGiaDinhStatus, updateHoGiaDinh, deleteHoGiaDinh } from '../services/api';

const useHoGiaDinh = (chu_ho_id = null, isOfficial = false, managedArea = '') => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHouseholds = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];
      if (isOfficial) {
        data = await getAllHoGiaDinh(managedArea);
      } else if (chu_ho_id) {
        data = await getMyHoGiaDinh(chu_ho_id);
      }
      setHouseholds(data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hộ gia đình:', error);
    } finally {
      setLoading(false);
    }
  }, [chu_ho_id, isOfficial, managedArea]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  const addHousehold = async (payload) => {
    const res = await submitHoGiaDinh(payload);
    await fetchHouseholds();
    return res;
  };

  const updateStatus = async (id, status) => {
    const res = await updateHoGiaDinhStatus(id, status);
    await fetchHouseholds();
    return res;
  };

  const editHousehold = async (id, payload) => {
    const res = await updateHoGiaDinh(id, payload);
    await fetchHouseholds();
    return res;
  };

  const removeHousehold = async (id) => {
    const res = await deleteHoGiaDinh(id);
    await fetchHouseholds();
    return res;
  };

  return { households, loading, addHousehold, updateStatus, editHousehold, removeHousehold, refetch: fetchHouseholds };
};

export default useHoGiaDinh;
