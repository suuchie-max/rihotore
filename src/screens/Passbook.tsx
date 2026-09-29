import { STUDY_SUBJECTS } from '../lib/state';
import { POINTS_PER_YEN } from '../data/exercises';
import { type AppState, cashedPoints, dayPoints, evolution, pointsToYen, totalPoints, unredeemedPoints, weekPoints } from '../lib/state';

interface Props { state: AppState }

export default function Passbook({ state }: Props) {
  const total = totalPoints(state);
  const unredeemed = unredeemedPoints(state);
  const yen = pointsToYen(unredeemed);
  const toNext = POINTS_PER_YEN.points - (unredeemed % POINTS_PER_YEN.points);
  const evo = evolution(total);

  const breakdown = Object.values(state.days).reduce((acc, d) => {
    const p = dayPoints(d);
    acc.wake += p.wake; acc.stretch += p.stretch; acc.training += p.training; acc.hit += p.hit; acc.practice += p.practice;
    for (const subject of STUDY_SUBJECTS) acc[subject.key] += p[subject.key];
    return acc;
  }, { wake: 0, stretch: 0, training: 0, hit: 0, practice: 0, japanese: 0, math: 0, english: 0 });

  const recent = Object.values(state.days).filter(d => dayPoints(d).total > 0).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 14);

  return (
    <div className="screen">
      <h1>ポイント通帳</h1>

      <div className="card passbook-hero">
        <div className="muted small">まだ もらってない</div>
        <div className="row end gap"><b className="huge">{unredeemed}</b><span>pt</span><span className="accent bold">= {yen}円</span></div>
        <div className="muted small">{unredeemed % POINTS_PER_YEN.points === 0 && unredeemed > 0 ? `${yen}円 もらえるよ!` : `あと${toNext}ptで つぎの${POINTS_PER_YEN.yen}円`}</div>
      </div>

      <div className="stats">
        <div className="stat"><span className="muted tiny">今週</span><b>{weekPoints(state)}</b></div>
        <div className="stat"><span className="muted tiny">ぜんぶ</span><b>{total}</b></div>
        <div className="stat"><span className="muted tiny">もらった</span><b>{pointsToYen(cashedPoints(state))}円</b></div>
      </div>

      <div className="card col gap-s">
        <b>なにでとった?</b>
        <ul className="stamp-list">
          <li><span className="dot sun" />早起き <b>{breakdown.wake}</b></li>
          <li><span className="dot mint" />ストレッチ <b>{breakdown.stretch}</b></li>
          <li><span className="medal m1 on" />トレーニング <b>{breakdown.training}</b></li>
          <li><span className="dot lavender" />HIT <b>{breakdown.hit}</b></li>
          <li><span className="dot sky" />チーム練習 <b>{breakdown.practice}</b></li>
          {STUDY_SUBJECTS.map(subject => <li key={subject.key}><span className="dot lavender" />{subject.label} <b>{breakdown[subject.key]}</b></li>)}
        </ul>
      </div>

      <div className="card col gap-s">
        <b>キャラ: {evo.name}</b>
        {evo.nextName ? <div className="muted small">{evo.nextName}まで あと{evo.next}pt(ぜんぶのptで数えるよ。100円にかえても減らない)</div> : <div className="muted small">さいこうだよ!</div>}
      </div>

      <div className="card col gap-s">
        <b>さいきんの記録</b>
        {recent.length === 0 ? <div className="muted small">まだないよ。今日からはじめよう。</div> : (
          <ul className="ledger">
            {recent.map(d => <li key={d.date}><span>{Number(d.date.slice(5, 7))}/{Number(d.date.slice(8))}</span><b>+{dayPoints(d).total}</b></li>)}
          </ul>
        )}
      </div>

      {state.cashouts.length > 0 && (
        <div className="card col gap-s">
          <b>もらった記録</b>
          <ul className="ledger">{state.cashouts.map((c, i) => <li key={i}><span>{c.at.slice(5, 10).replace('-', '/')}</span><b>{c.yen}円</b></li>)}</ul>
        </div>
      )}
    </div>
  );
}
