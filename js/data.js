// Import/eksport: programmer fra Claude, eksport til Claude, og backup.
import { S, store, ex, hasEx, rebuildEx, fmtSet, sessionVolume, loadAll } from './store.js';
import { db, STORES } from './db.js';
import { slug, GROUPS, EQUIP, EXERCISES } from './exercises.js';
import { uid, isoDate, fromIso, fmtDur, DAYS, blobToDataURL, dataURLToBlob } from './util.js';
const fromIsoSafe = (d) => { try { return fromIso(d); } catch { return 0; } };

const DAY_KEYS = [['mon', 'man', 'monday', 'mandag'], ['tue', 'tir', 'tuesday', 'tirsdag'], ['wed', 'ons', 'wednesday', 'onsdag'],
  ['thu', 'tor', 'thursday', 'torsdag'], ['fri', 'fre', 'friday', 'fredag'], ['sat', 'lør', 'lor', 'saturday', 'lørdag'], ['sun', 'søn', 'son', 'sunday', 'søndag']];
const dayIndex = (k) => DAY_KEYS.findIndex((a) => a.includes(String(k).toLowerCase()));

async function resolveExercise(e) {
  const id = e.id || e.exercise;
  if (id && hasEx(id)) return id;
  const name = e.name || id;
  if (!name) throw new Error('Øvelse mangler id/navn');
  const byName = [...S.custom, ...EXERCISES].find((x) => x.name.toLowerCase() === String(name).toLowerCase());
  if (byName) return byName.id;
  if (hasEx(slug(name))) return slug(name);
  const cid = 'custom-' + slug(name);
  if (!hasEx(cid)) {
    await store.putCustom({
      id: cid, name, group: GROUPS[e.group] ? e.group : 'annet',
      eq: EQUIP[e.equipment] ? e.equipment : 'ot', type: ['w', 'b', 't', 'c'].includes(e.type) ? e.type : 'w',
    });
  }
  return cid;
}

export function validateProgram(p) {
  if (typeof p === 'string') p = JSON.parse(p);
  if (!p || typeof p !== 'object') throw new Error('Ugyldig JSON');
  if (!Array.isArray(p.workouts) || !p.workouts.length) throw new Error('Programmet mangler "workouts"');
  return p;
}

export async function importProgram(input, { replacePlan = true, removeOld = true } = {}) {
  const p = validateProgram(input);
  const progId = uid();
  const keyMap = {};
  const oldProg = S.plan.programId;
  const now = Date.now();
  for (const [i, w] of p.workouts.entries()) {
    const t = { id: uid(), name: w.name || `Økt ${i + 1}`, notes: w.notes || '', program: p.name || '', programId: progId, createdAt: now + i, exercises: [] };
    for (const e of w.exercises || []) {
      t.exercises.push({
        exId: await resolveExercise(e),
        sets: Math.max(1, parseInt(e.sets, 10) || 3),
        reps: e.reps != null ? String(e.reps) : '',
        rest: parseInt(e.rest, 10) || S.settings.restDefault,
        rpe: e.rpe != null ? String(e.rpe) : '',
        notes: e.notes || '',
      });
    }
    await store.putTemplate(t);
    keyMap[w.key || w.name || `w${i}`] = t.id;
  }
  if (replacePlan) {
    if (removeOld && oldProg) {
      for (const t of S.templates.filter((x) => x.programId === oldProg)) await store.delTemplate(t.id);
    }
    const days = [[], [], [], [], [], [], []];
    for (const [k, v] of Object.entries(p.schedule || {})) {
      const di = dayIndex(k); if (di < 0) continue;
      for (const key of [].concat(v)) if (keyMap[key]) days[di].push(keyMap[key]);
    }
    S.plan = { days, name: p.name || 'Program', notes: p.notes || '', programId: progId, importedAt: now, weeks: p.weeks || null, description: p.description || '' };
    await store.savePlan();
  }
  return { workouts: p.workouts.length, name: p.name };
}

