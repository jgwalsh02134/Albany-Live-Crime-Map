
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CrimeEvent } from '../types';
import { CRIME_TYPE_DETAILS } from '../constants';
import { Link, Clock, MapPin } from 'lucide-react';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  crimes: CrimeEvent[];
}

const createCrimeIcon = (color: string) => {
  const pinPath = "M16 .5C9.096.5 3.5 6.096 3.5 13c0 7.42 10.53 17.553 11.532 18.74a1.365 1.365 0 001.936 0C17.97 30.553 28.5 20.42 28.5 13 28.5 6.096 22.904.5 16 .5z";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px" 
         style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
      <path 
        d="${pinPath}"
        fill="${color}" 
        fill-opacity="0.8"
        stroke="#4B5563" 
        stroke-width="1.5"
      />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: '', // important for leaflet not to add its own styles
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Anchor at the bottom center (tip of the pin)
    popupAnchor: [0, -34], // Popup opens just above the pin tip
  });
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day(s) ago`;
}


const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, crimes }) => {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {crimes.map(crime => {
        const crimeDetails = CRIME_TYPE_DETAILS[crime.type];
        const icon = createCrimeIcon(crimeDetails.color);
        return (
          <Marker key={crime.id} position={[crime.location.lat, crime.location.lng]} icon={icon}>
            <Popup>
              <div className="p-1 w-64">
                <h3 className="font-bold text-lg mb-2" style={{color: crimeDetails.color}}>{crime.type}</h3>
                
                <div className="text-sm text-gray-500 mb-2 flex items-start">
                    <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{crime.address}</span>
                </div>

                <p className="text-sm text-gray-700 mb-3">{crime.description}</p>
                
                <div className="text-xs text-gray-500 mb-3 space-y-1">
                   <div className="flex items-center">
                    <Clock size={12} className="mr-2 flex-shrink-0" />
                    <span className="font-semibold">Reported:</span>
                    <span className="font-mono text-gray-800 ml-auto">{crime.timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                   <div className="flex items-center">
                    <Clock size={12} className="mr-2 flex-shrink-0 text-gray-400" />
                    <span className="font-semibold">Time Ago:</span>
                    <span className="font-mono text-gray-800 ml-auto">{formatTimeAgo(crime.timestamp)}</span>
                  </div>
                </div>

                {crime.source && (
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                    <a
                      href={crime.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 hover:underline flex items-center"
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
