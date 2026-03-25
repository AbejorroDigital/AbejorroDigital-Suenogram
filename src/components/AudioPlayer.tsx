import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import backgroundMusic from '../data/musica.mp3';

/**
 * Componente que maneja la reproducción de música de fondo.
 * Encapsula el estado, la referencia al elemento de audio y la interfaz del botón.
 * 
 * @returns {JSX.Element} El componente del reproductor de audio.
 */
export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  /**
   * Alterna entre reproducir y pausar el audio.
   */
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Error reproduciendo audio:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={backgroundMusic} 
        loop 
        preload="auto"
      />
      <button 
        onClick={toggleAudio}
        className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        title={isPlaying ? "Pausar música" : "Reproducir música etérea"}
      >
        {isPlaying ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>
    </>
  );
}
