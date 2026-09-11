import { useState } from 'react';
import { POINTS_PER_YEN } from '../data/exercises';
import { type AppState, pointsToYen, unredeemedPoints } from '../lib/state';
import { speak } from '../lib/media';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void }

export default function Settings({ state, update }: Props) {
  const [parentOpen, setParentOpen] = useState(false);
  const unredeemed = unredeemedPoints(state);
  const canCash = unredeemed >= POINTS_PER_YEN.points;

  return (
    <div className="screen">
      <h1>せってい</h1>

      <div className="card col gap-s">
        <b>リマインドの時間</b>
        <div className="muted small">通知の機能は次のバージョンで。いまは時間をおぼえておくだけ。</div>
        <input type="time" className="input" value={state.settings.notifyTime ?? '19:00'}
          onChange={e => update(s => { s.settings.notifyTime = e.target.value; return s; })} />
      </div>

      <div className="card col gap-s">
        <b>よみあげテスト</b>
        <button className="btn secondary" onClick={() => speak('こんにちは。きょうもいっしょにがんばろう。')}>声を聞いてみる</button>
      </div>

      <div className="card col gap-s">
        <button className="btn ghost" onClick={() => setParentOpen(o => !o)}>おうちの人メニュー {parentOpen ? '▲' : '▼'}</button>
        {parentOpen && (<>
          <div className="muted small">まだもらってないpt: <b>{unredeemed}</b>({pointsToYen(unredeemed)}円)</div>
          <button className="btn outline" disabled={!canCash} onClick={() => update(s => {
            s.cashouts.push({ at: new Date().toISOString(), points: POINTS_PER_YEN.points, yen: POINTS_PER_YEN.yen });
            return s;
          })}>{POINTS_PER_YEN.yen}円 渡した(−{POINTS_PER_YEN.points}pt)</button>
          <button className="btn ghost danger" onClick={() => { if (confirm('ぜんぶの記録を消します。ほんとうに?')) { localStorage.clear(); location.reload(); } }}>記録をぜんぶ消す(テスト用)</button>
        </>)}
      </div>

      <div className="muted tiny center">梨歩トレ(仮) v0.1</div>
    </div>
  );
}
