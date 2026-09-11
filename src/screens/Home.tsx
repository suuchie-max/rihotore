import { HIT_ESTIMATE_SEC, MAX_ROUNDS, STRETCH_ESTIMATE_SEC, TRAINING, WAKE_DEADLINE, roundEstimateSec } from '../data/exercises';
import { OPEN_MESSAGES, pickMessage } from '../data/messages';
import Character from '../components/Character';
import { IconBolt, IconCheck, IconChevron, IconFlame, IconSun, IconBall, IconStretch } from '../components/Icons';
import { go } from '../lib/router';
import {
  type AppState, WEEKDAY_JA, activeRound, completedRounds, dayPoints, evolution, fmtMin, fmtSec, getDay,
  keyToDate, nextExerciseIndex, pointsToYen, scheduleFor, streak, todayKey, totalPoints, unredeemedPoints, weekPoints,
} from '../lib/state';
import { unlockAudio } from '../lib/media';
import { startBgm } from '../lib/bgm';
import { bgmPreferred } from '../components/BgmButton';
import { POINTS_PER_YEN } from '../data/exercises';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void }

export default function Home({ state, update }: Props) {
  const key = todayKey();
  const d = keyToDate(key);
  const day = getDay(state, key);
  const sch = scheduleFor(key);
  const pts = dayPoints(day);
  const evo = evolution(totalPoints(state));
  const now = new Date();
  const beforeDeadline = now.getHours() < WAKE_DEADLINE.hour || (now.getHours() === WAKE_DEADLINE.hour && now.getMinutes() <= WAKE_DEADLINE.minute);
  const rounds = completedRounds(day);
  const cur = activeRound(day);
  const nextIdx = cur ? nextExerciseIndex(cur) : 0;
  const doneCount = cur ? Object.keys(cur.done).length : 0;
  const roundNo = cur ? day.rounds.indexOf(cur) + 1 : rounds + 1;
  const unredeemed = unredeemedPoints(state);
  const toNext = POINTS_PER_YEN.points - (unredeemed % POINTS_PER_YEN.points);

  const msg = pickMessage(OPEN_MESSAGES, key + (sch.training ? 't' : '') + evo.stage);

  const mark = (fn: (day: ReturnType<typeof getDay>) => void) => update(s => {
    const dd = getDay(s, key); fn(dd); s.days[key] = dd; return s;
  });

  const startTraining = () => {
    unlockAudio();
    if (bgmPreferred()) startBgm();
    update(s => {
      const dd = getDay(s, key);
      if (!activeRound(dd) && completedRounds(dd) < MAX_ROUNDS) dd.rounds.push({ startedAt: new Date().toISOString(), done: {} });
      s.days[key] = dd; return s;
    });
    go('exercise');
  };

  return (
    <div className="screen home">
      <header className="home-head">
        <div>
          <div className="muted small">{d.getMonth() + 1}月{d.getDate()}日 {WEEKDAY_JA[d.getDay()]}曜日</div>
          <h1>きょうのメニュー</h1>
        </div>
        <div className="pill"><IconFlame size={18} /><span>{streak(state)}日 れんぞく</span></div>
      </header>

      <section className="chara-row">
        <Character stage={evo.stage} size={104} happy={pts.training > 0} />
        <div className="bubble">
          <p>{msg}</p>
          <div className="muted tiny">{evo.nextName ? `${evo.name} → ${evo.nextName}まで あと${evo.next}pt` : `${evo.name}(さいこう!)`}</div>
        </div>
      </section>

      {(beforeDeadline || day.wakeAt) && (
        <button className={`banner wake ${day.wakeAt ? 'done' : ''}`} disabled={!!day.wakeAt}
          onClick={() => mark(dd => { dd.wakeAt = new Date().toISOString(); })}>
          <span className="row"><IconSun size={22} /><b>{day.wakeAt ? '早起きできた!' : '起きた! (6:30まで)'}</b></span>
          <b className="accent">+1pt</b>
        </button>
      )}

      {sch.practice && (
        <button className={`banner practice ${day.practiceAt ? 'done' : ''}`} disabled={!!day.practiceAt}
          onClick={() => mark(dd => { dd.practiceAt = new Date().toISOString(); })}>
          <span className="row"><IconBall size={22} /><b>{day.practiceAt ? '練習スタンプ もらった!' : '今日はチーム練習の日。練習行ったよ!'}</b></span>
          <b className="accent">+1pt</b>
        </button>
      )}

      <section className="menu">
        {sch.stretch && (
          <button className={`card menu-item ${day.stretchDoneAt ? 'done' : ''}`} onClick={() => { unlockAudio(); go('session/stretch'); }}>
            <span className={`icon-box ${day.stretchDoneAt ? 'green' : 'mint'}`}>{day.stretchDoneAt ? <IconCheck /> : <IconStretch />}</span>
            <span className="grow">
              <b className={day.stretchDoneAt ? 'strike' : ''}>ストレッチ</b>
              <span className="muted small">{day.stretchDoneAt ? `できた! ${fmtSec(day.stretchSec ?? 0)}` : `動画にあわせて ${fmtMin(STRETCH_ESTIMATE_SEC)} · +1pt`}</span>
            </span>
            {!day.stretchDoneAt && <IconChevron size={20} />}
          </button>
        )}

        {sch.training && (
          <div className={`card training ${rounds >= MAX_ROUNDS ? 'done' : ''}`}>
            <div className="row between">
              <div>
                <b className="title">{rounds >= MAX_ROUNDS ? 'トレーニング ゴールド!' : `トレーニング ${roundNo}周目`}</b>
                <div className="muted small">{TRAINING.length}しゅもく · {fmtMin(roundEstimateSec())}</div>
              </div>
              <div className="medals">
                {[1, 2, 3].map(n => <span key={n} className={`medal m${n} ${rounds >= n ? 'on' : ''}`} />)}
              </div>
            </div>
            {rounds < MAX_ROUNDS && (<>
              <div className="bar"><div className="fill" style={{ width: `${(doneCount / TRAINING.length) * 100}%` }} /></div>
              <div className="muted small">
                {cur ? `${doneCount} / ${TRAINING.length} できた · つぎは ${TRAINING[nextIdx]?.name ?? ''}` : rounds === 0 ? 'まず1周でOK。ブロンズをとろう!' : `もう1周いく? ${rounds === 1 ? 'シルバー' : 'ゴールド'}までいける`}
              </div>
              <button className="btn primary" onClick={startTraining}>{cur ? 'つづきをやる' : rounds === 0 ? 'はじめる' : 'もう1周いく'}</button>
            </>)}
            {rounds >= MAX_ROUNDS && <div className="muted small">3周クリア。今日はもう最高。</div>}
          </div>
        )}

        {sch.hit && (
          <button className={`card menu-item ${day.hitDoneAt ? 'done' : ''}`} onClick={() => { unlockAudio(); go('session/hit'); }}>
            <span className={`icon-box ${day.hitDoneAt ? 'green' : 'lavender'}`}>{day.hitDoneAt ? <IconCheck /> : <IconBolt />}</span>
            <span className="grow">
              <b>HIT <span className="tag">おまけ</span></b>
              <span className="muted small">{day.hitDoneAt ? 'できた! ボーナス +1pt' : `動画にあわせて ${fmtMin(HIT_ESTIMATE_SEC)} · +1pt`}</span>
            </span>
            {!day.hitDoneAt && <IconChevron size={20} />}
          </button>
        )}
      </section>

      <section className="row between pts">
        <div className="muted small">今週 <b className="big">{weekPoints(state)}</b> pt</div>
        <div className="accent bold small">{unredeemed > 0 && unredeemed % POINTS_PER_YEN.points === 0 ? `${pointsToYen(unredeemed)}円 もらえる!` : `あと${toNext}ptで ${POINTS_PER_YEN.yen}円`}</div>
      </section>

      <button className="btn ghost" onClick={() => go('settings')}>せってい</button>
    </div>
  );
}
