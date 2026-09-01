import React, { useState, useContext, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useChat from '../controllers/useChat';
import useReports from '../controllers/useReports';
import useHoGiaDinh from '../controllers/useHoGiaDinh';
import { uploadFileApi } from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Home } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (iconComponent, color) => {
  const iconHtml = renderToString(React.cloneElement(iconComponent, { color, size: 24, strokeWidth: 2.5 }));
  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 4px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); width: 32px; height: 32px;">${iconHtml}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};
const residentIcon = createCustomIcon(<Home />, '#3B82F6');

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={position} icon={residentIcon}></Marker> : null;
}

/* ===== DỮ LIỆU MẪU ===== */
const notifications = [
  { id: 1, type: 'electricity', title: 'Cúp điện Khu phố 1, 2', content: 'Thời gian: 08:00 - 16:00, ngày 28/05/2026. Lý do: Bảo trì trạm biến áp 110kV Phan Thiết.', link: 'https://evn.com.vn', date: '26/05/2026', urgent: true },
  { id: 2, type: 'water', title: 'Cúp nước toàn Phường', content: 'Thời gian: 22:00 ngày 29/05 đến 04:00 ngày 30/05. Lý do: Súc xả tuyến ống chính đường Lê Hồng Phong.', link: 'https://capnuocbinhthuan.vn', date: '26/05/2026', urgent: true },
  { id: 3, type: 'news', title: 'Thông báo chi trả trợ cấp xã hội tháng 5/2026', content: 'Kính mời các hộ dân thuộc diện chính sách đến UBND Phường nhận trợ cấp vào sáng 28/05/2026 (từ 8h - 11h30).', date: '25/05/2026', urgent: false },
  { id: 4, type: 'news', title: 'Thăm và tặng quà gia đình chính sách', content: 'Sáng nay 25/05, đại diện Phường đã thăm hỏi và tặng quà 12 gia đình có công. Mỗi phần quà trị giá 500.000đ.', date: '25/05/2026', urgent: false },
  { id: 5, type: 'policy', title: 'Nghị quyết 68/NQ-CP về hỗ trợ người lao động', content: 'Người lao động bị ngừng việc từ 14 ngày trở lên được hỗ trợ 1.000.000đ/người. Đăng ký tại UBND Phường trước 30/06/2026.', date: '20/05/2026', urgent: false },
];

const statusBadge = { processing: 'badge-processing', completed: 'badge-completed', verifying: 'badge-verifying', pending: 'badge-pending' };
const statusTextMap = { pending: 'Mới gửi', verifying: 'Đang xác thực', processing: 'Đang xử lý', completed: 'Hoàn tất' };
const typeBg = { electricity: '#FEF2F2', water: '#EFF6FF', news: '#F0FDF4', policy: '#FFFBEB' };
const typeBorder = { electricity: 'var(--danger)', water: 'var(--primary)', news: 'var(--secondary)', policy: 'var(--accent)' };

const QUICK_QUESTIONS = [
  'Thủ tục đăng ký khai sinh mới?',
  'Cách đổi giấy phép lái xe?',
  'Làm thế nào để gửi phản ánh sự cố?',
  'Thủ tục đăng ký tạm trú, tạm vắng?',
  'Tra cứu hồ sơ BHXH online ở đâu?',
  'Cách nộp hồ sơ đề nghị trợ cấp xã hội?',
];

