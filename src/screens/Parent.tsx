import { STUDY_SUBJECTS } from '../lib/state';
import { useState } from 'react';
import { POINTS_PER_YEN, TRAINING } from '../data/exercises';
import { IconCheck } from '../components/Icons';
import { shareUrl } from '../lib/sync';
import {
  type AppState, GRADE_NAME, WEEKDAY_JA, completedRounds, dayPoints, fmtSec, getDay, keyToDate, pointsToYen,
  scheduleFor, streak, todayKey, trainingGrade, unredeemedPoints, weekPoints,
} from '../lib/state';

interface Props { state: AppState; update: (fn: (s: AppState) => AppState) => void; syncing: boolean; lastSync?: string; onRefresh: () => void }

const MOOD_JA = { hard: 'きつかった', ok: 'ふつう', easy: 'らくしょう' } as const;

// 保護者(おうちの人)のホーム画面
export default function Parent({ state, update, syncing, lastSync, onRefresh }: Props) {
  const key = todayKey();
  const d = keyToDate(key);
  const day = getDay(state, key);
  const sch = scheduleFor(key);
  const pts = dayPoints(day);
  const grade = trainingGrade(day);
  const cur = day.rounds.find(r => !r.doneAt);
  const doneCount = cur ? Object.keys(cur.done).length : 0;
  const unredeemed = unredeemedPoints(state);
  const canCash = unredeemed >= POINTS_PER_YEN.points;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (mode: 'child' | 'parent') => {
    const url = shareUrl(mode);
    try {
      if (navigator.share) { await navigator.share({ title: '梨歩トレ', url }); }
      else { await navigator.clipboard.writeText(url); }
      setCopied(mode); setTimeout(() => setCopied(null), 2000);
    } catch { /* cancelled */ }
  };

  const Row = ({ ok, label, sub }: { ok: boolean; label: string; sub?: string }) => (
    <li className="row gap">
      <span className={`icon-box small ${ok ? 'green' : 'off'}`}>{ok ? <IconCheck size={18} /> : <span className="dash">–</span>}</span>
      <span className="grow"><b>{label}</b>{sub && <span className="muted small"> {sub}</span>}</span>
    </li>
  );

  return (
    <div className="screen">
      <header className="row between">
        <div>
          <div className="muted small">{d.getMonth() + 1}月{d.getDate()}日 {WEEKDAY_JA[d.getDay()]}曜日</div>
          <h1>梨歩の今日</h1>
        </div>
        <button className="pill small" onClick={onRefresh}>{syncing ? '更新中…' : '更新'}</button>
      </header>
      <div className="muted tiny">{lastSync ? `最終更新 ${lastSync}` : 'まだ同期していません'}</div>

      <div className="card col gap-s">
        <div className="row between">
          <b>今日のスタンプ</b>
          <span className="accent bold">+{pts.total}pt</span>
        </div>
        <ul className="col gap-s status">
          <Row ok={!!day.wakeAt} label="早起き" sub={day.wakeAt ? new Date(day.wakeAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) + ' に押した' : ''} />
          {sch.stretch && <Row ok={!!day.stretchDoneAt} label="ストレッチ" sub={day.stretchSec ? fmtSec(day.stretchSec) : ''} />}
          {sch.training && <Row ok={grade > 0} label={`トレーニング ${grade > 0 ? GRADE_NAME[grade] : ''}`} sub={grade > 0 ? `${completedRounds(day)}周` : cur ? `${doneCount}/${TRAINING.length} 種目 やってる途中` : 'まだ'} />}
          {sch.hit && <Row ok={!!day.hitDoneAt} label="HIT" />}
          {sch.practice && <Row ok={!!day.practiceAt} label="チーム練習" />}
          {STUDY_SUBJECTS.map(subject => <Row key={subject.key} ok={!!day.study?.[subject.key]} label={subject.label} sub={day.study?.[subject.key] ? '+1pt' : 'まだ'} />)}
        </ul>
        {day.mood && <div className="muted small">調子: {MOOD_JA[day.mood]}</div>}
      </div>

      <div className="stats">
        <div className="stat"><span className="muted tiny">れんぞく</span><b>{streak(state)}日</b></div>
        <div className="stat"><span className="muted tiny">今週</span><b>{weekPoints(state)}pt</b></div>
        <div className="stat"><span className="muted tiny">未換金</span><b className="accent">{unredeemed}pt</b></div>
      </div>

      <div className="card col gap-s">
        <b>おこづかい</b>
        <div className="muted small">未換金 {unredeemed}pt = {pointsToYen(unredeemed)}円({POINTS_PER_YEN.points}pt = {POINTS_PER_YEN.yen}円)</div>
        <button className="btn outline" disabled={!canCash} onClick={() => update(s => {
          s.cashouts.push({ at: new Date().toISOString(), points: POINTS_PER_YEN.points, yen: POINTS_PER_YEN.yen }); return s;
        })}>{POINTS_PER_YEN.yen}円 渡した(−{POINTS_PER_YEN.points}pt)</button>
        {state.cashouts.length > 0 && (
          <ul className="ledger">{[...state.cashouts].reverse().slice(0, 5).map((c, i) => <li key={i}><span>{c.at.slice(0, 10).replace(/-/g, '/')}</span><b>{c.yen}円</b></li>)}</ul>
        )}
      </div>

      <div className="card col gap-s">
        <b>リンクを共有</b>
        <div className="muted small">梨歩さんのiPhoneには「本人用」、chieさんのほかの端末には「おうちの人用」を送ってね。リンクは秘密に。</div>
        <button className="btn secondary" onClick={() => copy('child')}>{copied === 'child' ? 'コピーした!' : '本人用リンク'}</button>
        <button className="btn secondary" onClick={() => copy('parent')}>{copied === 'parent' ? 'コピーした!' : 'おうちの人用リンク'}</button>
      </div>
    </div>
  );
}
