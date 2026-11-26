import { db } from './db.js';
import { EXERCISES } from './exercises.js';

export const S = {
  templates: [], sessions: [], body: [], custom: [], photos: [],
  plan: { days: [[], [], [], [], [], [], []], name: '', notes: '', programId: null },
  settings: { name: '', restDefault: 90, sound: true, targets: { kcal: null, protein: null, carbs: null, fat: null, steps: 8000 } },
  daily: {},
  active: null,
};

let exMap = new Map();
export function rebuildEx() {
  exMap = new Map();
  for (const e of EXERCISES) exMap.set(e.id, e);
  for (const e of S.custom) exMap.set(e.id, { ...e, custom: true });
}
export const ex = (id) => exMap.get(id) || { id, name: id, group: 'annet', eq: 'ot', type: 'w', missing: true };
export const hasEx = (id) => exMap.has(id);
export const allEx = () => [...exMap.values()];

const sortSessions = () => S.sessions.sort((a, b) => b.startedAt - a.startedAt);
const sortBody = () => S.body.sort((a, b) => a.date - b.date);
const sortPhotos = () => S.photos.sort((a, b) => a.date - b.date);

export async function loadAll() {
  [S.templates, S.sessions, S.body, S.custom, S.photos] = await Promise.all(
    ['templates', 'sessions', 'body', 'customExercises', 'photos'].map((s) => db.all(s)));
  const plan = await db.get('kv', 'plan'); if (plan) S.plan = plan;
  S.settings = { ...S.settings, ...((await db.get('kv', 'settings')) || {}) };
  S.active = (await db.get('kv', 'active')) || null;
  S.daily = (await db.get('kv', 'daily')) || {};
  S.templates.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  sortSessions(); sortBody(); sortPhotos(); rebuildEx();
}

function up(arr, o) { const i = arr.findIndex((x) => x.id === o.id); if (i >= 0) arr[i] = o; else arr.push(o); }
function rm(key, id) { S[key] = S[key].filter((x) => x.id !== id); }

export const store = {
  putTemplate: (t) => { up(S.templates, t); return db.put('templates', t); },
  delTemplate: (id) => {
    rm('templates', id);
    S.plan.days = S.plan.days.map((d) => d.filter((x) => x !== id));
    return Promise.all([db.del('templates', id), store.savePlan()]);
  },
  putSession: (s) => { up(S.sessions, s); sortSessions(); return db.put('sessions', s); },
  delSession: (id) => { rm('sessions', id); return db.del('sessions', id); },
  putBody: (b) => { up(S.body, b); sortBody(); return db.put('body', b); },
  delBody: (id) => { rm('body', id); return db.del('body', id); },
  putCustom: (e) => { up(S.custom, e); rebuildEx(); return db.put('customExercises', e); },
  delCustom: (id) => { rm('custom', id); rebuildEx(); return db.del('customExercises', id); },
  putPhoto: (p) => { up(S.photos, p); sortPhotos(); return db.put('photos', p); },
  delPhoto: (id) => { rm('photos', id); return db.del('photos', id); },
  savePlan: () => db.put('kv', S.plan, 'plan'),
  saveSettings: () => db.put('kv', S.settings, 'settings'),
  saveDaily: () => db.put('kv', S.daily, 'daily'),
  saveActive: () => (S.active ? db.put('kv', S.active, 'active') : db.del('kv', 'active')),
  getKV: (k) => db.get('kv', k),
  setKV: (k, v) => db.put('kv', v, k),
};

// ---- Beregninger ----
export function setVolume(s, type) {
  if (!s.done) return 0;
  if (type === 'w' || type === 'b') return (s.kg || 0) * (s.reps || 0);
  return 0;
}
export const sessionVolume = (sess) => sess.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + setVolume(s, ex(e.exId).type), 0), 0);
export const sessionSets = (sess) => sess.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
export const e1rm = (kg, reps) => (kg && reps ? (reps === 1 ? kg : kg * (1 + Math.min(reps, 15) / 30)) : 0);

export function fmtSet(s, type) {
  if (!s) return '';
  const n = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
  if (type === 'w') return s.kg != null || s.reps != null ? `${n(s.kg ?? 0)}×${s.reps ?? 0}` : '';
  if (type === 'b') return s.reps != null ? (s.kg ? `+${n(s.kg)}×${s.reps}` : `${s.reps} reps`) : '';
  if (type === 't') return s.sec != null ? `${s.sec}s${s.kg ? ' +' + n(s.kg) + 'kg' : ''}` : '';
  if (type === 'c') return [s.min != null ? `${n(s.min)} min` : '', s.km != null ? `${n(s.km)} km` : ''].filter(Boolean).join(' · ');
  return '';
}

// Siste gjennomførte sett for en øvelse (fra loggen, ikke inkludert gjeldende økt)
export function lastPerformance(exId, excludeId) {
  for (const sess of S.sessions) {
    if (sess.id === excludeId) continue;
    const e = sess.exercises.find((x) => x.exId === exId && x.sets.some((s) => s.done));
    if (e) return { date: sess.startedAt, sets: e.sets.filter((s) => s.done) };
  }
  return null;
}

export function exerciseHistory(exId) {
  const out = [];
  for (const sess of S.sessions) {
    for (const e of sess.exercises) {
      if (e.exId !== exId) continue;
      const sets = e.sets.filter((s) => s.done);
      if (sets.length) out.push({ sessionId: sess.id, date: sess.startedAt, name: sess.name, sets });
    }
  }
  return out; // nyeste først
}
