import { useState, useEffect, useCallback } from 'react';
import { getAnnouncements as fetchAnnouncements, createAnnouncement } from '../services/api';

/**
 * Controller hook xử lý CRUD thông báo
 * Tách business logic ra khỏi OfficialDashboard.jsx (View)
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

  const addAnnouncement = async () => {
    const title = window.prompt('Tiêu đề thông báo:');
    if (!title) return;
    const content = window.prompt('Nội dung thông báo:');
    if (!content) return;

    try {
      const announcement = await createAnnouncement({
        tieu_de: title,
        noi_dung: content,
        loai: 'news',
      });
      setAnnouncements((prev) => [
        {
          ...announcement,
          title: announcement.tieu_de,
          content: announcement.noi_dung,
          type: announcement.loai,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
    }
  };

  const deleteAnnouncement = (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa thông báo này?')) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return {
    announcements,
    loadAnnouncements,
    addAnnouncement,
    deleteAnnouncement,
  };
};

export default useAnnouncements;
