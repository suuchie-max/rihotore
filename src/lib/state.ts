import { useEffect, useState } from 'react';
import { MAX_ROUNDS, POINTS_PER_YEN, SCHEDULE, TRAINING } from '../data/exercises';

export const STUDY_SUBJECTS = [{ key: 'japanese', label: '公文の国語' }, { key: 'math', label: '公文の数学' }, { key: 'english', label: '公文の英語' }] as const;
export type StudySubject = typeof STUDY_SUBJECTS[number]['key'];

export type Mood = 'hard' | 'ok' | 'easy';

export interface ExerciseDone {
  sec: number;         // かかった秒数
  extraReps: number;   // 上乗せ回数
}

export interface RoundRecord {
  startedAt: string;
  doneAt?: string;
  done: Record<string, ExerciseDone>;   // exerciseId -> 記録
}

export interface DayRecord {
  date: string;                  // YYYY-MM-DD
  study?: Partial<Record<StudySubject, string>>;
  wakeAt?: string;
  stretchDoneAt?: string;
  stretchSec?: number;
  rounds: RoundRecord[];
  hitDoneAt?: string;
  practiceAt?: string;
  mood?: Mood;
  memo?: string;
}

export interface Cashout { at: string; points: number; yen: number }

export interface AppState {
  version: 1;
  character?: string;
  days: Record<string, DayRecord>;
  cashouts: Cashout[];
  settings: { notifyTime?: string };
  updated?: Record<string, string>;   // 同期用: key('meta' | 'day:YYYY-MM-DD') -> 最終更新時刻
}

const KEY = 'riho-tore-v1';

function emptyState(): AppState {
  return { version: 1, days: {}, cashouts: [], settings: {} };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return emptyState();
}

export function saveState(s: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ---- 日付 ----
export function todayKey(d = new Date()): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(key: string, n: number): string {
  const d = keyToDate(key); d.setDate(d.getDate() + n); return todayKey(d);
}
export const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

export function getDay(s: AppState, key: string): DayRecord {
  return s.days[key] ?? { date: key, rounds: [] };
}

// ---- スタンプ・ポイント ----
export type Grade = 0 | 1 | 2 | 3; // 0=なし 1=ブロンズ 2=シルバー 3=ゴールド
export const GRADE_NAME: Record<Grade, string> = { 0: '', 1: 'ブロンズ', 2: 'シルバー', 3: 'ゴールド' };

export function completedRounds(day: DayRecord): number {
  return day.rounds.filter(r => r.doneAt).length;
}
export function trainingGrade(day: DayRecord): Grade {
  return Math.min(MAX_ROUNDS, completedRounds(day)) as Grade;
}

export interface DayPoints { wake: number; stretch: number; training: number; hit: number; practice: number; japanese: number; math: number; english: number; total: number }

export function dayPoints(day: DayRecord): DayPoints {
  const p: DayPoints = {
    wake: day.wakeAt ? 1 : 0,
    stretch: day.stretchDoneAt ? 1 : 0,
    training: trainingGrade(day),
    hit: day.hitDoneAt ? 1 : 0,
    practice: day.practiceAt ? 1 : 0,
    japanese: day.study?.japanese ? 1 : 0,
    math: day.study?.math ? 1 : 0,
    english: day.study?.english ? 1 : 0,
    total: 0,
  };
  p.total = p.wake + p.stretch + p.training + p.hit + p.practice + p.japanese + p.math + p.english;
  return p;
}

export function hasAnyStamp(day: DayRecord): boolean {
  return dayPoints(day).total > 0;
}

export function totalPoints(s: AppState): number {
  return Object.values(s.days).reduce((sum, d) => sum + dayPoints(d).total, 0);
}
export function cashedPoints(s: AppState): number {
  return s.cashouts.reduce((sum, c) => sum + c.points, 0);
}
export function unredeemedPoints(s: AppState): number {
  return totalPoints(s) - cashedPoints(s);
}
export function pointsToYen(points: number): number {
  return Math.floor(points / POINTS_PER_YEN.points) * POINTS_PER_YEN.yen;
}

export function weekPoints(s: AppState, key = todayKey()): number {
  // 月曜はじまりの週
  const d = keyToDate(key);
  const dow = (d.getDay() + 6) % 7; // 月=0
  let sum = 0;
  for (let i = 0; i <= dow; i++) sum += dayPoints(getDay(s, addDays(key, -dow + i))).total;
  return sum;
}

export function streak(s: AppState, key = todayKey()): number {
  let n = 0;
  let k = key;
  if (!hasAnyStamp(getDay(s, k))) k = addDays(k, -1); // 今日まだなら昨日から数える
  while (hasAnyStamp(getDay(s, k))) { n++; k = addDays(k, -1); }
  return n;
}

// ---- キャラ進化 ----
export const EVOLUTION = [
  { at: 0, name: 'たまご' },
  { at: 10, name: 'ひな' },
  { at: 30, name: 'こども' },
  { at: 60, name: 'おとな' },
  { at: 120, name: 'ユニホーム' },
  { at: 200, name: 'エース' },
];
export function evolution(total: number) {
  let stage = 0;
  for (let i = 0; i < EVOLUTION.length; i++) if (total >= EVOLUTION[i].at) stage = i;
  const next = EVOLUTION[stage + 1];
  return { stage, name: EVOLUTION[stage].name, next: next ? next.at - total : 0, nextName: next?.name };
}

// ---- 今日のメニュー ----
export function scheduleFor(key: string) {
  return SCHEDULE[keyToDate(key).getDay()];
}

export function activeRound(day: DayRecord): RoundRecord | undefined {
  return day.rounds.find(r => !r.doneAt);
}
export function nextExerciseIndex(round: RoundRecord): number {
  return TRAINING.findIndex(e => !round.done[e.id]);
}

// ---- 変更されたキーを見つけて更新時刻を打つ(同期用) ----
export function stampChanges(prev: AppState, next: AppState): string[] {
  const changed: string[] = [];
  const now = new Date().toISOString();
  next.updated = { ...(next.updated ?? {}) };
  const metaPrev = JSON.stringify([prev.cashouts, prev.settings, prev.character]);
  const metaNext = JSON.stringify([next.cashouts, next.settings, next.character]);
  if (metaPrev !== metaNext) { next.updated['meta'] = now; changed.push('meta'); }
  const keys = new Set([...Object.keys(prev.days), ...Object.keys(next.days)]);
  for (const k of keys) {
    if (JSON.stringify(prev.days[k]) !== JSON.stringify(next.days[k])) { next.updated[`day:${k}`] = now; changed.push(`day:${k}`); }
  }
  return changed;
}

// ---- React hook ----
export function useAppState(onChange?: (state: AppState, keys: string[]) => void): [AppState, (fn: (s: AppState) => AppState) => void, (s: AppState) => void] {
  const [state, setState] = useState<AppState>(loadState);
  useEffect(() => { saveState(state); }, [state]);
  const update = (fn: (s: AppState) => AppState) => setState(prev => {
    const next = fn(structuredClone(prev));
    const keys = stampChanges(prev, next);
    if (keys.length && onChange) onChange(next, keys);
    return next;
  });
  return [state, update, setState];
}

export function fmtSec(sec: number): string {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtMin(sec: number): string {
  return `約${Math.max(1, Math.round(sec / 60))}分`;
}
