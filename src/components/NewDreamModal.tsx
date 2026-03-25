/**
 * @fileoverview Modal para que los usuarios registren sus propios sueños en el mapa.
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DreamData } from '../data/mockDreams';

/**
 * Propiedades para el componente NewDreamModal.
 * @interface NewDreamModalProps
 * @property {{ lat: number; lng: number } | null} location - Las coordenadas donde se hizo clic en el mapa.
 * @property {() => void} onClose - Función para cerrar el modal sin guardar.
 * @property {(dream: DreamData) => void} onSave - Función para guardar el nuevo sueño.
 */
interface NewDreamModalProps {
  location: { lat: number; lng: number } | null;
  onClose: () => void;
  onSave: (dream: DreamData) => void;
}

/**
 * Componente modal que muestra el formulario para registrar un nuevo sueño.
 * 
 * @param {NewDreamModalProps} props - Propiedades del modal.
 * @returns {JSX.Element} Contenedor animado del modal.
 */
const NewDreamModal: React.FC<NewDreamModalProps> = ({ location, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [dreamDate, setDreamDate] = useState(new Date().toISOString().split('T')[0]);
  const [authorName, setAuthorName] = useState('');

  /**
   * Maneja el envío del formulario.
   * Valida los campos ingresados y llama a la función onSave.
   * 
   * @param {React.FormEvent} e - Evento principal de submit del formulario.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location || !dreamDate || !authorName.trim()) return;
    
    onSave({
      id: `dream-${Date.now()}`,
      lat: location.lat,
      lng: location.lng,
      author: authorName.trim(),
      description,
      dreamDate
    });
    
    // Reiniciar formulario
    setDescription('');
    setDreamDate(new Date().toISOString().split('T')[0]);
    setAuthorName('');
  };

  return (
    <AnimatePresence>
      {location && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Registrar un Sueño</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre del Soñador</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Tu nombre o seudónimo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Fecha del Sueño</label>
                <input
                  type="date"
                  value={dreamDate}
                  onChange={(e) => setDreamDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Descripción del Sueño</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
                  placeholder="Describe lo que viste en tu sueño con el mayor detalle posible..."
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Guardar Sueño
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewDreamModal;
