import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconBook, IconCalendar, IconCoin, IconHome } from './components/Icons';
import { SUPABASE_URL } from './config';
import { go, useRoute } from './lib/router';
import { type AppState, useAppState } from './lib/state';
import { allKeys, configured, getToken, isParentMode, newToken, pullAndMerge, pushKeys, setParentMode, setToken } from './lib/sync';
import Calendar from './screens/Calendar';
import ExerciseScreen from './screens/Exercise';
import Home from './screens/Home';
import Parent from './screens/Parent';
import Passbook from './screens/Passbook';
import RoundDone from './screens/RoundDone';
import Session from './screens/Session';
import Settings from './screens/Settings';
import { Zukan, ZukanItem } from './screens/Zukan';

// 初回: 同期が使える環境なら家族トークンを作っておく
if (SUPABASE_URL && !getToken()) setToken(newToken());

export default function App() {
  const route = useRoute();
  const pending = useRef<Set<string>>(new Set());
  const pushTimer = useRef<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>();
  const stateRef = useRef<AppState | null>(null);

  // 変更があったら少し待ってまとめて送る
  const onChange = useCallback((s: AppState, keys: string[]) => {
    stateRef.current = s;
    keys.forEach(k => pending.current.add(k));
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      const keysNow = [...pending.current]; pending.current.clear();
      if (stateRef.current && configured()) await pushKeys(stateRef.current, keysNow);
    }, 1500);
  }, []);

  const [state, update, setState] = useAppState(onChange);
  stateRef.current = state;
  const parent = isParentMode();

  // 受信
  const pull = useCallback(async () => {
    if (!configured()) return;
    setSyncing(true);
    const res = await pullAndMerge(stateRef.current!);
    if (res?.changed) setState(res.state);
    // サーバーに無いローカル分も送る
    if (res && stateRef.current) {
      const merged = res.changed ? res.state : stateRef.current;
      const missing = allKeys(merged).filter(k => !res.state.updated?.[k] || false);
      if (missing.length) await pushKeys(merged, missing);
    }
    setSyncing(false);
    setLastSync(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
  }, [setState]);

  useEffect(() => {
    pull();
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVis);
    const t = window.setInterval(pull, parent ? 30000 : 120000);
    return () => { document.removeEventListener('visibilitychange', onVis); clearInterval(t); };
  }, [pull, parent]);

  // 共有リンクを開いたとき: トークンとモードを保存してホームへ
  useEffect(() => {
    if (route.name === 'link') {
      setToken(route.token);
      setParentMode(route.mode === 'parent');
      // 送信待ちを捨てて、新しい家族のデータを取りに行く
      pending.current.clear();
      go(route.mode === 'parent' ? 'parent' : '');
      setTimeout(pull, 100);
    }
  }, [route, pull]);

  const fullscreen = route.name === 'exercise' || route.name === 'round-done' || route.name === 'session' || route.name === 'zukan-item';

  let body;
  switch (route.name) {
    case 'link': body = <div className="screen center"><p>読みこみ中…</p></div>; break;
    case 'exercise': body = <ExerciseScreen state={state} update={update} />; break;
    case 'round-done': body = <RoundDone state={state} update={update} />; break;
    case 'session': body = <Session kind={route.kind} state={state} update={update} />; break;
    case 'calendar': body = <Calendar state={state} />; break;
    case 'zukan': body = <Zukan />; break;
    case 'zukan-item': body = <ZukanItem id={route.id} />; break;
    case 'passbook': body = <Passbook state={state} />; break;
    case 'settings': body = <Settings state={state} update={update} />; break;
    case 'parent-home': body = <Parent state={state} update={update} syncing={syncing} lastSync={lastSync} onRefresh={pull} />; break;
    default: body = parent
      ? <Parent state={state} update={update} syncing={syncing} lastSync={lastSync} onRefresh={pull} />
      : <Home state={state} update={update} />;
  }

  const tab = (name: string, label: string, icon: ReactNode, active: boolean) => (
    <button className={`tab ${active ? 'on' : ''}`} onClick={() => go(name)}>{icon}<span>{label}</span></button>
  );

  return (
    <div className="app">
      <main className={fullscreen ? 'full' : ''}>{body}</main>
      {!fullscreen && (
        <nav className="tabs">
          {tab(parent ? 'parent' : '', parent ? '今日' : 'ホーム', <IconHome />, route.name === 'home' || route.name === 'parent-home')}
          {tab('calendar', 'カレンダー', <IconCalendar />, route.name === 'calendar')}
          {tab('zukan', 'ずかん', <IconBook />, route.name === 'zukan')}
          {tab('passbook', 'つうちょう', <IconCoin />, route.name === 'passbook')}
        </nav>
      )}
    </div>
  );
}
