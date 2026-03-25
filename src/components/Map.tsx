/**
 * @fileoverview Componente de mapa interactivo utilizando Leaflet para mostrar la ubicación de los sueños.
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DreamData } from '../data/mockDreams';

// Corrección para los iconos de marcador por defecto en React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Icono personalizado para los marcadores de sueños en el mapa.
 * @type {L.DivIcon}
 */
const dreamIcon = L.divIcon({
  className: 'custom-dream-marker',
  html: `<div style="background-color: #9333ea; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #a855f7; display: flex; align-items: center; justify-content: center;">
           <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
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
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        {/* Capa de modo oscuro */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          noWrap={true}
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
            <Tooltip direction="top" offset={[0, -15]} className="custom-tooltip">
              <div className="max-w-[200px]">
                <p className="font-bold text-xs mb-1">Sueño de {dream.author}</p>
                <p className="text-[10px] line-clamp-3 whitespace-normal">{dream.description}</p>
              </div>
            </Tooltip>
            <Popup className="dream-popup">
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">Sueño de {dream.author}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{dream.description}</p>
                <button 
                  className="mt-2 w-full bg-purple-600 text-white text-xl font-italianno py-1 px-2 rounded hover:bg-purple-700 transition-colors"
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
