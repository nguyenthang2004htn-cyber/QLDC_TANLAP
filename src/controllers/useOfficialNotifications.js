import { useState, useEffect, useCallback, useRef } from 'react';
import { getReports as fetchReports } from '../services/api';

const getWsUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE || '';
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch (e) {}
  }
  return `ws://${window.location.hostname}:3000`;
};

const WS_URL = getWsUrl();

/**
 * Hook xử lý thông báo phản ánh mới cho cán bộ
 * Thông báo khi có phản ánh mới (pending) trong vùng quản lý
 */
const useOfficialNotifications = (managedArea = '') => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [newReportCount, setNewReportCount] = useState(0);
  const prevReportsRef = useRef([]);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports(managedArea, '');
      
      // Tìm các phản ánh mới (pending) trong vùng quản lý
      if (prevReportsRef.current && prevReportsRef.current.length > 0) {
        const newNotifications = [];
        
        data.forEach(report => {
          const prevReport = prevReportsRef.current.find(r => r.id === report.id);
          const currentStatus = report.trang_thai || report.status;
          
          // Nếu là phản ánh mới (không có trong danh sách cũ) và ở trạng thái 'pending'
          if (!prevReport && currentStatus === 'pending') {
            newNotifications.push({
              id: Date.now() + Math.random(),
              reportId: report.id,
              title: `Phản ánh mới từ ${report.ho_ten || report.citizen || 'người dân'}`,
              message: `Tiêu đề: "${report.tieu_de || report.title}". Địa chỉ: ${report.dia_chi || report.address || 'Trống'}`,
              phone: report.so_dien_thoai || 'Trống',
              time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              read: false,
              reportData: report
            });
          }
        });

        if (newNotifications.length > 0) {
          setNotificationsList(prev => {
            const updated = [...newNotifications, ...prev];
            // Giữ tối đa 50 thông báo
            if (updated.length > 50) {
              updated.splice(50);
            }
            localStorage.setItem(`official_notifications_${managedArea || 'all'}`, JSON.stringify(updated));
            return updated;
          });
          setNewReportCount(newNotifications.length);
          
          // Phát âm thanh thông báo
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(800, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.12, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            }
          } catch(e) { /* Bỏ qua nếu trình duyệt chặn autoplay */ }
        }
      }
      
      prevReportsRef.current = data;
    } catch (e) {
      console.error('Lỗi tải phản ánh ở useOfficialNotifications:', e);
    }
  }, [managedArea]);

  useEffect(() => {
    // Load từ localStorage
    try {
      const saved = localStorage.getItem(`official_notifications_${managedArea || 'all'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotificationsList(parsed);
        setNewReportCount(parsed.filter(n => !n.read).length);
      }
    } catch (e) {}

    loadReports();

    // Lắng nghe WebSocket
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'system_notification' && data.action === 'REPORT_UPDATED') {
          console.log('Có cập nhật phản ánh mới từ server, đang tải lại dữ liệu...');
          loadReports();
        }
      } catch (err) {}
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [loadReports, managedArea]);

  const markAllAsRead = () => {
    setNotificationsList(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(`official_notifications_${managedArea || 'all'}`, JSON.stringify(updated));
      return updated;
    });
    setNewReportCount(0);
  };

  const markAsRead = (notificationId) => {
    setNotificationsList(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(`official_notifications_${managedArea || 'all'}`, JSON.stringify(updated));
      return updated;
    });
    setNewReportCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setNotificationsList([]);
    setNewReportCount(0);
    localStorage.removeItem(`official_notifications_${managedArea || 'all'}`);
  };

  return {
    notificationsList,
    newReportCount,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    loadReports,
  };
};

export default useOfficialNotifications;
