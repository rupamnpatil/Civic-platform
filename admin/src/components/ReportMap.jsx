import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import StatusBadge from './StatusBadge';

// Fix missing default icon on production builds
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const STATUS_COLOR = {
  submitted: '#f59e0b',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#10b981',
  rejected: '#ef4444',
};

function coloredIcon(status) {
  const color = STATUS_COLOR[status] || '#6b7280';
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background:${color};
      width:18px;height:18px;border-radius:50%;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Helper to auto-fit bounds to markers
function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length === 0) return;
    const bounds = L.latLngBounds(
      reports.map((r) => [r.location.coordinates[1], r.location.coordinates[0]])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [reports.length]);
  return null;
}

export default function ReportMap({ reports, onSelect }) {
  return (
    <MapContainer
      center={[12.95, 77.55]}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <FitBounds reports={reports} />
      {reports.map((r) => (
        <Marker
          key={r._id}
          position={[r.location.coordinates[1], r.location.coordinates[0]]}
          icon={coloredIcon(r.status)}
          eventHandlers={{ click: () => onSelect?.(r) }}
        >
          <Popup>
            <div className="text-sm">
              <strong className="capitalize">{r.category}</strong>
              <br />
              {r.description}
              <br />
              <StatusBadge status={r.status} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}