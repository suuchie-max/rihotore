// Supabase との同期。家族ごとの合言葉トークン(URLに含まれる推測不能な文字列)で行を分ける。
// テーブル app_data(family_id, key, data, updated_at)。key は 'day:YYYY-MM-DD' か 'meta'。
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config';
import type { AppState, DayRecord } from './state';

const TOKEN_KEY = 'riho-tore-token';
const MODE_KEY = 'riho-tore-mode';

export function getToken(): string | null { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
export function setToken(t: string) { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } }
export function isParentMode(): boolean { try { return localStorage.getItem(MODE_KEY) === 'parent'; } catch { return false; } }
export function setParentMode(on: boolean) { try { localStorage.setItem(MODE_KEY, on ? 'parent' : 'child'); } catch { /* ignore */ } }

export function newToken(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(20);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

export function configured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !!getToken();
}

let client: SupabaseClient | null = null;
let clientToken: string | null = null;
function sb(): SupabaseClient | null {
  const token = getToken();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !token) return null;
  if (!client || clientToken !== token) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { 'x-family-token': token } } });
    clientToken = token;
  }
  return client;
}

interface Row { key: string; data: unknown; updated_at: string }

export interface Meta { cashouts: AppState['cashouts']; settings: AppState['settings']; character?: string }

// ---- 送信 ----
export async function pushKeys(state: AppState, keys: string[]): Promise<boolean> {
  const c = sb(); const token = getToken();
  if (!c || !token || keys.length === 0) return false;
  const rows = keys.map(key => {
    const data = key === 'meta'
      ? ({ cashouts: state.cashouts, settings: state.settings, character: state.character } as Meta)
      : state.days[key.slice(4)];
    return { family_id: token, key, data, updated_at: state.updated?.[key] ?? new Date().toISOString() };
  }).filter(r => r.data !== undefined);
  const { error } = await c.from('app_data').upsert(rows, { onConflict: 'family_id,key' });
  if (error) { console.warn('sync push failed', error.message); return false; }
  return true;
}

// ---- 受信してマージ(新しい方が勝つ) ----
export async function pullAndMerge(state: AppState): Promise<{ state: AppState; changed: boolean } | null> {
  const c = sb();
  if (!c) return null;
  const { data, error } = await c.from('app_data').select('key,data,updated_at');
  if (error) { console.warn('sync pull failed', error.message); return null; }
  const next: AppState = structuredClone(state);
  next.updated = next.updated ?? {};
  let changed = false;
  for (const row of (data ?? []) as Row[]) {
    const localAt = next.updated[row.key];
    if (localAt && localAt >= row.updated_at) continue; // ローカルの方が新しい
    if (row.key === 'meta') {
      const m = row.data as Meta;
      next.cashouts = m.cashouts ?? []; next.settings = m.settings ?? {}; next.character = m.character;
    } else if (row.key.startsWith('day:')) {
      next.days[row.key.slice(4)] = row.data as DayRecord;
    }
    next.updated[row.key] = row.updated_at;
    changed = true;
  }
  return { state: next, changed };
}

// ローカルにあってサーバーに無いものを含め、全部送る(初回など)
export function allKeys(state: AppState): string[] {
  return ['meta', ...Object.keys(state.days).map(d => `day:${d}`)];
}

export function shareUrl(mode: 'child' | 'parent'): string {
  const token = getToken() ?? '';
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/${mode === 'parent' ? 'p' : 'u'}/${token}`;
}
