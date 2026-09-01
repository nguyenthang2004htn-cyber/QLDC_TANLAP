import { useState, useEffect, useCallback } from 'react';
import { getReports as fetchReports, updateReportStatus, submitReport as submitReportApi } from '../services/api';
import { getFilteredByArea } from '../utils/localDatabase';

const getWsUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE || '';
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch (e) {
      // fallback if VITE_API_BASE is relative or malformed
    }
  }
  return `ws://${window.location.hostname}:3000`;
};

const WS_URL = getWsUrl();

/**
 * Controller hook xử lý logic phản ánh
 * Tách business logic ra khỏi OfficialDashboard.jsx (View)
 */
const useReports = (managedArea = '', citizenId = '') => {
  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports(managedArea, citizenId);
      setReports(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu phản ánh:', error);
    }
  }, [managedArea, citizenId]);

  useEffect(() => {
    if (managedArea !== undefined || citizenId) loadReports();
    
    // Khởi tạo WebSocket lắng nghe thay đổi
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'system_notification' && data.action === 'REPORT_UPDATED') {
          console.log('Có cập nhật phản ánh mới từ server, đang tải lại dữ liệu...');
          loadReports();
          
          // Phát âm thanh thông báo nhẹ nhàng
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
              osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Trượt âm nhẹ lên
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            }
          } catch(e) { /* Bỏ qua nếu trình duyệt chặn autoplay */ }
        }
      } catch (err) {
        // bỏ qua parse error
      }
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [loadReports, managedArea, citizenId]);

  const advanceStatus = async (id, message = null) => {
    const order = ['pending', 'verifying', 'processing', 'completed'];
    const report = reports.find((r) => r.id === id);
    if (!report) return;

    const currentStatus = report.trang_thai || report.status;
    const nextStatus = order[Math.min(order.indexOf(currentStatus) + 1, order.length - 1)];

    try {
      await updateReportStatus(id, nextStatus, message);
      setReports((prev) =>
        prev.map((r) => ({
          ...r,
          trang_thai: r.id === id ? nextStatus : r.trang_thai,
          ket_qua_xu_ly: (r.id === id && message) ? message : r.ket_qua_xu_ly,
        }))
      );
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái phản ánh:', error);
    }
  };

  const addReport = async (payload) => {
    try {
      const newReport = await submitReportApi(payload);
      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      console.error('Lỗi thêm phản ánh:', error);
      throw error;
    }
  };

  const visibleReports = getFilteredByArea(reports, managedArea);

  return {
    reports,
    visibleReports,
    loadReports,
    advanceStatus,
    addReport,
  };
};

export default useReports;
