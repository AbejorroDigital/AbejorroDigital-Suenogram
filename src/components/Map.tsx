/**
 * @fileoverview Componente de mapa interactivo utilizando Leaflet para mostrar la ubicación de los sueños.
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DreamData } from '../data/mockDreams';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Icono personalizado para los marcadores de sueños en el mapa.
 * @type {L.Icon}
 */
const dreamIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTg1NWY3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJ2MjAiLz48cGF0aCBkPSJNMTcgNWwtNS0zLTUgM3YxNGw1IDMgNS0zWiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'dream-marker-icon'
});

/**
 * Propiedades para el componente Map.
 * @interface MapProps
 * @property {DreamData[]} dreams - Lista de sueños a mostrar en el mapa.
 * @property {(dream: DreamData) => void} onDreamSelect - Función callback que se ejecuta al seleccionar (hacer clic) en un sueño.
 * @property {(lat: number, lng: number) => void} [onMapClick] - Función callback al hacer clic en el mapa (para agregar sueños).
 * @property {boolean} [isAddingMode] - Indica si el mapa está en modo de agregar un nuevo sueño.
 */
interface MapProps {
  dreams: DreamData[];
  onDreamSelect: (dream: DreamData) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isAddingMode?: boolean;
}

/**
 * Componente auxiliar para capturar eventos de clic en el mapa de Leaflet.
 */
const MapEvents = ({ onMapClick, isAddingMode }: { onMapClick?: (lat: number, lng: number) => void, isAddingMode?: boolean }) => {
  useMapEvents({
    click(e) {
      if (isAddingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

/**
 * Componente que renderiza un mapa global oscuro con marcadores personalizados para cada sueño.
 * 
 * @param {MapProps} props - Propiedades del componente.
 * @returns {JSX.Element} El contenedor del mapa interactivo.
 */
const Map: React.FC<MapProps> = ({ dreams, onDreamSelect, onMapClick, isAddingMode }) => {
  return (
    <div className={`w-full h-full absolute inset-0 z-0 ${isAddingMode ? 'is-adding-mode' : ''}`}>
      <MapContainer
        center={[25, -90]}
        zoom={3}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        {/* Dark theme tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapEvents onMapClick={onMapClick} isAddingMode={isAddingMode} />
        
        {dreams.map((dream) => (
          <Marker
            key={dream.id}
            position={[dream.lat, dream.lng]}
            icon={dreamIcon}
            eventHandlers={{
              click: () => onDreamSelect(dream),
            }}
          >
            <Popup className="dream-popup">
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">Sueño de {dream.author}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{dream.description}</p>
                <button 
                  className="mt-2 w-full bg-purple-600 text-white text-xs py-1 px-2 rounded hover:bg-purple-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDreamSelect(dream);
                  }}
                >
                  Entrar al Portal
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