// ---- Eksport til Claude (lesbar tekst) ----
export function exportForClaude(days = 28) {
  const since = Date.now() - days * 864e5;
  const L = [];
  L.push(`ISTREFI WORKOUT – TRENINGSLOGG (eksportert ${isoDate()})`);
  L.push(`Periode: siste ${days} dager`);
  if (S.settings.name) L.push(`Navn: ${S.settings.name}`);
  L.push('');
  L.push('## Gjeldende ukesplan' + (S.plan.name ? ` – ${S.plan.name}` : ''));
  S.plan.days.forEach((ids, i) => {
    const names = ids.map((id) => S.templates.find((t) => t.id === id)?.name).filter(Boolean);
    L.push(`${DAYS[i]}: ${names.length ? names.join(', ') : 'Hvile'}`);
  });
  const body = S.body.filter((b) => b.date >= since);
  if (body.length) {
    L.push('', '## Kroppsmål');
    for (const b of body) L.push(`${isoDate(b.date)}: ${b.weight != null ? b.weight + ' kg' : ''}${b.waist != null ? ` · midje ${b.waist} cm` : ''}${b.note ? ` · ${b.note}` : ''}`);
  }
  const dailyDays = Object.keys(S.daily).filter((d) => fromIsoSafe(d) >= since).sort();
  if (dailyDays.length) {
    const t = S.settings.targets || {};
    L.push('', `## Daglig (mål: ${t.kcal ? 'maks ' + t.kcal + ' kcal' : '–'}, ${t.protein ? t.protein + ' g protein' : '–'}, ${t.carbs ? 'maks ' + t.carbs + ' g karbo' : '–'}, ${t.fat ? 'maks ' + t.fat + ' g fett' : '–'}, ${t.steps ? t.steps + ' skritt' : '–'})`);
    for (const d of dailyDays) {
      const x = S.daily[d];
      const parts = [x.kcal != null ? `${x.kcal} kcal` : '', x.protein != null ? `${x.protein} g protein` : '', x.carbs != null ? `${x.carbs} g karbo` : '', x.fat != null ? `${x.fat} g fett` : '', x.steps != null ? `${x.steps} skritt` : ''].filter(Boolean);
      if (parts.length) L.push(`${d}: ${parts.join(' · ')}`);
    }
  }
  const sessions = S.sessions.filter((s) => s.startedAt >= since).slice().reverse();
  L.push('', `## Økter (${sessions.length})`);
  for (const s of sessions) {
    const dur = s.finishedAt ? fmtDur(s.finishedAt - s.startedAt) : '';
    L.push('', `### ${isoDate(s.startedAt)} – ${s.name}${dur ? ` (${dur})` : ''} · volum ${Math.round(sessionVolume(s))} kg`);
    if (s.notes) L.push(`Notat: ${s.notes}`);
    for (const e of s.exercises) {
      const x = ex(e.exId);
      const sets = e.sets.filter((st) => st.done).map((st) => fmtSet(st, x.type) + (st.rpe != null ? ` @${String(st.rpe).replace('.', ',')}` : '') + (st.warmup ? ' (oppv.)' : ''));
      if (!sets.length) continue;
      L.push(`- ${x.name} [${x.id}]: ${sets.join(', ')}${e.notes ? ` – ${e.notes}` : ''}`);
    }
  }
  L.push('', '(Svar gjerne med et nytt program i JSON-format "istrefi-program/1" som jeg kan lime inn i appen.)');
  return L.join('\n');
}

// ---- Backup ----
export async function makeBackup({ photos = true } = {}) {
  const out = {
    format: 'istrefi-backup/1', exportedAt: new Date().toISOString(),
    templates: S.templates, sessions: S.sessions, body: S.body, customExercises: S.custom,
    plan: S.plan, settings: S.settings, daily: S.daily, photos: [],
  };
  if (photos) {
    for (const p of S.photos) {
      out.photos.push({ ...p, full: await blobToDataURL(p.full), thumb: p.thumb ? await blobToDataURL(p.thumb) : null });
    }
  }
  return new Blob([JSON.stringify(out)], { type: 'application/json' });
}

export async function restoreBackup(text) {
  const b = JSON.parse(text);
  if (b.format !== 'istrefi-backup/1') throw new Error('Dette er ikke en Istrefi-backup');
  for (const s of STORES) await db.clear(s);
  for (const t of b.templates || []) await db.put('templates', t);
  for (const s of b.sessions || []) await db.put('sessions', s);
  for (const x of b.body || []) await db.put('body', x);
  for (const c of b.customExercises || []) await db.put('customExercises', c);
  for (const p of b.photos || []) {
    await db.put('photos', { ...p, full: await dataURLToBlob(p.full), thumb: p.thumb ? await dataURLToBlob(p.thumb) : null });
  }
  if (b.plan) await db.put('kv', b.plan, 'plan');
  if (b.settings) await db.put('kv', b.settings, 'settings');
  if (b.daily) await db.put('kv', b.daily, 'daily');
  await loadAll(); rebuildEx();
}

export async function wipeAll() {
  for (const s of STORES) await db.clear(s);
  await db.clear('kv');
}
