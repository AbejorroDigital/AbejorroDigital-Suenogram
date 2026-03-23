/**
 * @fileoverview Componente modal que actúa como un "Portal" para visualizar el sueño generado por IA.
 */
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DreamCanvas from './DreamCanvas';
import { generateDream } from '../services/ai';
import { DreamData } from '../data/mockDreams';

/**
 * Propiedades para el componente PortalModal.
 * @interface PortalModalProps
 * @property {DreamData | null} dream - Los datos del sueño seleccionado, o null si no hay ninguno seleccionado.
 * @property {() => void} onClose - Función callback que se ejecuta al cerrar el modal.
 */
interface PortalModalProps {
  dream: DreamData | null;
  onClose: () => void;
}

/**
 * Componente que muestra un modal superpuesto (overlay) con efecto de vidrio esmerilado.
 * Se encarga de llamar a la IA para generar la imagen y luego mostrarla en el canvas 3D.
 * 
 * @param {PortalModalProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente modal animado.
 */
const PortalModal: React.FC<PortalModalProps> = ({ dream, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dream) {
      setImageUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;
    
    const fetchDream = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const url = await generateDream(dream.description);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          setError("No se pudo manifestar el sueño. Puede que la descripción infrinja las políticas de seguridad o haya un error de red.");
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    fetchDream();

    return () => {
      isMounted = false;
    };
  }, [dream]);

  return (
    <AnimatePresence>
      {dream && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl aspect-video bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md pointer-events-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-white font-medium text-lg tracking-wide">Soñador: {dream.author}</h2>
                </div>
                <p className="text-white/80 text-sm leading-relaxed italic">
                  "{dream.description}"
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white p-3 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-black/50 flex items-center justify-center">
              {isGenerating && (
                <div className="flex flex-col items-center gap-4 text-white/80">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                  <p className="tracking-widest uppercase text-sm font-medium animate-pulse">
                    Manifestando el Sueño...
                  </p>
                </div>
              )}
              
              {error && (
                <div className="text-red-400 bg-red-900/20 border border-red-500/30 p-4 rounded-xl max-w-md text-center">
                  <p>{error}</p>
                </div>
              )}

              {imageUrl && !isGenerating && (
                <DreamCanvas imageUrl={imageUrl} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortalModal;
