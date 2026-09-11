import { HIT_MOVES, STRETCH_PARTS, TRAINING, VIDEOS } from '../data/exercises';
import YouTube from '../components/YouTube';
import { IconBack, IconChevron, IconSpeaker } from '../components/Icons';
import { go } from '../lib/router';
import { speak } from '../lib/media';
import { fmtSec } from '../lib/state';

export function Zukan() {
  return (
    <div className="screen">
      <h1>ずかん</h1>
      <div className="muted small">曜日に関係なく、ぜんぶの種目を見られるよ。ここで見てもスタンプにはならないよ。</div>

      <h3 className="section">ストレッチ <span className="muted small">毎日</span></h3>
      <button className="card menu-item" onClick={() => go('zukan/stretch')}>
        <span className="grow"><b>自宅ストレッチ</b><span className="muted small">{STRETCH_PARTS.length}か所 · {fmtSec(VIDEOS.stretch.seconds)}</span></span><IconChevron size={20} />
      </button>

      <h3 className="section">トレーニング <span className="muted small">月・木・金・日</span></h3>
      <div className="col gap-s">
        {TRAINING.map((e, i) => (
          <button key={e.id} className="card menu-item" onClick={() => go(`zukan/${e.id}`)}>
            <span className="num-box">{i + 1}</span>
            <span className="grow"><b>{e.name}</b><span className="muted small">{e.reps}{e.unit}{e.sets ? `×${e.sets}` : ''}{e.sides ? ' 右左' : ''}</span></span>
            <IconChevron size={20} />
          </button>
        ))}
      </div>

      <h3 className="section">HIT <span className="muted small">木・日(おまけ)</span></h3>
      <button className="card menu-item" onClick={() => go('zukan/hit')}>
        <span className="grow"><b>HIT トレーニング</b><span className="muted small">{HIT_MOVES.length}種目 · {fmtSec(VIDEOS.hit.seconds)}</span></span><IconChevron size={20} />
      </button>

      <h3 className="section">そのほか</h3>
      <button className="card menu-item" onClick={() => go('zukan/ladder')}>
        <span className="grow"><b>ラダートレーニング</b><span className="muted small">参考 · {fmtSec(VIDEOS.ladder.seconds)}</span></span><IconChevron size={20} />
      </button>
    </div>
  );
}

export function ZukanItem({ id }: { id: string }) {
  const ex = TRAINING.find(e => e.id === id);
  const videoKey = ex ? ex.video : (id === 'stretch' || id === 'hit' || id === 'ladder' ? id : 'training');
  const video = VIDEOS[videoKey];
  const parts = id === 'stretch' ? STRETCH_PARTS : id === 'hit' ? HIT_MOVES : [];
  const title = ex ? ex.name : video.title;

  return (
    <div className="screen exercise">
      <header className="ex-head">
        <button className="round-btn" onClick={() => go('zukan')} aria-label="もどる"><IconBack size={20} /></button>
        <div className="center-col"><b>{title}</b></div>
        <div style={{ width: 40 }} />
      </header>
      <div className="video-wrap">
        <YouTube videoId={video.id} start={ex?.start ?? 0} />
      </div>
      <div className="ex-body">
        {ex && (<>
          <div className="row between end">
            <h2>{ex.name}</h2>
            <div className="reps"><b>{ex.reps}</b><span>{ex.unit}{ex.sets ? `×${ex.sets}` : ''}{ex.sides ? ' 右左' : ''}</span></div>
          </div>
          <ol className="points">{ex.points.map((p, i) => <li key={i}><span className="num">{i + 1}</span><span>{p}</span></li>)}</ol>
          <div className="row"><button className="chip" onClick={() => speak(`${ex.kana ?? ex.name}。${ex.reps}${ex.unit}。${ex.points.join('。')}`)}><IconSpeaker size={14} /> よみあげ</button></div>
          {ex.items && <div className="muted small">じゅんび: {ex.items.join('・')}</div>}
          <div className="muted small">1セットのめやす {fmtSec(ex.estimateSec)} · 動画 {fmtSec(ex.start)} から</div>
        </>)}
        {parts.length > 0 && (
          <ul className="parts">{parts.map(p => <li key={p.name}><div className="part"><span className="muted tiny">{fmtSec(p.start)}</span><span>{p.name}</span></div></li>)}</ul>
        )}
        {id === 'ladder' && <div className="muted small">曜日の指定はないので参考用。チーム練習で使う動きだよ。</div>}
      </div>
    </div>
  );
}
