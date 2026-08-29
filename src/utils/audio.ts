// Web Audio API helper for instant dopamine feedback and timer bells without external assets

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSuccessChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    // Chime chords: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.55);
    });
  } catch (e) {
    console.debug('Audio not supported or blocked:', e);
  }
}

export const playSuccessSound = playSuccessChime;

export function playTimerBell(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 1.25);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

export function triggerConfetti() {
  if (typeof window !== 'undefined') {
    import('canvas-confetti').then((confettiModule) => {
      const confettiFunc = (confettiModule.default || confettiModule) as (opts?: unknown) => unknown;
      if (typeof confettiFunc === 'function') {
        confettiFunc({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#2563EB', '#14B8A6', '#22C55E', '#F59E0B', '#7C3AED'],
        });
      }
    }).catch(() => {});
  }
}
