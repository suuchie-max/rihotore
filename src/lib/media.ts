// 読み上げ・効果音
import { duckBgm } from './bgm';

const VOICE_KEY = 'riho-tore-voice';
const PITCH_KEY = 'riho-tore-pitch';

// 高音質・自然な声を優先する並び(iPhone の日本語音声)
const PREFERRED = ['O-Ren', 'Hattori', 'Kyoko (拡張)', 'Kyoko (Enhanced)', 'Kyoko (Premium)', 'Kyoko'];

export function japaneseVoices(): SpeechSynthesisVoice[] {
  try {
    const novelty = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Jester|Organ|Superstar|Trinoids|Whisper|Zarvox|Albert|Fred|Junior|Kathy|Ralph|Good News|Bad News)/i;
    return window.speechSynthesis?.getVoices().filter(v => v.lang.replace('_', '-').toLowerCase().startsWith('ja') && !novelty.test(v.name)) ?? [];
  } catch { return []; }
}

export function getVoiceName(): string | null { try { return localStorage.getItem(VOICE_KEY); } catch { return null; } }
export function setVoiceName(name: string | null) { try { name ? localStorage.setItem(VOICE_KEY, name) : localStorage.removeItem(VOICE_KEY); } catch { /* ignore */ } }
export function getPitch(): number { try { return Number(localStorage.getItem(PITCH_KEY) ?? 1.15); } catch { return 1.15; } }
export function setPitch(p: number) { try { localStorage.setItem(PITCH_KEY, String(p)); } catch { /* ignore */ } }

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = japaneseVoices();
  const saved = getVoiceName();
  if (saved) { const v = voices.find(v => v.name === saved); if (v) return v; }
  for (const p of PREFERRED) { const v = voices.find(v => v.name.startsWith(p)); if (v) return v; }
  return voices[0];
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 1.0;
    u.pitch = getPitch();
    const v = pickVoice();
    if (v) u.voice = v;
    u.onstart = () => duckBgm(true);
    u.onend = () => duckBgm(false);
    u.onerror = () => duckBgm(false);
    synth.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); duckBgm(false); } catch { /* ignore */ }
}

// iOS は声のリストが遅れて届くことがある
try { window.speechSynthesis?.addEventListener?.('voiceschanged', () => { /* リスト更新 */ }); } catch { /* ignore */ }

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
