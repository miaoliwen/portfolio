/**
 * 像素小恐龙游戏 - 音效系统
 */

let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextCtor) {
      audioCtx = new AudioContextCtor();
    }
  }

  if (audioCtx?.state === "suspended") {
    void audioCtx.resume();
  }
};

const beep = (frequency: number, duration: number, type: OscillatorType = "square", volume = 0.05) => {
  if (!audioCtx) return;

  try {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch {
    // Ignore audio failures in restricted browsers.
  }
};

export const sfxJump = () => {
  beep(620, 0.1);
  beep(880, 0.06);
};

export const sfxCoin = () => {
  beep(1200, 0.08, "square", 0.07);
  beep(1500, 0.06, "square", 0.05);
};

export const sfxPowerup = () => {
  beep(800, 0.1, "triangle", 0.08);
  beep(1100, 0.08, "triangle", 0.06);
};

export const sfxHit = () => {
  beep(80, 0.3, "triangle", 0.1);
  beep(50, 0.2, "sawtooth", 0.07);
};

export const sfxScore = () => {
  beep(1050, 0.06);
};
