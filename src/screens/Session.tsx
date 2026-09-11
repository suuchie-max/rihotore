import { useEffect, useRef, useState } from 'react';
import { HIT_MOVES, STRETCH_PARTS, VIDEOS } from '../data/exercises';
import YouTube from '../components/YouTube';
import { IconBack, IconCheck, IconClock } from '../components/Icons';
import { go } from '../lib/router';
import { beep, vibrate } from '../lib/media';
import { type AppState, fmtSec, getDay, todayKey } from '../lib/state';

interface Props { kind: 'stretch' | 'hit'; state: AppState; update: (fn: (s: AppState) => AppState) => void }

// ストレッチ / HIT: 動画に合わせて通しでやる画面
export default function Session({ kind, state, update }: Props) {
  const key = todayKey();
  const day = getDay(state, key);
  const video = VIDEOS[kind];
  const parts = kind === 'stretch' ? STRETCH_PARTS : HIT_MOVES;
  const already = kind === 'stretch' ? !!day.stretchDoneAt : !!day.hitDoneAt;
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const finish = () => {
    const sec = Math.floor((Date.now() - startRef.current) / 1000);
    update(s => {
      const dd = getDay(s, key);
      if (kind === 'stretch') { dd.stretchDoneAt = new Date().toISOString(); dd.stretchSec = sec; }
      else dd.hitDoneAt = new Date().toISOString();
      s.days[key] = dd; return s;
    });
    beep('done'); vibrate([100, 50, 200]);
    go('');
  };

  return (
    <div className="screen exercise">
      <header className="ex-head">
        <button className="round-btn" onClick={() => go('')} aria-label="もどる"><IconBack size={20} /></button>
        <div className="center-col">
          <div className="muted small">{kind === 'stretch' ? 'ストレッチ' : 'HIT(おまけ)'}</div>
          <b>{video.title}</b>
        </div>
        <div className="pill small"><IconClock size={16} /><span>{fmtSec(elapsed)}</span></div>
      </header>

      <div className="video-wrap">
        <YouTube videoId={video.id} start={start} autoplay />
      </div>

      <div className="ex-body">
        <div className="muted small">{kind === 'stretch' ? '動画に合わせて、ぜんぶやろう。部位をタップするとそこから見られるよ。' : '画面のタイマーに合わせて 10秒動く → 休憩。8種目で約2分。'}</div>
        <ul className="parts">
          {parts.map(p => (
            <li key={p.name}>
              <button className={`part ${start === p.start ? 'on' : ''}`} onClick={() => setStart(p.start)}>
                <span className="muted tiny">{fmtSec(p.start)}</span>
                <span>{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="grow" />
        <button className="btn primary big" onClick={finish} disabled={already}>
          <IconCheck size={22} strokeWidth={3} /> {already ? 'きょうは もうできてる' : 'ぜんぶできた!'}
        </button>
        <div className="muted tiny center">{kind === 'stretch' ? 'ストレッチスタンプ +1pt' : 'HITボーナス +1pt'}</div>
      </div>
    </div>
  );
}
