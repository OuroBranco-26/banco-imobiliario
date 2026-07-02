import { useRef, useState, useCallback } from 'react';

/**
 * Background music player for Banco Imobiliário.
 * 
 * Para trocar a música:
 *   1. Coloque seu arquivo .mp3 na pasta  public/
 *   2. Altere o MUSIC_FILE abaixo para o nome do seu arquivo
 *   Ex: const MUSIC_FILE = '/minha_musica.mp3';
 */
const MUSIC_FILE = '/Fundo Banco imobiliario Araguari.webm';

export default function useBackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_FILE);
      audio.loop = true;
      audio.volume = 0.3;
      audio.preload = 'auto';
      audioRef.current = audio;

      // Sync state when audio ends or errors
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', () => {
        console.warn('🎵 Arquivo de música não encontrado:', MUSIC_FILE);
        console.warn('   Coloque um arquivo .mp3 em public/ e atualize MUSIC_FILE no useBackgroundMusic.js');
        setIsPlaying(false);
      });
    }
    return audioRef.current;
  };

  const play = useCallback(() => {
    const audio = getAudio();
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Não foi possível tocar a música:', err.message);
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else play();
  }, [isPlaying, play, stop]);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  return { isPlaying, play, stop, toggle, volume, setVolume };
}
