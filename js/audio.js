/* ==========================================================================
   AUDIO SINTETIZZATO (WEB AUDIO API - ZERO FILE ESTERNI)
   Effetti sonori + musica di sottofondo generata in tempo reale.
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

/* Suona una nota con inviluppo semplice. */
function playNote(midi, start, dur, type, vol) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(midiToFreq(midi), start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (type === 'blip') {
      playNote(81, now, 0.07, 'triangle', 0.08);
    } else if (type === 'success') {
      [72, 76, 79].forEach((n, i) => playNote(n, now + i * 0.09, 0.22, 'sine', 0.12));
    } else if (type === 'hit') {
      playNote(60, now, 0.08, 'square', 0.06);
      [76, 79, 84].forEach((n, i) => playNote(n, now + 0.05 + i * 0.07, 0.2, 'triangle', 0.1));
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'crystal') {
      [84, 88, 91, 96, 91, 96].forEach((n, i) => playNote(n, now + i * 0.07, 0.35, 'sine', 0.09));
    } else if (type === 'defeat') {
      [67, 63, 60, 55].forEach((n, i) => playNote(n, now + i * 0.18, 0.3, 'triangle', 0.1));
    } else if (type === 'victory') {
      [72, 76, 79, 84, 79, 84, 88].forEach((n, i) => playNote(n, now + i * 0.12, 0.35, 'triangle', 0.1));
    }
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   MUSICA: sequencer a crome. null = pausa.
   -------------------------------------------------------------------------- */
const MUSIC = {
  // Tema della schermata iniziale: lento ed epico in Re maggiore
  title: {
    bpm: 112,
    melody: [62, null, 66, 69, null, 74, 73, null, 71, 69, null, null,
             67, null, 71, 74, null, 76, 74, null, 73, 74, null, null],
    bass:   [50, null, null, null, null, null, 45, null, null, null, null, null,
             43, null, null, null, null, null, 45, null, null, null, null, null]
  },
  // Canzone marinaresca in Re minore (6/8)
  shanty: {
    bpm: 150,
    melody: [69, null, 74, 74, 72, 70, 69, null, 67, 65, null, 67,
             69, null, 74, 74, 72, 70, 69, 67, 65, 64, 62, null],
    bass:   [50, null, null, 57, null, null, 50, null, null, 57, null, null,
             46, null, null, 53, null, null, 45, null, null, 52, null, null]
  },
  // Taverna: stessa canzone, più veloce
  tavern: {
    bpm: 175,
    melody: [62, 65, 69, 74, null, 72, 70, 69, 67, null, 65, 67,
             69, 70, 72, 74, null, 72, 70, 69, 67, 65, 62, null],
    bass:   [50, null, 57, null, 50, null, 55, null, 50, null, 55, null,
             46, null, 53, null, 45, null, 52, null, 50, null, null, null]
  },
  // Arpeggi misteriosi in La minore
  mystery: {
    bpm: 120,
    melody: [57, 60, 64, 69, 64, 60, 57, 60, 65, 69, 65, 60,
             55, 59, 62, 67, 62, 59, 56, 59, 64, 68, 64, 59],
    bass:   [45, null, null, null, null, null, 41, null, null, null, null, null,
             43, null, null, null, null, null, 40, null, null, null, null, null]
  },
  // Officina: ritmo meccanico
  workshop: {
    bpm: 160,
    melody: [64, null, 67, 64, 71, null, 69, 67, 64, null, 62, null,
             64, null, 67, 64, 72, null, 71, 69, 67, null, 66, null],
    bass:   [40, 40, null, 40, 47, null, 40, 40, null, 40, 45, null,
             40, 40, null, 40, 48, null, 47, 47, null, 45, 43, null]
  },
  // Duello finale
  boss: {
    bpm: 172,
    melody: [64, null, 64, 67, null, 64, 71, null, 69, 67, 66, null,
             64, null, 64, 67, null, 64, 62, null, 64, null, null, null],
    bass:   [40, null, 40, null, 40, null, 47, null, 47, null, 47, null,
             36, null, 36, null, 36, null, 38, null, 38, null, 38, null]
  }
};

const Music = {
  timer: null,
  current: null,
  step: 0,
  nextTime: 0,

  play(name) {
    if (name && name === this.current && this.timer) return;
    this.stop();
    this.current = name || this.current;
    if (!soundEnabled || !this.current || !MUSIC[this.current] || document.hidden) return;
    try {
      const ctx = getAudioCtx();
      this.step = 0;
      this.nextTime = ctx.currentTime + 0.1;
      this.timer = setInterval(() => this.tick(), 60);
    } catch (e) {}
  },

  tick() {
    const p = MUSIC[this.current];
    const ctx = getAudioCtx();
    const stepDur = 60 / p.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.25) {
      const m = p.melody[this.step % p.melody.length];
      if (m != null) playNote(m, this.nextTime, stepDur * 0.9, 'triangle', 0.028);
      const b = p.bass[this.step % p.bass.length];
      if (b != null) playNote(b, this.nextTime, stepDur * 2.2, 'sine', 0.05);
      this.nextTime += stepDur;
      this.step++;
    }
  },

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
};

function toggleAudio() {
  soundEnabled = !soundEnabled;
  document.querySelectorAll('.audio-toggle').forEach(b => { b.textContent = soundEnabled ? '🔊' : '🔇'; });
  if (soundEnabled) Music.play(Music.current);
  else Music.stop();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) Music.stop();
  else if (soundEnabled && Music.current) Music.play(Music.current);
});
