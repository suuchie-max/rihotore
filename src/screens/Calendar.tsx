import { STUDY_SUBJECTS } from '../lib/state';
import { useState } from 'react';
import { type AppState, WEEKDAY_JA, dayPoints, fmtSec, getDay, streak, todayKey, totalPoints, trainingGrade, GRADE_NAME } from '../lib/state';

interface Props { state: AppState }

const MOOD_JA = { hard: 'きつかった', ok: 'ふつう', easy: 'らくしょう' } as const;

export default function Calendar({ state }: Props) {
  const today = todayKey();
  const [ym, setYm] = useState(() => today.slice(0, 7));
  const [sel, setSel] = useState<string>(today);
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const daysIn = new Date(y, m, 0).getDate();
  const lead = first.getDay();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) => { const d = new Date(y, m - 1 + n, 1); setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };
  const selDay = getDay(state, sel);
  const sp = dayPoints(selDay);
  const grade = trainingGrade(selDay);

  return (
    <div className="screen">
      <header className="row between">
        <h1>カレンダー</h1>
        <div className="pill"><span>{streak(state)}日 れんぞく</span></div>
      </header>

      <div className="row between month-nav">
        <button className="round-btn" onClick={() => shift(-1)}>‹</button>
        <b>{y}年{m}月</b>
        <button className="round-btn" onClick={() => shift(1)}>›</button>
      </div>

      <div className="cal">
        {WEEKDAY_JA.map(w => <div key={w} className="cal-w muted tiny">{w}</div>)}
        {cells.map((k, i) => {
          if (!k) return <div key={i} />;
          const d = getDay(state, k);
          const p = dayPoints(d);
          const g = trainingGrade(d);
          return (
            <button key={k} className={`cal-d ${k === sel ? 'sel' : ''} ${k === today ? 'today' : ''} ${k > today ? 'future' : ''}`} onClick={() => setSel(k)}>
              <span className="num">{Number(k.slice(-2))}</span>
              <span className="marks">
                {g > 0 && <span className={`medal m${g} on`} />}
                {p.stretch > 0 && <span className="dot mint" />}
                {p.hit > 0 && <span className="dot lavender" />}
                {p.practice > 0 && <span className="dot sky" />}
                {p.wake > 0 && <span className="dot sun" />}
                {(p.japanese + p.math + p.english > 0) && <span className="dot lavender" title="お勉強" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card col gap">
        <b>{Number(sel.slice(5, 7))}月{Number(sel.slice(8))}日 ({WEEKDAY_JA[new Date(sel).getDay()]})</b>
        {sp.total === 0 ? <div className="muted small">スタンプなし</div> : (
          <ul className="stamp-list">
            {sp.wake > 0 && <li><span className="dot sun" />早起き <b>+1</b></li>}
            {sp.practice > 0 && <li><span className="dot sky" />チーム練習 <b>+1</b></li>}
            {sp.stretch > 0 && <li><span className="dot mint" />ストレッチ {selDay.stretchSec ? fmtSec(selDay.stretchSec) : ''} <b>+1</b></li>}
            {grade > 0 && <li><span className={`medal m${grade} on`} />トレーニング {GRADE_NAME[grade]}({selDay.rounds.filter(r => r.doneAt).length}周) <b>+{grade}</b></li>}
            {sp.hit > 0 && <li><span className="dot lavender" />HIT <b>+1</b></li>}
            {STUDY_SUBJECTS.map(subject => sp[subject.key] > 0 && <li key={subject.key}><span className="dot lavender" />{subject.label} <b>+1</b></li>)}
          </ul>
        )}
        {selDay.mood && <div className="muted small">調子: {MOOD_JA[selDay.mood]}</div>}
        {selDay.memo && <div className="small">{selDay.memo}</div>}
      </div>

      <div className="muted small center">これまでの合計 {totalPoints(state)} pt</div>
    </div>
  );
}
