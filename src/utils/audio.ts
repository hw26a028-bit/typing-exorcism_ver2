/**
 * Procedural Audio Generator using Web Audio API
 * Provides atmospheric typing click, error buz, and game impact sound effects with zero dependencies.
 */

let audioCtx: AudioContext | null = null;
let bgmNode: OscillatorNode | null = null;
let bgmAmp: GainNode | null = null;
let isBgmPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Crisp Keystroke Click Sound
export function playTypeSound(isSpace = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isSpace) {
      // Deeper clack
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      // Crisp mechanical click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.setValueAtTime(3000, ctx.currentTime + 0.005);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    }
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 2. Muted error buzz
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 3. Clear word-completion chime
export function playCompleteSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play an elegant pentatonic/Buddhist bell ring
    // Chord: Root, fifth, octave, minor third above octave
    const freqs = [330, 495, 660, 783]; 
    freqs.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + index * 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.start(now + index * 0.04);
      osc.stop(now + 1.3);
    });
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 4. Spiritual Exorcism Spell / Attack Whoosh
export function playSpellAttackSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // We synthesize a dramatic magic whoosh + high crystal spark
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.start();
    osc.stop(now + 0.5);

    // High sparkling harmonics
    const sparkles = [1500, 2200, 3100];
    sparkles.forEach((f, i) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();
      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(f, now + 0.15 + i * 0.05);
      
      sOsc.connect(sGain);
      sGain.connect(ctx.destination);
      
      sGain.gain.setValueAtTime(0.05, now + 0.15 + i * 0.05);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45 + i * 0.05);
      
      sOsc.start(now + 0.15 + i * 0.05);
      sOsc.stop(now + 0.5 + i * 0.05);
    });
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 5. Ghost impact/screech sound
export function playGhostDamageSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Ghost growl: low, vibrating sawtooth with frequency modulation
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const gain = ctx.createGain();
    
    car.type = 'sawtooth';
    car.frequency.setValueAtTime(180, now);
    car.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    
    mod.frequency.setValueAtTime(35, now);
    modGain.gain.setValueAtTime(120, now);
    
    mod.connect(modGain);
    modGain.connect(car.frequency);
    
    car.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    mod.start();
    car.start();
    
    mod.stop(now + 0.45);
    car.stop(now + 0.45);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 6. Glorious purification "成仏" Bell ring
export function playAscensionSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Buddhist temple bowl / heavy pure bell ring
    // Low frequency base with rich high resonance harmonics
    const components = [180, 271, 359, 442, 545, 720]; // Rich dissonant yet pure harmonics
    components.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Higher frequencies decay faster
      const decayTime = 2.5 - (idx * 0.25);
      const volume = 0.12 / (idx + 1);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.2, decayTime));
      
      osc.start();
      osc.stop(now + 3.0);
    });
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

// 7. Ambient purification drone background BGM
export function toggleSpookyBgm(play: boolean) {
  try {
    if (!play) {
      if (bgmNode) {
        bgmNode.stop();
        bgmNode = null;
      }
      isBgmPlaying = false;
      return;
    }

    if (isBgmPlaying) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Low atmospheric frequency drone (72 Hz) and 108 Hz (mystical Shinto numbers)
    const baseNode = ctx.createOscillator();
    const harmonicNode = ctx.createOscillator();
    bgmAmp = ctx.createGain();
    
    baseNode.type = 'triangle';
    baseNode.frequency.setValueAtTime(74, now);
    
    harmonicNode.type = 'sine';
    harmonicNode.frequency.setValueAtTime(111, now);
    
    baseNode.connect(bgmAmp);
    harmonicNode.connect(bgmAmp);
    bgmAmp.connect(ctx.destination);
    
    bgmAmp.gain.setValueAtTime(0, now);
    bgmAmp.gain.linearRampToValueAtTime(0.04, now + 2.0); // very soft
    
    baseNode.start();
    harmonicNode.start();
    
    bgmNode = baseNode; // just keep track of one to stop
    isBgmPlaying = true;
  } catch (e) {
    console.warn("BGM start failed:", e);
  }
}
