import { useEffect, useRef, useState } from 'react';
import { REST_SEC, TRAINING, VIDEOS, type Exercise } from '../data/exercises';
import YouTube from '../components/YouTube';
import BgmButton, { bgmPreferred } from '../components/BgmButton';
import { startBgm, stopBgm } from '../lib/bgm';
import { IconBack, IconCheck, IconClock, IconSpeaker } from '../components/Icons';
import { go } from '../lib/router';
import { beep, speak, stopSpeaking, vibrate } from '../lib/media';
import { type AppState, activeRound, fmtSec, getDay, nextExerciseIndex, todayKey } from '../lib/state';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void }

function repsLabel(ex: Exercise) {
  const sets = ex.sets ? `×${ex.sets}` : '';
  const sides = ex.sides ? ' 右左' : '';
  return `${ex.reps}${ex.unit}${sets}${sides}`;
}

export default function ExerciseScreen({ state, update }: Props) {
  const key = todayKey();
  const day = getDay(state, key);
  const round = activeRound(day);
  const roundNo = round ? day.rounds.indexOf(round) + 1 : 1;
  const idx = round ? nextExerciseIndex(round) : -1;
  const ex = idx >= 0 ? TRAINING[idx] : undefined;

  const [phase, setPhase] = useState<'exercise' | 'rest'>('exercise');
  const [elapsed, setElapsed] = useState(0);
  const [extra, setExtra] = useState(0);
  const [rest, setRest] = useState(REST_SEC);
  const [countdown, setCountdown] = useState<{ left: number; set: number } | null>(null);
  const startRef = useRef(Date.now());

  // 種目のストップウォッチ
  useEffect(() => {
    if (phase !== 'exercise') return;
    startRef.current = Date.now();
    setElapsed(0); setExtra(0); setCountdown(null);
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase, ex?.id]);

  // 休憩カウントダウン
  useEffect(() => {
    if (phase !== 'rest') return;
    setRest(REST_SEC);
    const t = setInterval(() => setRest(r => {
      if (r <= 1) { clearInterval(t); beep('go'); vibrate([100, 50, 100]); setPhase('exercise'); return 0; }
      if (r <= 4) beep('tick');
      return r - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // 時間系種目のカウントダウン(プランク20秒 / ドローイング5秒×5)
  useEffect(() => {
    if (!countdown || !ex) return;
    const t = setInterval(() => setCountdown(c => {
      if (!c) return c;
      if (c.left <= 1) {
        const total = ex.sets ?? 1;
        if (c.set >= total) { clearInterval(t); beep('done'); vibrate(200); return null; }
        beep('go'); return { left: ex.reps, set: c.set + 1 };
      }
      if (c.left <= 4) beep('tick');
      return { ...c, left: c.left - 1 };
    }), 1000);
    return () => clearInterval(t);
  }, [countdown?.set, ex?.id]);

  useEffect(() => { if (bgmPreferred()) startBgm(); return () => { stopSpeaking(); stopBgm(); }; }, []);

  if (!round || !ex) {
    // 周が終わっている、または開始されていない
    return (
      <div className="screen center">
        <p>今日のトレーニングは、ホームから「はじめる」を押してね。</p>
        <button className="btn primary" onClick={() => go('')}>ホームへ</button>
      </div>
    );
  }

  const doneCount = Object.keys(round.done).length;
  const roundTotal = Object.values(round.done).reduce((s, d) => s + d.sec, 0) + elapsed;
  const next = TRAINING[idx + 1];

  const finish = () => {
    stopSpeaking();
    const sec = Math.floor((Date.now() - startRef.current) / 1000);
    const isLast = idx === TRAINING.length - 1;
    update(s => {
      const dd = getDay(s, key);
      const r = activeRound(dd)!;
      r.done[ex.id] = { sec, extraReps: extra };
      if (isLast) r.doneAt = new Date().toISOString();
      s.days[key] = dd; return s;
    });
    if (isLast) { beep('done'); vibrate([100, 50, 100, 50, 300]); go('round-done'); }
    else { beep('tick'); setPhase('rest'); }
  };

  const readAloud = () => speak(`${ex.kana ?? ex.name}。${repsLabel(ex)}。${ex.points.join('。')}`);

  if (phase === 'rest') {
    return (
      <div className="screen rest">
        <div className="muted small">きゅうけい</div>
        <div className="rest-num">{rest}</div>
        <div className="muted">つぎは</div>
        <h2>{ex.name}</h2>
        <div className="accent bold">{repsLabel(ex)}</div>
        {ex.items && <div className="muted small">じゅんび: {ex.items.join('・')}</div>}
        <button className="btn ghost" onClick={() => { beep('go'); setPhase('exercise'); }}>もういける!スキップ</button>
      </div>
    );
  }

  return (
    <div className="screen exercise">
      <header className="ex-head">
        <button className="round-btn" onClick={() => { stopSpeaking(); go(''); }} aria-label="もどる"><IconBack size={20} /></button>
        <div className="center-col">
          <div className="muted small">{roundNo}周目 · {doneCount + 1} / {TRAINING.length}</div>
          <div className="dots">{TRAINING.map((e, i) => <span key={e.id} className={i < doneCount ? 'on' : ''} />)}</div>
        </div>
        <div className="row gap-s">
          <BgmButton />
          <div className="pill small"><IconClock size={16} /><span>{fmtSec(roundTotal)}</span></div>
        </div>
      </header>

      <div className="video-wrap">
        <YouTube videoId={VIDEOS[ex.video].id} start={ex.start} autoplay />
      </div>

      <div className="ex-body">
        <div className="row between end">
          <div>
            <div className="muted small">{idx + 1}しゅもくめ</div>
            <h2>{ex.name}</h2>
          </div>
          <div className="reps"><b>{ex.reps + (ex.unit === '回' || ex.unit === '往復' ? extra : 0)}</b><span>{ex.unit}{ex.sets ? `×${ex.sets}` : ''}{ex.sides ? ' 右左' : ''}</span></div>
        </div>

        <ol className="points">
          {ex.points.map((p, i) => <li key={i}><span className="num">{i + 1}</span><span>{p}</span></li>)}
        </ol>

        {ex.timed && (
          <div className="timed">
            {countdown ? (
              <div className="countdown">
                <div className="cd-num">{countdown.left}</div>
                {ex.sets && <div className="muted small">{countdown.set} / {ex.sets} セット</div>}
              </div>
            ) : (
              <button className="btn secondary" onClick={() => { beep('go'); setCountdown({ left: ex.reps, set: 1 }); }}>
                {ex.reps}秒タイマー スタート
              </button>
            )}
          </div>
        )}

        <div className="row between">
          <div className="row gap muted small">
            <IconClock size={16} />
            <span>このしゅもく</span>
            <b className="dark">{fmtSec(elapsed)}</b>
            <span>/ めやす {fmtSec(ex.estimateSec)}</span>
          </div>
          <div className="row gap">
            <button className="chip" onClick={readAloud}><IconSpeaker size={14} /> よみあげ</button>
            {(ex.unit === '回' || ex.unit === '往復') && (
              <button className="chip" onClick={() => setExtra(e => e + 5)}>+5{ex.unit}</button>
            )}
          </div>
        </div>

        <div className="grow" />

        <button className="btn primary big" onClick={finish}><IconCheck size={22} strokeWidth={3} /> できた!</button>
        <div className="muted tiny center">
          {next ? `できた! を押すと ${REST_SEC}秒休けい → つぎは「${next.name}」` : 'これが最後!できた! で1周クリア'}
        </div>
      </div>
    </div>
  );
}
