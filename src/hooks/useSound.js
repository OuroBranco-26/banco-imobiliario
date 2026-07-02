import { useRef } from 'react';

/**
 * useSound – Procedural sound effects for a board game.
 *
 * Every sound is synthesised on-the-fly with the Web Audio API
 * (OscillatorNode + GainNode for tonal sounds, AudioBuffer with
 * random samples for noise-based sounds). No external audio files
 * are required.
 *
 * The AudioContext is created lazily on the very first call so we
 * stay compliant with browser autoplay policies that require a
 * user-gesture before audio can start.
 */
export default function useSound() {
  // Persist the AudioContext across renders without causing re-renders.
  const ctxRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Return (and lazily create) the shared AudioContext. */
  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if the context was suspended (e.g. after page went idle).
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  /**
   * Create a white-noise AudioBuffer of the given duration (seconds).
   * Each sample is a random value in [-1, 1].
   */
  function createNoiseBuffer(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Play a short burst of white noise.
   * @param {number} duration  – length in seconds
   * @param {number} gain      – volume (0-1)
   * @param {number} [offset]  – delay before the burst starts (seconds)
   */
  function playNoiseBurst(ctx, duration, gain, offset = 0) {
    const now = ctx.currentTime + offset;
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(gainNode).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  }

  /**
   * Play a single oscillator tone.
   * @param {object}  opts
   * @param {number}  opts.frequency  – Hz
   * @param {string}  [opts.type]     – 'sine' | 'square' | 'triangle' | 'sawtooth'
   * @param {number}  opts.duration   – seconds
   * @param {number}  [opts.gain]     – volume 0-1
   * @param {number}  [opts.offset]   – delay in seconds
   * @param {number}  [opts.fadeOut]  – seconds for exponential fade-out (defaults to duration)
   */
  function playTone(ctx, { frequency, type = 'sine', duration, gain = 0.3, offset = 0, fadeOut }) {
    const now = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (fadeOut ?? duration));

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // ---------------------------------------------------------------------------
  // Wrap every public function so errors are caught silently.
  // ---------------------------------------------------------------------------
  function safe(fn) {
    return () => {
      try {
        fn();
      } catch (_) {
        /* silent */
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Sound effects
  // ---------------------------------------------------------------------------

  /**
   * playDiceRoll – Rapid white-noise clicks simulating dice rattling (~300ms).
   */
  const playDiceRoll = safe(() => {
    const ctx = getCtx();
    // 8 rapid tiny noise bursts spread over 300ms
    const bursts = 8;
    for (let i = 0; i < bursts; i++) {
      playNoiseBurst(ctx, 0.025, 0.4 - i * 0.03, i * 0.035);
    }
  });

  /**
   * playKaChing – Cash register: ascending tones C5-E5-G5 (~400ms).
   */
  const playKaChing = safe(() => {
    const ctx = getCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      playTone(ctx, {
        frequency: freq,
        type: 'triangle',
        duration: 0.25,
        gain: 0.35,
        offset: i * 0.12,
      });
    });
  });

  /**
   * playCoinDrop – Descending metallic tones simulating coins falling (~300ms).
   */
  const playCoinDrop = safe(() => {
    const ctx = getCtx();
    const notes = [1800, 1400, 1000, 700]; // high-pitched metallic descend
    notes.forEach((freq, i) => {
      playTone(ctx, {
        frequency: freq,
        type: 'square',
        duration: 0.08,
        gain: 0.15,
        offset: i * 0.065,
      });
    });
  });

  /**
   * playSiren – Police siren oscillating between ~500Hz and ~700Hz (~600ms).
   */
  const playSiren = safe(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Oscillate frequency between 500 and 700 Hz a few times
    const cycles = 3;
    const cycleDur = 0.6 / cycles;
    for (let i = 0; i < cycles; i++) {
      osc.frequency.setValueAtTime(500, now + i * cycleDur);
      osc.frequency.linearRampToValueAtTime(700, now + i * cycleDur + cycleDur / 2);
      osc.frequency.linearRampToValueAtTime(500, now + (i + 1) * cycleDur);
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  });

  /**
   * playJackpot – Ascending arpeggio for passing Go (~500ms).
   */
  const playJackpot = safe(() => {
    const ctx = getCtx();
    // C5 → E5 → G5 → C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playTone(ctx, {
        frequency: freq,
        type: 'sine',
        duration: 0.35,
        gain: 0.3,
        offset: i * 0.12,
      });
    });
  });

  /**
   * playPaperFlip – Very short noise burst (~150ms).
   */
  const playPaperFlip = safe(() => {
    const ctx = getCtx();
    // A single quick, high-pass-ish noise burst (higher gain, very short)
    playNoiseBurst(ctx, 0.15, 0.3);
  });

  /**
   * playHammer – Low thud for building houses (~200ms).
   */
  const playHammer = safe(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Low-frequency sine "thud"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // Tiny noise layer for the "hit" attack
    playNoiseBurst(ctx, 0.04, 0.25);
  });

  /**
   * playBankrupt – Dramatic descending tone (~800ms).
   */
  const playBankrupt = safe(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  });

  /**
   * playVictory – Major-chord fanfare arpeggio C-E-G-C (~1000ms).
   */
  const playVictory = safe(() => {
    const ctx = getCtx();
    // C4 → E4 → G4 → C5  (with longer sustain for a triumphant feel)
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      playTone(ctx, {
        frequency: freq,
        type: 'triangle',
        duration: 0.6,
        gain: 0.3,
        offset: i * 0.2,
      });
    });

    // Final C5 gets an extra bright overtone
    playTone(ctx, {
      frequency: 1046.5,
      type: 'sine',
      duration: 0.5,
      gain: 0.15,
      offset: 0.6,
    });
  });

  /**
   * playTrade – Two quick ascending tones like a handshake/deal (~300ms).
   */
  const playTrade = safe(() => {
    const ctx = getCtx();
    playTone(ctx, {
      frequency: 440,
      type: 'triangle',
      duration: 0.15,
      gain: 0.3,
      offset: 0,
    });
    playTone(ctx, {
      frequency: 554.37, // C#5 – a cheerful major-third above A4
      type: 'triangle',
      duration: 0.2,
      gain: 0.3,
      offset: 0.13,
    });
  });

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    playDiceRoll,
    playKaChing,
    playCoinDrop,
    playSiren,
    playJackpot,
    playPaperFlip,
    playHammer,
    playBankrupt,
    playVictory,
    playTrade,
  };
}
