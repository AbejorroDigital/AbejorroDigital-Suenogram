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

const NewDreamModal: React.FC<NewDreamModalProps> = ({ location, onClose, onSave }) => {
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !description.trim() || !location) return;
    
    onSave({
      id: `dream-${Date.now()}`,
      lat: location.lat,
      lng: location.lng,
      author,
      description
    });
    
    // Reset form
    setAuthor('');
    setDescription('');
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
                <label className="block text-sm font-medium text-white/70 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Ej. soñador_anonimo"
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
