import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'exercise' }
  | { name: 'round-done' }
  | { name: 'session'; kind: 'stretch' | 'hit' }
  | { name: 'calendar' }
  | { name: 'zukan' }
  | { name: 'passbook' }
  | { name: 'settings' }
  | { name: 'zukan-item'; id: string };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  switch (parts[0]) {
    case 'exercise': return { name: 'exercise' };
    case 'round-done': return { name: 'round-done' };
    case 'session': return { name: 'session', kind: parts[1] === 'hit' ? 'hit' : 'stretch' };
    case 'calendar': return { name: 'calendar' };
    case 'zukan': return parts[1] ? { name: 'zukan-item', id: parts[1] } : { name: 'zukan' };
    case 'passbook': return { name: 'passbook' };
    case 'settings': return { name: 'settings' };
    default: return { name: 'home' };
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function go(path: string) {
  location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
  window.scrollTo(0, 0);
}
