/**
 * @fileoverview Punto de entrada principal de la aplicación Dreamscape Mapper.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Map from './components/Map';
import PortalModal from './components/PortalModal';
import NewDreamModal from './components/NewDreamModal';
import { DreamData, mockDreams } from './data/mockDreams';
import { Sparkles, Plus } from 'lucide-react';

/**
 * Componente raíz de la aplicación.
 * Gestiona el estado global del sueño seleccionado y orquesta la visualización del mapa y el portal.
 * 
 * @returns {JSX.Element} La estructura principal de la interfaz de usuario.
 */
export default function App() {
  const [dreams, setDreams] = useState<DreamData[]>(mockDreams);
  const [selectedDream, setSelectedDream] = useState<DreamData | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newDreamLocation, setNewDreamLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingMode) {
      setNewDreamLocation({ lat, lng });
      setIsAddingMode(false);
    }
  };

  const handleSaveDream = (dream: DreamData) => {
    setDreams([...dreams, dream]);
    setNewDreamLocation(null);
    setSelectedDream(dream); // Open the portal immediately for the new dream
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 pointer-events-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Dreamscape Mapper
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Explora sueños surrealistas manifestados por IA.
          </p>
        </div>
      </div>

      {/* Map Layer */}
      <Map 
        dreams={dreams} 
        onDreamSelect={setSelectedDream} 
        onMapClick={handleMapClick}
        isAddingMode={isAddingMode}
      />

      {/* Add Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button 
          onClick={() => setIsAddingMode(!isAddingMode)}
          className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg ${
            isAddingMode 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {isAddingMode ? 'Cancelar' : <><Plus className="w-5 h-5" /> Registrar un Sueño</>}
        </button>
      </div>

      {/* Instruction Toast */}
      {isAddingMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/20 text-sm font-medium animate-pulse shadow-lg">
          Haz clic en cualquier lugar del mapa para ubicar tu sueño
        </div>
      )}

      {/* Modals */}
      <NewDreamModal 
        location={newDreamLocation} 
        onClose={() => setNewDreamLocation(null)} 
        onSave={handleSaveDream} 
      />

      <PortalModal 
        dream={selectedDream} 
        onClose={() => setSelectedDream(null)} 
      />
    </div>
  );
}
