import { useEffect, useState } from 'react';
import { stopBgm } from '../lib/bgm';
import { MAX_ROUNDS, POINTS_PER_YEN } from '../data/exercises';
import { DONE_MESSAGES, pickMessage } from '../data/messages';
import Character from '../components/Character';
import { go } from '../lib/router';
import {
  type AppState, type Mood, GRADE_NAME, completedRounds, dayPoints, evolution, fmtSec, getDay, streak, todayKey, totalPoints, trainingGrade, unredeemedPoints,
} from '../lib/state';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void }

const MEDAL_COLOR = { 1: '#c98a5b', 2: '#a9adb8', 3: '#e2b13c' } as const;
const MEDAL_BG = { 1: '#f3d6bd', 2: '#e6e8ee', 3: '#fbe8b0' } as const;

export default function RoundDone({ state, update }: Props) {
  const key = todayKey();
  const day = getDay(state, key);
  const rounds = completedRounds(day);
  const grade = trainingGrade(day);
  const last = day.rounds[rounds - 1];
  const sec = last ? Object.values(last.done).reduce((s, d) => s + d.sec, 0) : 0;
  const evo = evolution(totalPoints(state));
  const pts = dayPoints(day);
  const unredeemed = unredeemedPoints(state);
  const toYen = POINTS_PER_YEN.points - (unredeemed % POINTS_PER_YEN.points || POINTS_PER_YEN.points);
  const [mood, setMood] = useState<Mood | undefined>(day.mood);
  useEffect(() => { stopBgm(); }, []);

  // 前回の同じ周との比較
  const prevDays = Object.values(state.days).filter(d => d.date < key && d.rounds.some(r => r.doneAt)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const prevSec = prevDays[0]?.rounds.filter(r => r.doneAt)[0] ? Object.values(prevDays[0].rounds.filter(r => r.doneAt)[0].done).reduce((s, d) => s + d.sec, 0) : 0;
  const faster = prevSec > 0 && sec < prevSec;

  const g = (grade || 1) as 1 | 2 | 3;
  const msg = pickMessage(DONE_MESSAGES, key + rounds);

  const setMoodAndSave = (m: Mood) => {
    setMood(m);
    update(s => { const dd = getDay(s, key); dd.mood = m; s.days[key] = dd; return s; });
  };

  if (rounds === 0) { go(''); return null; }

  return (
    <div className="screen done">
      <div className="center-col top">
        <div className="muted small spaced">{rounds}周目 クリア!</div>
        <h1>{rounds >= MAX_ROUNDS ? 'ぜんぶできた!' : 'きょうの分、できた!'}</h1>
      </div>

      <div className="medal-wrap pop">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" fill="#fff" stroke="#f0dcd6" strokeWidth="4" />
          <circle cx="100" cy="100" r="76" fill={MEDAL_BG[g]} />
          <circle cx="100" cy="100" r="76" fill="none" stroke={MEDAL_COLOR[g]} strokeWidth="6" />
          <path d="M100 42 l14 30 l33 4 l-24 22 l6 33 l-29 -16 l-29 16 l6 -33 l-24 -22 l33 -4 z" fill={MEDAL_COLOR[g]} />
          <text x="100" y="158" textAnchor="middle" fontSize="15" fontWeight="900" fill="#5a4a3e">{GRADE_NAME[grade]}</text>
        </svg>
        <div className="badge-pt">+1pt</div>
      </div>

      <div className="chara-row narrow">
        <Character stage={evo.stage} size={72} happy />
        <div className="bubble">
          <p>{fmtSec(sec)}でクリア!{faster ? 'まえより速い。' : ''}{msg}</p>
          {evo.nextName && <div className="muted tiny">{evo.nextName}まで あと{evo.next}pt</div>}
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span className="muted tiny">今日のpt</span><b>{pts.total}</b></div>
        <div className="stat"><span className="muted tiny">れんぞく</span><b>{streak(state)}日</b></div>
        <div className="stat"><span className="muted tiny">{POINTS_PER_YEN.yen}円まで</span><b className="accent">{toYen === POINTS_PER_YEN.points && unredeemed > 0 && unredeemed % POINTS_PER_YEN.points === 0 ? 'もらえる!' : `あと${toYen}`}</b></div>
      </div>

      <div className="mood">
        <div className="muted small">きょうの調子は?</div>
        <div className="row gap">
          {([['hard', 'きつかった'], ['ok', 'ふつう'], ['easy', 'らくしょう']] as [Mood, string][]).map(([m, label]) => (
            <button key={m} className={`chip ${mood === m ? 'on' : ''}`} onClick={() => setMoodAndSave(m)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grow" />

      <div className="col gap">
        {rounds < MAX_ROUNDS && (
          <button className="btn outline" onClick={() => {
            update(s => { const dd = getDay(s, key); dd.rounds.push({ startedAt: new Date().toISOString(), done: {} }); s.days[key] = dd; return s; });
            go('exercise');
          }}>もう1周いく? → {GRADE_NAME[(rounds + 1) as 1 | 2 | 3]}</button>
        )}
        <button className="btn primary" onClick={() => go('')}>きょうはここまで</button>
      </div>
    </div>
  );
}
