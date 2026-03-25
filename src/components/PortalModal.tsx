/**
 * @fileoverview Componente modal que actúa como un "Portal" para visualizar el sueño generado por IA.
 */
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Download, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDream } from '../services/ai';
import { DreamData } from '../data/mockDreams';

/**
 * Propiedades para el componente PortalModal.
 * @interface PortalModalProps
 * @property {DreamData | null} dream - Los datos del sueño seleccionado, o null si no hay ninguno seleccionado.
 * @property {() => void} onClose - Función callback que se ejecuta al cerrar el modal.
 * @property {(id: string) => void} onDelete - Función para eliminar el sueño.
 * @property {any} currentUser - El usuario autenticado actual.
 */
interface PortalModalProps {
  dream: DreamData | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  currentUser?: any;
}

/**
 * Componente que muestra un modal superpuesto (overlay) con diseño de tarjeta 2D.
 * Se encarga de llamar a la IA para generar la imagen y luego mostrarla junto con el texto.
 * 
 * @param {PortalModalProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente modal animado.
 */
const PortalModal: React.FC<PortalModalProps> = ({ dream, onClose, onDelete, currentUser }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicia la descarga de la imagen generada por IA.
   * Intenta descargar como blob y si falla abre la imagen en una nueva pestaña (por restricciones CORS).
   * 
   * @param {React.MouseEvent} e - Evento del ratón.
   */
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl || !dream) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `sueno-${dream.author.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error al descargar la imagen:", err);
      // Fallback si falla el fetch (ej. por CORS)
      window.open(imageUrl, '_blank');
    }
  };

  /**
   * Elimina el sueño actual utilizando la función callback pasada por props.
   */
  const handleDelete = () => {
    if (dream && onDelete) {
      // Usamos un modal o confirmación simple, pero como estamos en iframe,
      // usaremos un estado interno o simplemente llamaremos a onDelete.
      // Para evitar window.confirm, lo llamamos directamente o podríamos hacer un UI de confirmación.
      onDelete(dream.id);
    }
  };

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
      
      // Intentar recuperar de localStorage primero
      const cacheKey = `dream_image_${dream.id}`;
      const cachedImage = localStorage.getItem(cacheKey);
      
      if (cachedImage) {
        if (isMounted) {
          setImageUrl(cachedImage);
          setIsGenerating(false);
        }
        return;
      }

      try {
        const url = await generateDream(dream.description);
        if (isMounted) {
          setImageUrl(url);
          // Guardar en caché para futuras visitas
          try {
            localStorage.setItem(cacheKey, url);
          } catch (storageErr) {
            console.warn("No se pudo guardar la imagen en caché (posible límite de cuota excedido):", storageErr);
          }
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content - 2D Card */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Area */}
            <div className="w-full md:w-1/2 relative bg-black aspect-video md:aspect-square md:max-h-[450px] flex items-center justify-center">
              {isGenerating && (
                <div className="flex flex-col items-center gap-4 text-purple-400">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="tracking-widest uppercase text-xs font-medium animate-pulse">
                    Manifestando el Sueño...
                  </p>
                </div>
              )}
              
              {error && (
                <div className="text-red-400 bg-red-900/20 border border-red-500/30 p-4 rounded-xl max-w-sm text-center m-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {imageUrl && !isGenerating && (
                <>
                  <img 
                    src={imageUrl} 
                    alt={`Sueño de ${dream.author}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute bottom-4 right-4 p-2 bg-black/40 hover:bg-black/70 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-all group"
                    title="Descargar imagen"
                  >
                    <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </>
              )}
            </div>

            {/* Text Area */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-zinc-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-white font-jim text-3xl tracking-wide pt-1">Sueño de {dream.author}</h2>
                </div>
                
                {currentUser && dream.authorUid === currentUser.uid && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full transition-colors"
                    title="Eliminar mi sueño"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="w-12 h-1 bg-purple-500/50 rounded-full mb-4"></div>
              
              {dream.dreamDate && (
                <div className="flex items-center gap-2 mb-4 text-white/50 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(dream.dreamDate + 'T12:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}

              <p className="text-white/80 text-base leading-relaxed italic">
                "{dream.description}"
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortalModal;
