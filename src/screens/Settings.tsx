import { useEffect, useState } from 'react';
import { POINTS_PER_YEN } from '../data/exercises';
import { type AppState, pointsToYen, unredeemedPoints } from '../lib/state';
import { getPitch, getVoiceName, japaneseVoices, setPitch, setVoiceName, speak } from '../lib/media';
import { isBgmPlaying, startBgm, stopBgm } from '../lib/bgm';
import { configured, isParentMode, shareUrl } from '../lib/sync';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void }

const SAMPLE = 'こんにちは。きょうもいっしょにがんばろう。まず1周でOKだよ。';

export default function Settings({ state, update }: Props) {
  const [parentOpen, setParentOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(japaneseVoices());
  const [voice, setVoice] = useState<string>(getVoiceName() ?? '');
  const [pitch, setPitchState] = useState<number>(getPitch());
  const [bgm, setBgm] = useState(isBgmPlaying());
  const unredeemed = unredeemedPoints(state);
  const canCash = unredeemed >= POINTS_PER_YEN.points;

  useEffect(() => {
    const refresh = () => setVoices(japaneseVoices());
    refresh();
    window.speechSynthesis?.addEventListener?.('voiceschanged', refresh);
    const t = setTimeout(refresh, 800);
    return () => { window.speechSynthesis?.removeEventListener?.('voiceschanged', refresh); clearTimeout(t); };
  }, []);

  const voiceLabel = (v: SpeechSynthesisVoice) => {
    const n = v.name;
    if (/O-?Ren/i.test(n)) return 'オーレン(なめらか・高め)';
    if (/Hattori/i.test(n)) return 'ハットリ(男の子っぽい)';
    if (/Kyoko/i.test(n) && /拡張|Enhanced|Premium/i.test(n)) return 'キョウコ(高音質)';
    if (/Kyoko/i.test(n)) return 'キョウコ(標準)';
    return n;
  };

  return (
    <div className="screen">
      <h1>せってい</h1>

      <div className="card col gap-s">
        <b>よみあげの声</b>
        {voices.length === 0 ? (
          <div className="muted small">声のリストを読みこみ中…(iPhoneでは一度「聞いてみる」を押すと出てくることがあります)</div>
        ) : (
          <select className="input" value={voice} onChange={e => { setVoice(e.target.value); setVoiceName(e.target.value || null); }}>
            <option value="">おまかせ(いちばん自然な声)</option>
            {voices.map(v => <option key={v.name} value={v.name}>{voiceLabel(v)}</option>)}
          </select>
        )}
        <div className="muted small">声の高さ: {pitch.toFixed(2)}</div>
        <input type="range" min="0.8" max="1.6" step="0.05" value={pitch} onChange={e => { const p = Number(e.target.value); setPitchState(p); setPitch(p); }} />
        <button className="btn secondary" onClick={() => speak(SAMPLE)}>聞いてみる</button>
        <div className="muted tiny">もっと自然な声にしたいときは、iPhoneの「設定 → アクセシビリティ → 読み上げコンテンツ → 声 → 日本語」で「O-Ren」や「Kyoko(拡張)」をダウンロードしてから、ここで選んでね。</div>
      </div>

      <div className="card col gap-s">
        <b>BGM</b>
        <div className="muted small">トレーニング中にやさしい音楽を流すよ。トレーニング画面の右上でもON/OFFできる。</div>
        <button className="btn secondary" onClick={() => { if (isBgmPlaying()) { stopBgm(); setBgm(false); } else { startBgm(); setBgm(true); } }}>
          {bgm ? 'BGMを止める' : 'BGMを聞いてみる'}
        </button>
      </div>

      <div className="card col gap-s">
        <b>リマインドの時間</b>
        <div className="muted small">通知の機能は次のバージョンで。いまは時間をおぼえておくだけ。</div>
        <input type="time" className="input" value={state.settings.notifyTime ?? '19:00'}
          onChange={e => update(s => { s.settings.notifyTime = e.target.value; return s; })} />
      </div>

      <div className="card col gap-s">
        <button className="btn ghost" onClick={() => setParentOpen(o => !o)}>おうちの人メニュー {parentOpen ? '▲' : '▼'}</button>
        {parentOpen && (<>
          {configured() && (<>
            <div className="muted small">おうちの人のスマホでこのリンクを開くと、記録を見られるよ。</div>
            <button className="btn secondary" onClick={async () => { const url = shareUrl('parent'); try { if (navigator.share) await navigator.share({ title: '梨歩トレ(おうちの人用)', url }); else { await navigator.clipboard.writeText(url); alert('コピーしました'); } } catch { /* cancelled */ } }}>おうちの人用リンクを送る</button>
            {isParentMode() && <div className="muted tiny">この端末は「おうちの人モード」です。</div>}
          </>)}
          <div className="muted small">まだもらってないpt: <b>{unredeemed}</b>({pointsToYen(unredeemed)}円)</div>
          <button className="btn outline" disabled={!canCash} onClick={() => update(s => {
            s.cashouts.push({ at: new Date().toISOString(), points: POINTS_PER_YEN.points, yen: POINTS_PER_YEN.yen });
            return s;
          })}>{POINTS_PER_YEN.yen}円 渡した(−{POINTS_PER_YEN.points}pt)</button>
          <button className="btn ghost danger" onClick={() => { if (confirm('ぜんぶの記録を消します。ほんとうに?')) { localStorage.clear(); location.reload(); } }}>記録をぜんぶ消す(テスト用)</button>
        </>)}
      </div>

      <div className="muted tiny center">梨歩トレ(仮) v0.3</div>
    </div>
  );
}
