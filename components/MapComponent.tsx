
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CrimeEvent } from '../types';
import { CRIME_TYPE_DETAILS } from '../constants';
import { Link } from 'lucide-react';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  crimes: CrimeEvent[];
}

const createCrimeIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      <circle cx="12" cy="9.5" r="2.5" fill="white" opacity="0.5"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, crimes }) => {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {crimes.map(crime => {
        const iconColor = CRIME_TYPE_DETAILS[crime.type].color;
        const icon = createCrimeIcon(iconColor);
        return (
          <Marker key={crime.id} position={[crime.location.lat, crime.location.lng]} icon={icon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-lg mb-1" style={{color: iconColor}}>{crime.type}</h3>
                <p className="text-sm text-gray-300 mb-2">{crime.description}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {crime.timestamp.toLocaleString()}
                </p>
                {crime.source && (
                  <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
                    <a
                      href={crime.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                    >
                      <Link size={12} className="mr-1.5 flex-shrink-0" />
                      <span>Source: {crime.source.name}</span>
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