/* ===== COMPONENT CHAT NHÚNG (WebSocket) ===== */
const InlineChat = () => {
  const { messages, isLoading, isConnected, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;
    sendMessage(msg.trim());
    setInput('');
  };

  const renderText = (text) =>
    text
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
      {/* Connection status */}
      {!isConnected && (
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', textAlign: 'center', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
          Đang kết nối đến server...
        </div>
      )}

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: isConnected ? 'var(--radius-md) var(--radius-md) 0 0' : '0', border: '1px solid var(--gray-200)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
            display: 'flex', gap: '0.5rem', maxWidth: '85%',
            flexDirection: msg.isBot ? 'row' : 'row-reverse',
            alignItems: 'flex-end'
          }}>
            {msg.isBot && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                AI
              </div>
            )}
            <div style={{
              backgroundColor: msg.isBot ? 'white' : 'var(--primary)',
              color: msg.isBot ? 'var(--dark)' : 'white',
              padding: '0.875rem 1.1rem',
              borderRadius: msg.isBot ? '0 1rem 1rem 1rem' : '1rem 0 1rem 1rem',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              border: msg.isBot ? '1px solid var(--gray-200)' : 'none'
            }}>
              <div dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
              AI
            </div>
            <div style={{ backgroundColor: 'white', padding: '0.875rem 1.1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--gray-200)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Câu hỏi gợi ý */}
      <div style={{ padding: '0.75rem', backgroundColor: 'white', borderLeft: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)', overflowX: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => handleSend(q)} disabled={isLoading}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary)'; }}
          >{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', border: '1px solid var(--gray-200)', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.5rem', backgroundColor: 'white', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
        <input
          type="text" placeholder="Nhập câu hỏi của bạn..."
          className="input-field" style={{ padding: '0.75rem 1rem', flex: 1 }}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={isLoading}
        />
        <button className="btn btn-primary" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
          onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
          Gửi
        </button>
      </div>
      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
};

/* ===== MAIN COMPONENT ===== */
const CitizenPortal = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'report';

  const { reports, addReport } = useReports('', user?.id);
  const { households, addHousehold } = useHoGiaDinh(user?.id, false);

  const [hgdName, setHgdName] = useState(user?.name || '');
  const [hgdBirthYear, setHgdBirthYear] = useState(user?.nam_sinh || new Date().getFullYear());
  const [hgdAddress, setHgdAddress] = useState('');
  const [hgdMembers, setHgdMembers] = useState(1);
  const [hgdWard, setHgdWard] = useState('Khu phố 1');
  const [hgdNote, setHgdNote] = useState('');
  const [hgdLocation, setHgdLocation] = useState(null); // {lat, lng}
  const [hgdSubmitted, setHgdSubmitted] = useState(false);

  const handleSubmitHgd = async (e) => {
    e.preventDefault();
    try {
      await addHousehold({ 
        chu_ho_id: user?.id, 
        ten_chu_ho: hgdName, 
        dia_chi: hgdAddress, 
        so_thanh_vien: hgdMembers, 
        khu_vuc: hgdWard,
        nam_sinh: hgdBirthYear,
        lat: hgdLocation?.lat,
        lng: hgdLocation?.lng,
        ghi_chu: hgdNote 
      });
      setHgdSubmitted(true);
      setHgdAddress(''); setHgdMembers(1); setHgdNote(''); setHgdLocation(null);
      setTimeout(() => setHgdSubmitted(false), 4000);
    } catch (err) {
      alert("Lỗi khi gửi khai báo: " + err.message);
    }
  };

  const [reportType, setReportType] = useState('');
  const [reportAddress, setReportAddress] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportPhone, setReportPhone] = useState(user?.phone || '');
  const [reportCategory, setReportCategory] = useState('Lĩnh vực môi trường');
  const [reportField, setReportField] = useState('Tài nguyên - Môi trường');
  const [reportForm, setReportForm] = useState('Phản ánh');
  const [reportWard, setReportWard] = useState('Khu phố 1');
  const [reportPublic, setReportPublic] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // File Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportType || !reportAddress || !reportDesc) return;
    
    setUploading(true);
    try {
      let uploadedPath = null;
      if (selectedFile) {
        const uploadResult = await uploadFileApi(selectedFile);
        uploadedPath = uploadResult.fileUrl; // relative path e.g. /uploads/123456.jpg
      }

      // Tự động tính hạn xử lý (cộng thêm 7 ngày)
      const hanXuLyDate = new Date();
      hanXuLyDate.setDate(hanXuLyDate.getDate() + 7);
      const han_xu_ly = hanXuLyDate.toISOString();

      await addReport({
        tieu_de: reportType,
        noi_dung: reportDesc,
        loai: reportForm === 'Khẩn cấp' ? 'urgent' : 'normal',
        dia_chi: reportAddress,
        khu_pho: user?.managedArea || '',
        nguoi_dan_id: user?.id,
        so_dien_thoai: reportPhone,
        hinh_thuc: reportForm,
        khan_cap: reportForm === 'Khẩn cấp' ? 1 : 0,
        nguon: 'App người dân',
        han_xu_ly: han_xu_ly,
        cong_khai: reportPublic ? 1 : 0,
        don_vi_xu_ly: 'UBND Xã',
        hinh_anh: uploadedPath
      });
      setSubmitted(true);
      setReportType(''); setReportAddress(''); setReportDesc(''); setReportPhone(user?.phone || '');
      setSelectedFile(null); setFilePreview(null);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      alert("Lỗi khi gửi phản ánh: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getPageTitle = () => {
    switch(activeTab) {
      case 'report': return 'Gửi Phản Ánh Sự Cố';
      case 'myreports': return 'Lịch Sử & Phản Hồi';
      case 'hogiadinh': return 'Khai Báo Hộ Gia Đình';
      case 'news': return 'Thông Báo Phường';
      case 'chatbot': return 'Hỏi Đáp Cùng Trợ Lý AI';
      case 'links': return 'Liên Kết Dịch Vụ Công';
      default: return `Xin chào, ${user?.name}!`;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{getPageTitle()}</h1>
        <p className="page-subtitle">Sử dụng các tiện ích dành cho người dân Phường.</p>
      </div>

      {/* Tab: Gửi Phản ánh */}
      {activeTab === 'report' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Chi tiết Sự cố</h3>
            {submitted && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500 }}>
                Gửi phản ánh thành công! Cán bộ sẽ tiếp nhận và phản hồi sớm nhất.
              </div>
            )}
            <form onSubmit={handleSubmitReport}>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Số điện thoại *</label>
                  <input type="text" className="input-field" placeholder="Nhập số điện thoại" value={reportPhone} onChange={e => setReportPhone(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Hình thức *</label>
                  <select className="input-field" value={reportForm} onChange={e => setReportForm(e.target.value)} required style={{ borderColor: reportForm === 'Khẩn cấp' ? 'var(--danger)' : undefined, color: reportForm === 'Khẩn cấp' ? 'var(--danger)' : undefined, fontWeight: reportForm === 'Khẩn cấp' ? '700' : undefined }}>
                    <option>Phản ánh</option>
                    <option>Kiến nghị</option>
                    <option>Đóng góp ý kiến</option>
                    <option value="Khẩn cấp">🚨 Khẩn cấp</option>
                  </select>
                </div>
              </div>
              {reportForm === 'Khẩn cấp' && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem' }}>
                  ⚠️ Phản ánh khẩn cấp sẽ ưu tiên xử lý ngay. Vui lòng chỉ chọn khi tình huống thực sự cần hỗ trợ gấp!
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Tiêu đề phản ánh *</label>
                <input type="text" className="input-field" placeholder="Ví dụ: Ô nhiễm môi trường, Cúp điện đột ngột" value={reportType} onChange={e => setReportType(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Vị trí (Số nhà, tên đường) *</label>
                <input type="text" className="input-field" placeholder="Ví dụ: 123 Đường A, Thôn B" value={reportAddress} onChange={e => setReportAddress(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Mô tả chi tiết *</label>
                <textarea className="input-field" rows="4" placeholder="Mô tả cụ thể tình trạng bạn đang gặp phải..." value={reportDesc} onChange={e => setReportDesc(e.target.value)} required />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input type="checkbox" id="publicReport" checked={reportPublic} onChange={e => setReportPublic(e.target.checked)} style={{ width: '1rem', height: '1rem', cursor: 'pointer' }} />
                <label htmlFor="publicReport" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--dark)' }}>Công khai phản ánh này (Những người khác có thể xem)</label>
              </div>
              <div className="input-group">
                <label className="input-label">Hình ảnh / Video bằng chứng</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*,video/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
                
                {!filePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--gray-100)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-300)'}
                  >
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Bấm để tải lên hoặc kéo thả file vào đây</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '0.5rem', backgroundColor: 'var(--gray-50)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {selectedFile && selectedFile.type.startsWith('video/') ? (
                      <video src={filePreview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)' }} />
                    ) : (
                      <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
                    )}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{selectedFile?.name}</span>
                      <button 
                        type="button" 
                        onClick={handleRemoveFile} 
                        style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={uploading}>
                {uploading ? 'Đang gửi phản ánh...' : 'Gửi Phản Ánh Ngay'}
              </button>
            </form>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Gợi ý nhanh (Tiêu đề)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['Cúp điện / cúp nước khẩn cấp','Tai nạn giao thông','Bạo lực gia đình','An ninh trật tự','Môi trường - rác thải','Hư hỏng cơ sở hạ tầng'].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setReportType(item)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.5rem 1rem', 
                    backgroundColor: reportType === item ? '#EFF6FF' : 'white', 
                    borderRadius: '9999px', 
                    cursor: 'pointer', 
                    boxShadow: 'var(--shadow-sm)', 
                    border: reportType === item ? '2px solid var(--primary)' : '2px solid transparent', 
                    transition: 'all 0.2s ease',
                    color: reportType === item ? 'var(--primary)' : 'var(--dark)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Thông báo phản hồi */}
      {activeTab === 'myreports' && (
        <div className="grid-2">
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Danh sách đã gửi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.map(r => (
                <div key={r.id} onClick={() => setSelectedReport(r)}
                  className="card" style={{ cursor: 'pointer', border: selectedReport?.id === r.id ? '2px solid var(--primary)' : '2px solid transparent', padding: '1rem', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.tieu_de || r.title}</span>
                    <span className={`badge ${statusBadge[r.trang_thai || r.status] || 'badge-pending'}`}>{statusTextMap[r.trang_thai || r.status] || r.statusText || 'Mới gửi'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{r.ngay_gui || r.date}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{(r.feedback && r.feedback.length) || 0} cập nhật</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
              {selectedReport ? `Chi tiết phản hồi: "${selectedReport.tieu_de || selectedReport.title}"` : 'Chọn một phản ánh để xem chi tiết'}
            </h3>
            {selectedReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                <div style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '0', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#0F766E', color: 'white', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>Chi tiết phản ánh</span>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                        <span style={{ color: 'var(--gray-600)' }}>Số điện thoại: </span>
                        <strong>{selectedReport.so_dien_thoai || 'Không cung cấp'}</strong>
                      </div>
                      
                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Tiêu đề: {selectedReport.tieu_de || selectedReport.title}</span>
                        </div>
                        <div style={{ backgroundColor: '#FEF3C7', padding: '0.75rem', borderRadius: '4px', border: '1px dashed #F59E0B' }}>
                          <div style={{ color: '#047857', fontWeight: 600, marginBottom: '0.25rem' }}>Nội dung phản ánh:</div>
                          <div style={{ color: 'var(--dark)' }}>{selectedReport.noi_dung || selectedReport.title}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                        <span style={{ color: '#047857' }}>Ngày phản ánh:</span>
                        <span>{selectedReport.ngay_gui || selectedReport.date}</span>
                        
                        <span style={{ color: '#047857' }}>Địa chỉ sự kiện:</span>
                        <span>{selectedReport.dia_chi || 'Không có'}</span>
                        
                        <span style={{ color: '#047857' }}>Chuyên mục:</span>
                        <span>{selectedReport.chuyen_muc || 'Không phân loại'}</span>
                        
                        <span style={{ color: '#047857' }}>Lĩnh vực:</span>
                        <span>{selectedReport.linh_vuc || 'Không phân loại'}</span>
                        
                        <span style={{ color: '#047857' }}>Hình thức:</span>
                        <span>{selectedReport.hinh_thuc || 'Phản ánh'}</span>
                        
                        <span style={{ color: '#047857' }}>Nguồn:</span>
                        <span>{selectedReport.nguon || 'App người dân'}</span>
                      </div>

                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Hạn xử lý: {selectedReport.han_xu_ly || 'Chưa cập nhật'}</div>
                        <div style={{ color: 'var(--gray-500)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          ♦ Phản ánh này [{selectedReport.cong_khai ? 'Công khai' : 'Không công khai'}]
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#F0F9FF', padding: '0.75rem', borderRadius: '4px', border: '1px dashed #3B82F6' }}>
                        <div style={{ color: '#1D4ED8', fontWeight: 600, marginBottom: '0.25rem' }}>Đơn vị xử lý:</div>
                        <div style={{ color: 'var(--dark)' }}>• {selectedReport.don_vi_xu_ly || 'UBND Phường'}</div>
                      </div>
                      
                      {selectedReport.hinh_anh && (
                        <div style={{ marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                          <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Hình ảnh / Video bằng chứng:</div>
                          {selectedReport.hinh_anh.toLowerCase().endsWith('.mp4') || selectedReport.hinh_anh.toLowerCase().match(/\.(mov|avi|webm)$/) ? (
                            <video src={selectedReport.hinh_anh.startsWith('http') ? selectedReport.hinh_anh : `http://localhost:3000${selectedReport.hinh_anh}`} controls style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: 'var(--radius-md)' }} />
                          ) : (
                            <img src={selectedReport.hinh_anh.startsWith('http') ? selectedReport.hinh_anh : `http://localhost:3000${selectedReport.hinh_anh}`} alt="Bằng chứng" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--gray-200)' }} />
                          )}
                        </div>
                      )}
                    </div>
                </div>
                {selectedReport.feedback && selectedReport.feedback.map((fb, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>{fb.actor}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{fb.time}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--dark)', margin: 0, lineHeight: 1.6 }}>{fb.text}</p>
                  </div>
                ))}
                {(selectedReport.trang_thai || selectedReport.status) === 'completed' && (
                  <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #34D399', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#065F46' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Phản ánh đã được xử lý hoàn toàn</div>
                    {selectedReport.ket_qua_xu_ly && (
                      <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        <strong>Kết quả xử lý: </strong> {selectedReport.ket_qua_xu_ly}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <p>Nhấn vào một phản ánh bên trái để xem lịch sử phản hồi từ cán bộ</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Khai Báo Hộ Gia Đình */}
      {activeTab === 'hogiadinh' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Gửi Khai Báo Hộ Gia Đình</h3>
            {hgdSubmitted && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500 }}>
                Khai báo thành công! Thông tin sẽ được cán bộ duyệt.
              </div>
            )}
            <form onSubmit={handleSubmitHgd}>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Tên chủ hộ *</label>
                  <input type="text" className="input-field" value={hgdName} onChange={e => setHgdName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Năm sinh chủ hộ *</label>
                  <input type="number" min="1900" max={new Date().getFullYear()} className="input-field" value={hgdBirthYear} onChange={e => setHgdBirthYear(e.target.value)} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Khu phố *</label>
                  <select className="input-field" value={hgdWard} onChange={e => setHgdWard(e.target.value)} required>
                    <option value="Khu phố 1">Khu phố 1</option>
                    <option value="Khu phố 2">Khu phố 2</option>
                    <option value="Khu phố 3">Khu phố 3</option>
                    <option value="Khu phố 4">Khu phố 4</option>
                    <option value="thôn Tà mon">Thôn Tà Mon</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Số thành viên *</label>
                  <input type="number" min="1" className="input-field" value={hgdMembers} onChange={e => setHgdMembers(e.target.value)} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Địa chỉ cụ thể *</label>
                <input type="text" className="input-field" value={hgdAddress} onChange={e => setHgdAddress(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Ghim vị trí nhà trên bản đồ (Tùy chọn)</label>
                <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-300)' }}>
                  <MapContainer center={[10.9333, 108.1000]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <LocationPicker position={hgdLocation} setPosition={setHgdLocation} />
                  </MapContainer>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                  {hgdLocation ? `Đã chọn: ${hgdLocation.lat.toFixed(5)}, ${hgdLocation.lng.toFixed(5)}` : 'Vui lòng nhấn vào bản đồ để chọn vị trí'}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Danh sách thành viên / Ghi chú</label>
                <textarea className="input-field" rows="3" placeholder="Nhập họ tên, năm sinh các thành viên..." value={hgdNote} onChange={e => setHgdNote(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                Gửi Khai Báo
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Danh sách hộ gia đình của tôi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {households.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
                  Bạn chưa gửi thông tin hộ gia đình nào.
                </div>
              ) : households.map(hgd => (
                <div key={hgd.ho_gia_dinh_id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Chủ hộ: {hgd.ten_chu_ho}</span>
                    <span className={`badge ${hgd.trang_thai === 'Đã duyệt' ? 'badge-completed' : (hgd.trang_thai === 'Từ chối' ? 'badge-processing' : 'badge-pending')}`}>
                      {hgd.trang_thai}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>
                    Địa chỉ: {hgd.dia_chi}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Thành viên: {hgd.so_thanh_vien} người
                  </div>
                  {hgd.ghi_chu && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                      Ghi chú: {hgd.ghi_chu}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Thông Báo Phường */}
      {activeTab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n.id} className="card" style={{ borderLeft: `4px solid ${typeBorder[n.type]}`, padding: '1.25rem', backgroundColor: typeBg[n.type] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>
                  {n.title}
                  {n.urgent && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>Khẩn</span>}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{n.date}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--dark)', lineHeight: 1.7, margin: 0 }}>{n.content}</p>
              {n.link && <a href={n.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-block', marginTop: '0.75rem', textDecoration: 'underline' }}>Xem chi tiết</a>}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Trợ lý AI (WebSocket) */}
      {activeTab === 'chatbot' && (
        <div>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#EDE9FE', borderRadius: 'var(--radius-md)', border: '1px solid #C4B5FD', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
              AI
            </div>
            <div>
              <strong style={{ fontSize: '1rem' }}>Trợ lý AI Phường</strong>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-600)' }}>Hỏi bất cứ điều gì về thủ tục hành chính, dịch vụ công hoặc sự cố trong khu phố!</p>
            </div>
          </div>
          <InlineChat />
        </div>
      )}

      {/* Tab: Dịch vụ công */}
      {activeTab === 'links' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <a href="https://vneid.gov.vn" target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: 'white', textDecoration: 'none' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>VNEID</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0 0 0.25rem' }}>Định danh điện tử quốc gia</p>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>vneid.gov.vn</span>
              </div>
            </a>
            <a href="https://baohiemxahoi.gov.vn" target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', textDecoration: 'none' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>BHXH Việt Nam</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0 0 0.25rem' }}>Tra cứu bảo hiểm xã hội</p>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>baohiemxahoi.gov.vn</span>
              </div>
            </a>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', cursor: 'pointer' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>Camera An ninh</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Xem camera công cộng</p>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginTop: '0.25rem' }}>Chỉ khu vực công khai</span>
              </div>
            </div>
          </div>
          <div className="grid-2">
            <a href="https://dichvucong.gov.vn" target="_blank" rel="noreferrer" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 0.25rem' }}>Cổng Dịch vụ công Quốc gia</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>Nộp hồ sơ, tra cứu thủ tục hành chính trực tuyến</p>
              </div>
            </a>
            <a href="https://dichvucong.binhthuan.gov.vn" target="_blank" rel="noreferrer" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 0.25rem' }}>DVC Tỉnh Bình Thuận</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>Dịch vụ công cấp tỉnh, tra cứu hồ sơ địa phương</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPortal;
