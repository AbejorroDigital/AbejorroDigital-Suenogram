/**
 * @fileoverview Punto de entrada principal de la aplicación Dreamscape Mapper.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import PortalModal from './components/PortalModal';
import NewDreamModal from './components/NewDreamModal';
import AudioPlayer from './components/AudioPlayer';
import AuthButton from './components/AuthButton';
import { DreamData } from './data/mockDreams';
import { Sparkles, Plus, LifeBuoy, AlertCircle } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Componente raíz de la aplicación.
 * Gestiona el estado global del sueño seleccionado y orquesta la visualización del mapa y el portal.
 * 
 * @returns {JSX.Element} La estructura principal de la interfaz de usuario.
 */
export default function App() {
  const [dreams, setDreams] = useState<DreamData[]>([]);
  const [selectedDream, setSelectedDream] = useState<DreamData | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newDreamLocation, setNewDreamLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const q = query(collection(db, 'dreams'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dreamsData: DreamData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dreamsData.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as DreamData);
      });
      setDreams(dreamsData);
    }, (error) => {
      console.error("Error fetching dreams:", error);
    });

    return () => unsubscribe();
  }, [authReady]);

  /**
   * Maneja el evento de clic en el mapa.
   * Si está en modo de agregación, verifica si el usuario tiene sesión iniciada
   * para poder registrar la ubicación geográfica de un nuevo sueño.
   * 
   * @param {number} lat - Latitud de la ubicación seleccionada.
   * @param {number} lng - Longitud de la ubicación seleccionada.
   */
  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingMode) {
      if (!user) {
        alert("Debes iniciar sesión para registrar un sueño.");
        setIsAddingMode(false);
        return;
      }
      setNewDreamLocation({ lat, lng });
      setIsAddingMode(false);
    }
  };

  /**
   * Guarda un nuevo sueño en la base de datos Firestore.
   * Una vez guardado, se actualiza la interfaz mostrando el nuevo sueño y abriendo el portal.
   * 
   * @param {DreamData} dream - Los datos del sueño a guardar.
   */
  const handleSaveDream = async (dream: DreamData) => {
    // Save to Firestore
    try {
      const docRef = await addDoc(collection(db, 'dreams'), {
        description: dream.description,
        lat: dream.lat,
        lng: dream.lng,
        authorUid: user.uid,
        author: dream.author || user.displayName || 'Soñador Anónimo',
        dreamDate: dream.dreamDate,
        createdAt: new Date()
      });
      
      const newDream = { ...dream, id: docRef.id, authorUid: user.uid, author: dream.author || user.displayName || 'Soñador Anónimo' };
      setNewDreamLocation(null);
      setSelectedDream(newDream); // Open the portal immediately for the new dream
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Hubo un error al guardar el sueño.");
    }
  };

  /**
   * Elimina un sueño específico de Firestore.
   * 
   * @param {string} dreamId - El ID del sueño a eliminar.
   */
  const handleDeleteDream = async (dreamId: string) => {
    try {
      await deleteDoc(doc(db, 'dreams', dreamId));
      setSelectedDream(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Hubo un error al eliminar el sueño.");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Header Overlay - Sleek Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 pointer-events-none flex justify-center items-start">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 pointer-events-auto flex items-center gap-4 sm:gap-6 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-italianno text-white tracking-tight whitespace-nowrap pt-1">
              Sueñogram
            </h1>
            <span className="hidden md:inline-block text-white/60 text-sm border-l border-white/20 pl-4 whitespace-nowrap">
              Explora sueños surrealistas manifestados por IA
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 border-l border-white/20 pl-4">
            <AudioPlayer />
            <a 
              href="https://ai.studio/apps/858fbdf1-91f4-47e8-9f1d-1b0798963f83" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-colors"
              title="¿Problemas con la página? Visita el prototipo alternativo"
            >
              <LifeBuoy className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div className="border-l border-white/20 pl-2 sm:pl-3">
              <AuthButton />
            </div>
          </div>
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
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <button 
          onClick={() => setIsAddingMode(!isAddingMode)}
          className={`px-8 py-2 rounded-full font-italianno text-3xl flex items-center gap-2 transition-all shadow-lg ${
            isAddingMode 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {isAddingMode ? 'Cancelar' : <><Plus className="w-5 h-5" /> Registrar un Sueño</>}
        </button>
      </div>

      {/* Footer Signature */}
      <div className="absolute bottom-2 left-0 right-0 text-center z-10 pointer-events-none flex flex-col items-center gap-1">
        <p className="text-white/40 text-[10px] tracking-widest uppercase pointer-events-auto inline-block">
          Desarrollado por <a href="https://abejorro-digital.rf.gd/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2">Abejorro Digital</a> 2026
        </p>
        <p className="text-white/30 text-[8px] pointer-events-auto inline-block">
          Music by <a href="https://pixabay.com/es/users/sonican-38947841/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=473154" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">Dvir Silverstone</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=473154" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">Pixabay</a>
        </p>
      </div>

      {/* Instruction Toast */}
      {isAddingMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/20 text-sm font-medium animate-pulse shadow-lg whitespace-nowrap">
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
        onDelete={handleDeleteDream}
        currentUser={user}
      />
    </div>
  );
}
