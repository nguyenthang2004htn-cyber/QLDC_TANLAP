import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Home } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons using Lucide
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
const incidentIcon = createCustomIcon(<AlertTriangle />, '#EF4444');

// Simple hash function to generate consistent coordinates from string
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// Generate mock coordinates around Phan Thiet center
const getMockCoordinates = (addressStr, baseLat = 10.9333, baseLng = 108.1000) => {
  const hash = hashCode(addressStr || '');
  // Offset roughly within ~2-3km radius
  const latOffset = (hash % 1000) / 40000;
  const lngOffset = ((hash * 7) % 1000) / 40000;
  
  return [baseLat + latOffset, baseLng + lngOffset];
};

const MapDashboard = ({ residents = [], reports = [] }) => {
  const phanThietCenter = [10.9333, 108.1000];

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={24} color="var(--primary)" />
          Bản đồ Điểm dân cư & Sự cố
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#3B82F6', borderRadius: '50%' }}></div>
            <span>Hộ dân ({residents.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#EF4444', borderRadius: '50%' }}></div>
            <span>Sự cố đang xử lý/mới ({reports.filter(r => r.trang_thai !== 'completed' && r.status !== 'completed').length})</span>
          </div>
        </div>
      </div>
      
      <div style={{ height: '600px', width: '100%', position: 'relative', zIndex: 0 }}>
        <MapContainer center={phanThietCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Resident Markers */}
          {residents.map((resident) => {
            const position = getMockCoordinates((resident.dia_chi || resident.address) + (resident.ho_ten || resident.name));
            return (
              <Marker key={`res-${resident.id}`} position={position} icon={residentIcon}>
                <Popup>
                  <div style={{ padding: '0.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{resident.ho_ten || resident.name}</h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Địa chỉ:</strong> {resident.dia_chi || resident.address}</p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>SĐT:</strong> {resident.dien_thoai || resident.phone}</p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Khu vực:</strong> {resident.khu_pho}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Incident/Report Markers */}
          {reports
            .filter(r => r.trang_thai !== 'completed' && r.status !== 'completed')
            .map((report) => {
              const position = getMockCoordinates((report.dia_chi || report.address) + (report.tieu_de || report.title));
              return (
                <Marker key={`rep-${report.id}`} position={position} icon={incidentIcon}>
                  <Popup>
                    <div style={{ padding: '0.25rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#EF4444' }}>{report.tieu_de || report.title}</h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Vị trí:</strong> {report.dia_chi || report.address}</p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Người báo:</strong> {report.citizen || report.nguoi_dan_id}</p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}><strong>Trạng thái:</strong> {report.trang_thai || report.status}</p>
                    </div>
                  </Popup>
                </Marker>
              );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapDashboard;
