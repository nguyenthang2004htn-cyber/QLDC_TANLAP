const STORAGE_KEYS = {
  reports: 'smartward_reports',
  residents: 'smartward_residents',
  announcements: 'smartward_announcements',
};

const defaultReports = [
  { id: 1, title: 'Cúp nước tại hẻm 45', type: 'Mất nước sinh hoạt', address: 'Hẻm 45, Khu phố 2', status: 'pending', statusText: 'Tiếp nhận', citizen: 'Nguyễn Văn A', time: '10 phút trước', urgent: true, area: 'Khu phố 2' },
  { id: 2, title: 'Tai nạn giao thông ngã tư', type: 'Tai nạn giao thông', address: 'Ngã tư đường A - B, Khu phố 1', status: 'verifying', statusText: 'Xác thực', citizen: 'Trần Thị B', time: '1 giờ trước', urgent: false, area: 'Khu phố 1' },
  { id: 3, title: 'Chó thả rông cắn người', type: 'Chó thả rông', address: 'Công viên tổ 3, Khu phố 2', status: 'processing', statusText: 'Đang xử lý', citizen: 'Lê Văn C', time: '3 giờ trước', urgent: false, area: 'Khu phố 2' },
  { id: 4, title: 'Hát karaoke ồn ào quá 23h', type: 'Hát karaoke quá giờ', address: '28 Đường E, Khu phố 3', status: 'completed', statusText: 'Hoàn tất', citizen: 'Phạm Thị D', time: 'Hôm qua', urgent: false, area: 'Khu phố 3' },
  { id: 5, title: 'Tranh chấp ranh giới đất', type: 'Tranh chấp', address: 'Hẻm 10, Đường D, Khu phố 1', status: 'pending', statusText: 'Tiếp nhận', citizen: 'Hoàng Văn E', time: 'Hôm qua', urgent: false, area: 'Khu phố 1' },
];

const defaultResidents = [
  { id: 1, name: 'Nguyễn Văn A', address: '123 Đường A, Khu phố 1', phone: '0901234567', status: 'Thường trú', idCard: '026xxxxxx', area: 'Khu phố 1' },
  { id: 2, name: 'Trần Thị B', address: '45 Hẻm B, Khu phố 2', phone: '0912345678', status: 'Tạm trú', idCard: '026xxxxxy', area: 'Khu phố 2' },
  { id: 3, name: 'Lê Văn C', address: '78 Đường C, Khu phố 3', phone: '0987654321', status: 'Thường trú', idCard: '026xxxxxz', area: 'Khu phố 3' },
];

const defaultAnnouncements = [
  { id: 1, title: 'Cúp điện Khu phố 1, 2', content: 'Thời gian: 08:00 - 16:00 ngày 28/05/2026. Lý do: Bảo trì trạm biến áp.', date: '26/05/2026', type: 'electricity' },
  { id: 2, title: 'Thông báo chi trả trợ cấp tháng 5', content: 'Kính mời hộ dân diện chính sách đến nhận trợ cấp sáng 28/05.', date: '25/05/2026', type: 'news' },
];

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failures in unpredictable environments
  }
};

export const getReports = () => readStorage(STORAGE_KEYS.reports, defaultReports);
export const saveReports = (reports) => writeStorage(STORAGE_KEYS.reports, reports);

export const getResidents = () => readStorage(STORAGE_KEYS.residents, defaultResidents);
export const saveResidents = (residents) => writeStorage(STORAGE_KEYS.residents, residents);

export const getAnnouncements = () => readStorage(STORAGE_KEYS.announcements, defaultAnnouncements);
export const saveAnnouncements = (announcements) => writeStorage(STORAGE_KEYS.announcements, announcements);

export const getFilteredByArea = (items, managedArea) => {
  if (!managedArea || managedArea.toLowerCase().includes('toàn')) return items;
  const normalized = managedArea.toLowerCase();
  return items.filter(item => {
    const candidate = `${item.khu_pho || ''} ${item.area || ''} ${item.address || ''} ${item.dia_chi || ''}`.toLowerCase();
    return candidate.includes(normalized);
  });
};
