// 読み上げ・効果音

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.95;
    const ja = synth.getVoices().find(v => v.lang.startsWith('ja'));
    if (ja) u.voice = ja;
    synth.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

// ユーザー操作の中で一度呼んでおくと iOS でも音が鳴る
export function unlockAudio() { audio(); }

export function beep(kind: 'tick' | 'go' | 'done' = 'go') {
  const c = audio();
  if (!c) return;
  const seq = kind === 'tick' ? [[880, 0.08]] : kind === 'go' ? [[660, 0.12], [990, 0.2]] : [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]];
  let t = c.currentTime;
  for (const [freq, dur] of seq) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
    t += dur + 0.04;
  }
}

export function vibrate(ms: number | number[]) {
  try { navigator.vibrate?.(ms); } catch { /* ignore */ }
}
