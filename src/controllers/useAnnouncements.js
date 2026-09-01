import { useState, useEffect, useCallback } from 'react';
import { getAnnouncements as fetchAnnouncements, createAnnouncement, updateAnnouncement as updateAnnouncementApi, deleteAnnouncementApi } from '../services/api';

/**
 * Controller hook xử lý CRUD thông báo
 * Tách business logic ra khỏi các trang Dashboard
 */
const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu thông báo:', error);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const addAnnouncement = async (payload) => {
    try {
      const announcement = await createAnnouncement(payload);
      setAnnouncements((prev) => [
        {
          ...announcement,
          title: announcement.tieu_de,
          content: announcement.noi_dung,
          type: announcement.loai,
        },
        ...prev,
      ]);
      return true;
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
      throw error;
    }
  };

  const updateAnnouncement = async (id, payload) => {
    try {
      await updateAnnouncementApi(id, payload);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id || a.thong_bao_id === id
            ? { ...a, tieu_de: payload.tieu_de, noi_dung: payload.noi_dung, loai: payload.loai, title: payload.tieu_de, content: payload.noi_dung, type: payload.loai }
            : a
        )
      );
      return true;
    } catch (error) {
      console.error('Lỗi cập nhật thông báo:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await deleteAnnouncementApi(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id && a.thong_bao_id !== id));
      return true;
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
      throw error;
    }
  };

  return {
    announcements,
    loadAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};

export default useAnnouncements;
