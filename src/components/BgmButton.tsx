import { useEffect, useState } from 'react';
import { isBgmPlaying, startBgm, stopBgm } from '../lib/bgm';

const KEY = 'riho-tore-bgm';
export function bgmPreferred(): boolean { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } }

// トレーニング画面の右上に置く BGM ON/OFF ボタン
export default function BgmButton() {
  const [on, setOn] = useState(isBgmPlaying());
  useEffect(() => { setOn(isBgmPlaying()); }, []);
  const toggle = () => {
    if (isBgmPlaying()) { stopBgm(); setOn(false); try { localStorage.setItem(KEY, 'off'); } catch { /* ignore */ } }
    else { startBgm(); setOn(true); try { localStorage.setItem(KEY, 'on'); } catch { /* ignore */ } }
  };
  return (
    <button className={`round-btn bgm ${on ? 'on' : ''}`} onClick={toggle} aria-label="BGM">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
        {!on && <path d="M3 3l18 18" />}
      </svg>
    </button>
  );
}
