import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function HeatmapView({ points }) {
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);

  const getMarkerColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-gray-700/50 shadow-lg relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0a0e1a' }}
        zoomControl={false}
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* Dark map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {points?.map((point, idx) => (
          <CircleMarker
            key={idx}
            center={[point.coordinates[1], point.coordinates[0]]}
            radius={Math.max(5, Math.min(point.count * 2, 20))}
            fillColor={getMarkerColor(point.risk_level)}
            color={getMarkerColor(point.risk_level)}
            weight={1}
            opacity={0.8}
            fillOpacity={0.4}
          >
            <Popup className="custom-popup">
              <div className="bg-gray-900 text-gray-300 p-2 rounded-lg border border-gray-700 min-w-[200px]">
                <h3 className="font-bold text-white text-sm mb-1">{point.district}, {point.state}</h3>
                <div className="text-xs space-y-1">
                  <p>Risk Level: <span className="uppercase font-bold text-red-400">{point.risk_level}</span></p>
                  <p>Incidents: <span className="font-mono text-cyan-400">{point.count}</span></p>
                  {point.types && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-gray-500 mb-1">Top Crimes:</p>
                      {Object.entries(point.types).map(([type, cnt]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                          <span className="font-mono">{cnt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Embedded CSS for custom popup styling */}
      <style>{`
        .leaflet-popup-content-wrapper { background: transparent; padding: 0; box-shadow: none; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}
