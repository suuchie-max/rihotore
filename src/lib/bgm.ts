// アプリ内蔵のBGM。音楽ファイルを使わず、WebAudioでやさしいループを生成する。
// C メジャーペンタトニックのアルペジオ + 柔らかいパッド + 軽いキック。

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let playing = false;

const CHORDS = [
  [261.63, 329.63, 392.0, 493.88],   // Cmaj7
  [196.0, 246.94, 293.66, 392.0],    // G
  [220.0, 261.63, 329.63, 392.0],    // Am7
  [174.61, 220.0, 261.63, 349.23],   // F
];
const BPM = 92;
const BEAT = 60 / BPM;

function ac(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pluck(t: number, freq: number, dur: number, vol: number) {
  const c = ac();
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = freq;
  f.type = 'lowpass'; f.frequency.value = 1800;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(master!);
  o.start(t); o.stop(t + dur + 0.05);
}

function pad(t: number, freqs: number[], dur: number) {
  const c = ac();
  for (const fr of freqs) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = fr / 2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.6);
    g.gain.setValueAtTime(0.035, t + dur - 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master!);
    o.start(t); o.stop(t + dur + 0.05);
  }
}

function kick(t: number) {
  const c = ac();
  const o = c.createOscillator(), g = c.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g).connect(master!);
  o.start(t); o.stop(t + 0.2);
}

let nextBar = 0;
let barIndex = 0;

function scheduleBar() {
  const c = ac();
  const barDur = BEAT * 4;
  while (nextBar < c.currentTime + 1.2) {
    const chord = CHORDS[barIndex % CHORDS.length];
    pad(nextBar, chord, barDur);
    // 8分音符のアルペジオ(上下)
    const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
    pattern.forEach((idx, i) => {
      const t = nextBar + i * (BEAT / 2);
      const octave = i % 4 === 3 ? 2 : 1;
      pluck(t, chord[idx] * octave, BEAT * 0.9, i % 2 === 0 ? 0.09 : 0.06);
    });
    kick(nextBar); kick(nextBar + BEAT * 2);
    nextBar += barDur;
    barIndex++;
  }
}

export function startBgm() {
  const c = ac();
  if (playing) return;
  playing = true;
  nextBar = c.currentTime + 0.05;
  master!.gain.cancelScheduledValues(c.currentTime);
  master!.gain.setValueAtTime(0.0001, c.currentTime);
  master!.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 1.5);
  scheduleBar();
  timer = window.setInterval(scheduleBar, 400);
}

export function stopBgm() {
  if (!playing || !ctx || !master) return;
  playing = false;
  if (timer) { clearInterval(timer); timer = null; }
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
}

export function isBgmPlaying() { return playing; }

// 読み上げ中は少し小さく
export function duckBgm(on: boolean) {
  if (!playing || !ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(on ? 0.15 : 0.5, ctx.currentTime + 0.3);
}
