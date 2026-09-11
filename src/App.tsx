import type { ReactNode } from 'react';
import { IconBook, IconCalendar, IconCoin, IconHome } from './components/Icons';
import { go, useRoute } from './lib/router';
import { useAppState } from './lib/state';
import Calendar from './screens/Calendar';
import ExerciseScreen from './screens/Exercise';
import Home from './screens/Home';
import Passbook from './screens/Passbook';
import RoundDone from './screens/RoundDone';
import Session from './screens/Session';
import Settings from './screens/Settings';
import { Zukan, ZukanItem } from './screens/Zukan';

export default function App() {
  const route = useRoute();
  const [state, update] = useAppState();

  const fullscreen = route.name === 'exercise' || route.name === 'round-done' || route.name === 'session' || route.name === 'zukan-item';

  let body;
  switch (route.name) {
    case 'exercise': body = <ExerciseScreen state={state} update={update} />; break;
    case 'round-done': body = <RoundDone state={state} update={update} />; break;
    case 'session': body = <Session kind={route.kind} state={state} update={update} />; break;
    case 'calendar': body = <Calendar state={state} />; break;
    case 'zukan': body = <Zukan />; break;
    case 'zukan-item': body = <ZukanItem id={route.id} />; break;
    case 'passbook': body = <Passbook state={state} />; break;
    case 'settings': body = <Settings state={state} update={update} />; break;
    default: body = <Home state={state} update={update} />;
  }

  const tab = (name: string, label: string, icon: ReactNode, active: boolean) => (
    <button className={`tab ${active ? 'on' : ''}`} onClick={() => go(name)}>{icon}<span>{label}</span></button>
  );

  return (
    <div className="app">
      <main className={fullscreen ? 'full' : ''}>{body}</main>
      {!fullscreen && (
        <nav className="tabs">
          {tab('', 'ホーム', <IconHome />, route.name === 'home')}
          {tab('calendar', 'カレンダー', <IconCalendar />, route.name === 'calendar')}
          {tab('zukan', 'ずかん', <IconBook />, route.name === 'zukan')}
          {tab('passbook', 'つうちょう', <IconCoin />, route.name === 'passbook')}
        </nav>
      )}
    </div>
  );
}
