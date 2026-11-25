import { S, loadAll, store, ex, allEx, fmtSet, lastPerformance, exerciseHistory, sessionVolume, sessionSets, e1rm, setVolume } from './store.js';
import { GROUPS, EQUIP, TYPES, slug } from './exercises.js';
import { $, $$, uid, esc, DAYS, DAYS_SHORT, dayIdx, weekStart, fmtDate, fmtDay, fmtShort, fmtMonth, fmtTime, fmtDur, mmss, parseNum, fmtNum, isoDate, fromIso, toast, shareOrDownload, copyText } from './util.js';
import { lineChart } from './charts.js';
import { ANGLES, addPhotos, photoURL, forgetURL, photosByAngle, weightNear } from './photos.js';
import { SPRITE, bodyMini, bodyMap } from './muscles.js';
import { parseHealth, progression, dailyCard, dailyInputs, dailyClass, dailyWeekCard, streak, weekReport, reminderCard, platesHTML } from './extras.js';
import { importProgram, validateProgram, exportForClaude, makeBackup, restoreBackup, wipeAll } from './data.js';

const APP_VERSION = '1.4.5';
const ui = { lib: { q: '', g: '', eq: '' }, photoAngle: 'front', cmp: { angle: 'front', a: null, b: null, mode: 'slide', pos: 50 }, exportDays: 28 };

// ================= Router =================
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, query = ''] = h.split('?');
  const [r, arg] = path.split('/');
  return { r, arg: arg ? decodeURIComponent(arg) : null, q: new URLSearchParams(query) };
}
let lastRouteKey = '';
let backTarget = null;
function render() {
  const { r, arg, q } = parseRoute();
  const view = (VIEWS[r] || VIEWS.home)(arg, q);
  $('#title').textContent = view.title || '';
  backTarget = view.back || null;
  $('#back').hidden = !backTarget;
  $('#hright').innerHTML = view.right || '';
  $('#main').innerHTML = view.html;
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === (view.tab || r)));
  const key = location.hash.split('?')[0];
  if (key !== lastRouteKey) { window.scrollTo(0, 0); lastRouteKey = key; }
  renderBanner(r);
  view.after?.();
}
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
window.addEventListener('hashchange', render);

function renderBanner(r) {
  const b = $('#banner');
  if (S.active && r !== 'active') {
    b.innerHTML = `<a class="active-pill" href="#/active"><span class="pulse"></span>${esc(S.active.name)} · <span data-elapsed>${fmtDur(Date.now() - S.active.startedAt)}</span><b>Fortsett ›</b></a>`;
    b.hidden = false;
  } else { b.hidden = true; b.innerHTML = ''; }
}

// ================= Hjelpere =================
const tplById = (id) => S.templates.find((t) => t.id === id);
const icon = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" class="fill"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
};
const targetText = (t) => [t.sets ? `${t.sets} sett` : '', t.reps ? `${t.reps} reps` : '', t.rpe ? `RPE ${t.rpe}` : '', t.rest ? `${t.rest}s hvile` : ''].filter(Boolean).join(' · ');
const weekSessions = () => { const ws = weekStart().getTime(); return S.sessions.filter((s) => s.startedAt >= ws); };
function dayDone(i) {
  const ws = weekStart().getTime();
  return S.sessions.some((s) => s.startedAt >= ws + i * 864e5 && s.startedAt < ws + (i + 1) * 864e5);
}

// ================= HJEM =================
function vHome() {
  const t = dayIdx();
  const planned = S.plan.days[t].map(tplById).filter(Boolean);
  const ws = weekStart();
  const wk = weekSessions();
  const vol = wk.reduce((a, s) => a + sessionVolume(s), 0);
  const hr = new Date().getHours();
  const hi = hr < 10 ? 'God morgen' : hr < 18 ? 'Hei' : 'God kveld';
  const t0 = new Date().setHours(0, 0, 0, 0);
  const doneTpl = (id) => S.sessions.some((s) => s.templateId === id && s.startedAt >= t0);
  const strip = DAYS_SHORT.map((d, i) => {
    const date = new Date(ws.getTime() + i * 864e5).getDate();
    const has = S.plan.days[i].length > 0;
    return `<a href="#/plan" class="day ${i === t ? 'today' : ''} ${has ? 'planned' : ''} ${dayDone(i) ? 'done' : ''}"><span>${d}</span><b>${date}</b><i></i></a>`;
  }).join('');
  const lastW = S.body.filter((b) => b.weight != null).at(-1);
  const todayCards = planned.length
    ? planned.map((tp) => `<div class="card hero">
        <div class="eyebrow">${doneTpl(tp.id) ? 'Fullført i dag ✓' : 'Dagens økt'}</div>
        <h2>${esc(tp.name)}</h2>
        <p class="muted">${tp.exercises.length} øvelser · ${tp.exercises.reduce((a, e) => a + (e.sets || 0), 0)} sett</p>
        <div class="chips small">${tp.exercises.slice(0, 6).map((e) => `<span>${esc(ex(e.exId).name)}</span>`).join('')}${tp.exercises.length > 6 ? `<span>+${tp.exercises.length - 6}</span>` : ''}</div>
        <div class="row gap"><button class="btn primary grow" data-a="start" data-id="${tp.id}">${icon.play} Start økt</button><a class="btn" href="#/template/${tp.id}">Se</a></div>
      </div>`).join('')
    : `<div class="card hero rest"><div class="eyebrow">${DAYS[t]}</div><h2>${S.templates.length ? 'Hviledag 😌' : 'Velkommen!'}</h2>
        <p class="muted">${S.templates.length ? 'Ingen økt planlagt i dag. Gå en tur, eller start en økt likevel.' : 'Lag din første økt, eller importer et program fra Claude under Innstillinger.'}</p>
        <div class="row gap"><button class="btn primary grow" data-a="startPick">Start en økt</button></div></div>`;
  return {
    title: S.settings.name ? `${hi}, ${S.settings.name}` : hi, tab: 'home',
    right: `<a class="icon-btn" href="#/settings" aria-label="Innstillinger">${icon.gear}</a>`,
    html: `
      <div class="week-strip">${strip}</div>
      ${(() => { const st = streak(); return `<a class="streak" href="#/week/${t === 0 && !wk.length ? -1 : 0}"><span>${st ? `🔥 <b>${st}</b> ${st === 1 ? 'uke' : 'uker'} på rad` : '🔥 Fullfør uka for å starte streak'}</span><span class="muted">Ukerapport ›</span></a>`; })()}
      ${reminderCard()}
      ${todayCards}
      ${dailyCard()}
      <div class="stats">
        <div><b>${wk.length}</b><span>økter denne uka</span></div>
        <div><b>${wk.reduce((a, s) => a + sessionSets(s), 0)}</b><span>sett</span></div>
        <div><b>${vol >= 10000 ? fmtNum(Math.round(vol / 100) / 10) + ' t' : Math.round(vol) + ' kg'}</b><span>volum</span></div>
      </div>
      <div class="quick">
        <button class="btn" data-a="startEmpty">${icon.plus} Tom økt</button>
        <button class="btn" data-a="bodySheet">⚖️ Logg vekt${lastW ? ` <small class="muted">${fmtNum(lastW.weight)}</small>` : ''}</button>
        <a class="btn" href="#/progress">${icon.cam} Bilder</a>
      </div>
      ${S.plan.notes ? `<details class="card note"><summary><div class="eyebrow">Fra treneren${S.plan.name ? ' · ' + esc(S.plan.name) : ''}</div><span class="more">Trykk for å lese notatene ›</span></summary><p>${esc(S.plan.notes).replace(/\n/g, '<br>')}</p></details>` : ''}
      ${S.sessions.length ? `<h3 class="sec">Siste økter</h3>${S.sessions.slice(0, 3).map(sessionItem).join('')}` : ''}
    `,
  };
}

function sessionItem(s) {
  return `<a class="item" href="#/session/${s.id}">
    <div class="grow"><b>${esc(s.name)}</b><small class="muted">${fmtDay(s.startedAt)} · ${s.finishedAt ? fmtDur(s.finishedAt - s.startedAt) : ''} · ${sessionSets(s)} sett · ${Math.round(sessionVolume(s))} kg</small></div>${icon.chev}</a>`;
}

// ================= PLAN / ØKTER =================
function vPlan() {
  const t = dayIdx();
  const days = DAYS.map((d, i) => {
    const tps = S.plan.days[i].map(tplById).filter(Boolean);
    return `<div class="plan-day ${i === t ? 'today' : ''}">
      <div class="pd-name"><b>${DAYS_SHORT[i]}</b>${dayDone(i) ? '<span class="ok">✓</span>' : ''}</div>
      <div class="pd-items">${tps.length ? tps.map((tp) => `<span class="tag" data-a="dayItem" data-day="${i}" data-id="${tp.id}">${esc(tp.name)}</span>`).join('') : '<span class="muted small">Hvile</span>'}</div>
      <button class="icon-btn sm" data-a="dayAdd" data-day="${i}" aria-label="Legg til">${icon.plus}</button>
    </div>`;
  }).join('');
  const groups = {};
  for (const tp of S.templates) (groups[tp.program || 'Mine økter'] ||= []).push(tp);
  const lists = Object.entries(groups).map(([g, arr]) => `<h3 class="sec">${esc(g)}</h3>${arr.map((tp) => `
    <div class="item">
      <a class="grow" href="#/template/${tp.id}"><b>${esc(tp.name)}</b><small class="muted">${tp.exercises.length} øvelser · ${tp.exercises.map((e) => ex(e.exId).name).slice(0, 3).map(esc).join(', ')}${tp.exercises.length > 3 ? '…' : ''}</small></a>
      <button class="icon-btn accent" data-a="start" data-id="${tp.id}" aria-label="Start">${icon.play}</button>
    </div>`).join('')}`).join('');
  return {
    title: 'Økter', tab: 'plan',
    right: `<button class="icon-btn" data-a="newTemplate" aria-label="Ny økt">${icon.plus}</button>`,
    html: `
      <div class="card">
        <div class="row between"><div><div class="eyebrow">Ukesplan</div><h3 class="m0">${esc(S.plan.name || 'Min plan')}</h3></div></div>
        ${S.plan.description ? `<p class="muted small">${esc(S.plan.description)}</p>` : ''}
        <div class="plan">${days}</div>
        ${S.plan.notes ? `<details class="notes"><summary>Notater fra treneren</summary><p>${esc(S.plan.notes).replace(/\n/g, '<br>')}</p></details>` : ''}
      </div>
      ${lists || '<p class="muted center">Ingen økter ennå.</p>'}
      <button class="btn block mt" data-a="newTemplate">${icon.plus} Ny økt</button>
      <a class="btn block ghost mt" href="#/settings">Importer program fra Claude</a>`,
  };
}

function vTemplate(id) {
  const t = tplById(id);
  if (!t) return { title: 'Økt', back: '#/plan', html: '<p class="muted">Fant ikke økten.</p>' };
  const rows = t.exercises.map((e, i) => {
    const x = ex(e.exId);
    return `<div class="card tex" data-i="${i}">
      <div class="row between"><a class="grow row gap" href="#/exercise/${x.id}">${bodyMini(x)}<span class="grow"><b>${i + 1}. ${esc(x.name)}</b><small class="muted">${GROUPS[x.group] || ''} · ${EQUIP[x.eq] || ''}</small></span></a>
        <div class="row"><button class="icon-btn sm" data-a="tMove" data-i="${i}" data-d="-1">${icon.up}</button><button class="icon-btn sm" data-a="tMove" data-i="${i}" data-d="1">${icon.down}</button><button class="icon-btn sm danger" data-a="tRemove" data-i="${i}">${icon.x}</button></div></div>
      <div class="grid4">
        <label>Sett<input data-tf="sets" data-i="${i}" inputmode="numeric" value="${esc(e.sets)}"></label>
        <label>Reps<input data-tf="reps" data-i="${i}" value="${esc(e.reps)}" placeholder="8-12"></label>
        <label>RPE<input data-tf="rpe" data-i="${i}" value="${esc(e.rpe)}" placeholder="8"></label>
        <label>Hvile s<input data-tf="rest" data-i="${i}" inputmode="numeric" value="${esc(e.rest)}"></label>
      </div>
      <input class="note-in" data-tf="notes" data-i="${i}" value="${esc(e.notes)}" placeholder="Notat / teknikk-tips">
    </div>`;
  }).join('');
  return {
    title: 'Rediger økt', back: '#/plan', tab: 'plan',
    right: `<button class="icon-btn accent" data-a="start" data-id="${t.id}" aria-label="Start">${icon.play}</button>`,
    html: `
      <div class="card"><label class="lbl">Navn<input class="big-in" data-tf="name" value="${esc(t.name)}"></label>
      <label class="lbl">Notater<textarea data-tf="tnotes" rows="2" placeholder="F.eks. fokus, oppvarming…">${esc(t.notes)}</textarea></label></div>
      ${rows}
      <button class="btn block" data-a="tAdd">${icon.plus} Legg til øvelser</button>
      <button class="btn primary block mt" data-a="start" data-id="${t.id}">${icon.play} Start denne økta</button>
      <div class="row gap mt"><button class="btn grow" data-a="tDuplicate">Dupliser</button><button class="btn grow danger" data-a="tDelete">Slett økt</button></div>`,
  };
}

// ================= AKTIV ØKT / REDIGER LOGG =================
function setRow(e, i, j, s, prev, type) {
  const p = prev?.[j] || prev?.at?.(-1) || (j > 0 && e.sets[j - 1].done ? e.sets[j - 1] : null);
  const ph = (f) => (p && p[f] != null ? fmtNum(p[f]) : '');
  const val = (f) => (s[f] != null ? fmtNum(s[f]) : '');
  const inp = (f, mode = 'decimal', cls = '') => `<input class="${cls}" data-f="${f}" data-i="${i}" data-j="${j}" inputmode="${mode}" value="${val(f)}" placeholder="${ph(f)}">`;
  let fields;
  if (type === 'w') fields = inp('kg') + inp('reps', 'numeric') + inp('rpe', 'decimal', 'rpe');
  else if (type === 'b') fields = inp('kg') + inp('reps', 'numeric') + inp('rpe', 'decimal', 'rpe');
  else if (type === 't') fields = inp('sec', 'numeric') + inp('kg') + inp('rpe', 'decimal', 'rpe');
  else fields = inp('min') + inp('km') + inp('rpe', 'decimal', 'rpe');
  const prevTxt = p ? fmtSet(p, type) : '–';
  return `<div class="set-row ${s.done ? 'done' : ''} ${s.warmup ? 'warm' : ''}">
    <button class="setno" data-a="toggleWarm" data-i="${i}" data-j="${j}">${s.warmup ? 'O' : j + 1 - e.sets.slice(0, j).filter((x) => x.warmup).length}</button>
    <span class="prev">${esc(prevTxt)}</span>${fields}
    <button class="chk" data-a="check" data-i="${i}" data-j="${j}" aria-label="Fullfør sett">${icon.check}</button>
  </div>`;
}
const HEADS = { w: ['kg', 'Reps', 'RPE'], b: ['+kg', 'Reps', 'RPE'], t: ['Sek', '+kg', 'RPE'], c: ['Min', 'Km', 'RPE'] };

function workoutView(w, mode) {
  const exs = w.exercises.map((e, i) => {
    const x = ex(e.exId);
    const lp = lastPerformance(e.exId, w.id);
    const prog = mode === 'active' ? progression(e, x, lp) : null;
    let prev = lp?.sets?.filter((s) => !s.warmup);
    if (prog) prev = prev.map((s) => ({ ...s, kg: prog.kg, reps: prog.low }));
    const h = HEADS[x.type] || HEADS.w;
    const doneN = e.sets.filter((s) => s.done).length;
    return `<div class="card wex ${doneN && doneN === e.sets.length ? 'complete' : ''}">
      <div class="row between">
        <a class="grow row gap" href="#/exercise/${x.id}">${bodyMini(x)}<b class="exname">${esc(x.name)}</b></a>
        <button class="icon-btn sm" data-a="exMenu" data-i="${i}" aria-label="Meny">${icon.dots}</button>
      </div>
      ${e.target ? `<div class="target">${esc(targetText(e.target))}${e.target.notes ? `<br><i>${esc(e.target.notes)}</i>` : ''}</div>` : ''}
      ${prog ? `<div class="prog">⬆️ <b>Øk vekten til ${fmtNum(prog.kg)} kg</b><small>Du klarte ${prog.top} reps på alle settene med ${fmtNum(prog.from)} kg sist. Sikt på ${prog.low}+ reps nå.</small></div>` : ''}
      ${lp ? `<div class="last muted small">Sist (${fmtShort(lp.date)}): ${lp.sets.map((s) => fmtSet(s, x.type)).join(', ')}</div>` : ''}
      <div class="set-head"><span>Sett</span><span>Forrige</span><span>${h[0]}</span><span>${h[1]}</span><span>${h[2]}</span><span></span></div>
      ${e.sets.map((s, j) => setRow(e, i, j, s, prev, x.type)).join('')}
      <div class="row gap mt-s"><button class="btn sm grow" data-a="addSet" data-i="${i}">${icon.plus} Sett</button><button class="btn sm" data-a="removeSet" data-i="${i}">− Sett</button></div>
      <input class="note-in" data-f="exnote" data-i="${i}" value="${esc(e.notes)}" placeholder="Notat til øvelsen">
    </div>`;
  }).join('');
  const isActive = mode === 'active';
  return `<div class="workout" data-mode="${mode}" data-sid="${w.id}">
    <div class="card wk-head">
      <input class="big-in" data-f="wname" value="${esc(w.name)}">
      <div class="row between muted small"><span>${fmtDay(w.startedAt)} · ${fmtTime(w.startedAt)}</span>
      <span>${isActive ? `⏱ <b data-elapsed>${fmtDur(Date.now() - w.startedAt)}</b>` : w.finishedAt ? fmtDur(w.finishedAt - w.startedAt) : ''}</span></div>
      <textarea data-f="wnotes" rows="1" placeholder="Notat for økta (søvn, energi, sted…)">${esc(w.notes)}</textarea>
    </div>
    ${exs || '<p class="muted center">Ingen øvelser ennå – legg til under.</p>'}
    <button class="btn block" data-a="wAddEx">${icon.plus} Legg til øvelse</button>
    ${isActive
      ? `<button class="btn primary block mt" data-a="finish">Fullfør økt</button><button class="btn block ghost danger mt" data-a="cancelWorkout">Avbryt og slett økt</button>`
      : `<button class="btn block ghost danger mt" data-a="delSession">Slett økt fra loggen</button>`}
  </div>`;
}

function vActive() {
  if (!S.active) return { title: 'Økt', html: `<div class="card center"><p>Ingen pågående økt.</p><button class="btn primary" data-a="startPick">Start en økt</button></div>` };
  return { title: 'Pågående økt', tab: 'plan', html: workoutView(S.active, 'active'), after: () => keepAwake(true) };
}

function vSession(id, q) {
  const s = S.sessions.find((x) => x.id === id);
  if (!s) return { title: 'Økt', back: '#/history', html: '<p class="muted">Fant ikke økten.</p>' };
  const summary = q.has('new') ? `<div class="card hero done-card"><div class="eyebrow">Bra jobba! 🎉</div><h2>Økt fullført</h2>
    <div class="stats in"><div><b>${fmtDur(s.finishedAt - s.startedAt)}</b><span>tid</span></div><div><b>${sessionSets(s)}</b><span>sett</span></div><div><b>${Math.round(sessionVolume(s))}</b><span>kg volum</span></div></div>
    ${prsFor(s)}</div>` : '';
  return { title: s.name, back: '#/history', tab: 'history', html: summary + workoutView(s, 'edit') };
}

function prsFor(s) {
  const prs = prList(s);
  return prs.length ? `<div class="prs"><b>🏆 Nye rekorder</b>${prs.map((p) => `<div>${esc(p)}</div>`).join('')}</div>` : '';
}
function prList(s) {
  const prs = [];
  for (const e of s.exercises) {
    const x = ex(e.exId); if (x.type !== 'w') continue;
    const best = Math.max(0, ...e.sets.filter((z) => z.done && !z.warmup).map((z) => e1rm(z.kg, z.reps)));
    if (!best) continue;
    const older = S.sessions.filter((o) => o.startedAt < s.startedAt).flatMap((o) => o.exercises.filter((oe) => oe.exId === e.exId).flatMap((oe) => oe.sets.filter((z) => z.done && !z.warmup)));
    if (!older.length) continue;
    const prevBest = Math.max(0, ...older.map((z) => e1rm(z.kg, z.reps)));
    if (best > prevBest) prs.push(`${x.name}: ${fmtNum(Math.round(best * 10) / 10)} kg e1RM`);
  }
  return prs;
}

function getWorkout(el) {
  const root = el.closest('[data-mode]');
  if (!root) return {};
  const mode = root.dataset.mode;
  const w = mode === 'active' ? S.active : S.sessions.find((s) => s.id === root.dataset.sid);
  return { w, mode };
}
let persistT;
function persistWorkout(w, mode, now = false) {
  clearTimeout(persistT);
  const fn = () => (mode === 'active' ? store.saveActive() : store.putSession(w));
  if (now) return fn();
  persistT = setTimeout(fn, 300);
}

function newSessionFrom(tp) {
  return {
    id: uid(), templateId: tp?.id || null, name: tp?.name || 'Fri økt', startedAt: Date.now(), notes: '',
    exercises: (tp?.exercises || []).map((te) => newWorkoutExercise(te.exId, te)),
  };
}
function newWorkoutExercise(exId, te) {
  const lp = lastPerformance(exId);
  const n = te?.sets || lp?.sets.filter((s) => !s.warmup).length || 3;
  return { exId, notes: '', target: te ? { sets: te.sets, reps: te.reps, rpe: te.rpe, rest: te.rest, notes: te.notes } : null, sets: Array.from({ length: n }, () => ({})) };
}

async function startWorkout(tid) {
  if (S.active) {
    if (!confirm(`Du har en pågående økt («${S.active.name}»). Vil du avslutte den uten å lagre og starte ny?`)) { go('#/active'); return; }
  }
  S.active = newSessionFrom(tid ? tplById(tid) : null);
  await store.saveActive();
  unlockAudio();
  go('#/active');
}

async function finishWorkout() {
  const w = S.active; if (!w) return;
  // Sett med verdier regnes som fullført; tomme sett fjernes.
  for (const e of w.exercises) {
    const hasVal = (s) => ['kg', 'reps', 'sec', 'min', 'km'].some((f) => s[f] != null);
    for (const s of e.sets) if (!s.done && hasVal(s)) s.done = true;
    e.sets = e.sets.filter((s) => s.done && hasVal(s));
  }
  w.exercises = w.exercises.filter((e) => e.sets.length);
  if (!w.exercises.length) {
    if (!confirm('Ingen sett er logget. Vil du forkaste økta?')) return;
    S.active = null; await store.saveActive(); stopRest(); keepAwake(false); go('#/home'); return;
  }
  w.finishedAt = Date.now();
  await store.putSession(w);
  S.active = null; await store.saveActive();
  stopRest(); keepAwake(false);
  go(`#/session/${w.id}?new=1`);
}

// ================= Hviletimer =================
let rest = null, restTick = null, audioCtx = null;
function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch {}
}
function beep() {
  if (!S.settings.sound || !audioCtx) return;
  try {
    const t0 = audioCtx.currentTime;
    [0, 0.22, 0.44].forEach((d, k) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = k === 2 ? 1320 : 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.18);
      o.connect(g).connect(audioCtx.destination); o.start(t0 + d); o.stop(t0 + d + 0.2);
    });
  } catch {}
  navigator.vibrate?.([200, 100, 200]);
}
function startRest(sec) {
  rest = { end: Date.now() + sec * 1000, total: sec };
  $('#rest').hidden = false;
  clearInterval(restTick); restTick = setInterval(updRest, 250); updRest();
}
function updRest() {
  if (!rest) return;
  const left = Math.ceil((rest.end - Date.now()) / 1000);
  if (left <= 0) { beep(); toast('Hvile ferdig – neste sett! 💪'); stopRest(); return; }
  $('#rest-t').textContent = mmss(left);
  $('#rest-bar').style.transform = `scaleX(${Math.max(0, left / rest.total)})`;
}
function stopRest() { rest = null; clearInterval(restTick); $('#rest').hidden = true; }

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (S.active && parseRoute().r === 'active') keepAwake(true); updRest(); } });
setInterval(() => { if (S.active) $$('[data-elapsed]').forEach((el) => { el.textContent = fmtDur(Date.now() - S.active.startedAt); }); }, 15000);

// ================= BIBLIOTEK =================
function libFilter() {
  const { q, g, eq } = ui.lib;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return allEx().filter((x) => (!g || x.group === g) && (!eq || x.eq === eq) && words.every((wd) => (x.name + ' ' + (GROUPS[x.group] || '') + ' ' + (EQUIP[x.eq] || '')).toLowerCase().includes(wd)))
    .sort((a, b) => a.name.localeCompare(b.name));
}
function libList(list, pick) {
  if (!list.length) return '<p class="muted center">Ingen treff. Du kan lage en egen øvelse.</p>';
  return list.map((x) => pick
    ? `<label class="item pick"><input type="checkbox" value="${x.id}" ${pick.has(x.id) ? 'checked' : ''}>${bodyMini(x)}<div class="grow"><b>${esc(x.name)}</b><small class="muted">${GROUPS[x.group] || ''} · ${EQUIP[x.eq] || ''}</small></div></label>`
    : `<a class="item" href="#/exercise/${x.id}">${bodyMini(x)}<div class="grow"><b>${esc(x.name)}${x.custom ? ' <span class="badge">egen</span>' : ''}</b><small class="muted">${GROUPS[x.group] || ''} · ${EQUIP[x.eq] || ''}</small></div>${icon.chev}</a>`).join('');
}
function filterBar() {
  return `<input type="search" class="search" data-lib="q" value="${esc(ui.lib.q)}" placeholder="Søk i ${allEx().length} øvelser…">
    <div class="chips scroll">${['', ...Object.keys(GROUPS)].map((g) => `<button class="chip ${ui.lib.g === g ? 'on' : ''}" data-a="libG" data-g="${g}">${g ? GROUPS[g] : 'Alle'}</button>`).join('')}</div>
    <div class="chips scroll">${['', ...Object.keys(EQUIP)].map((e) => `<button class="chip sm ${ui.lib.eq === e ? 'on' : ''}" data-a="libEq" data-eq="${e}">${e ? EQUIP[e] : 'Alt utstyr'}</button>`).join('')}</div>`;
}
function vLibrary() {
  const list = libFilter();
  return {
    title: 'Øvelser', tab: 'library',
    right: `<button class="icon-btn" data-a="customEx" aria-label="Ny øvelse">${icon.plus}</button>`,
    html: `<div class="sticky-filter">${filterBar()}</div><div class="muted small count">${list.length} øvelser</div><div id="lib-list">${libList(list)}</div>`,
  };
}
function refreshLib() {
  const list = libFilter();
  const inSheet = !$('#sheet').hidden && $('#pick-list');
  if (inSheet) { $('#pick-list').innerHTML = libList(list, picker.sel); $('#sheet .filters').innerHTML = filterBar(); return; }
  $('#lib-list').innerHTML = libList(list);
  $('.count').textContent = `${list.length} øvelser`;
  $('.sticky-filter').innerHTML = filterBar();
}

function vExercise(id) {
  const x = ex(id);
  const hist = exerciseHistory(id);
  let chart = '', best = '';
  if (hist.length) {
    const pts = hist.slice().reverse().map((h) => {
      const ws = h.sets.filter((s) => !s.warmup);
      let y = 0;
      if (x.type === 'w') y = Math.max(...ws.map((s) => e1rm(s.kg, s.reps)));
      else if (x.type === 'b') y = Math.max(...ws.map((s) => (s.reps || 0)));
      else if (x.type === 't') y = Math.max(...ws.map((s) => s.sec || 0));
      else y = Math.max(...ws.map((s) => s.km || s.min || 0));
      return { x: h.date, y };
    }).filter((p) => p.y > 0);
    const lab = { w: 'Estimert 1RM (kg)', b: 'Beste reps', t: 'Lengste hold (sek)', c: 'Distanse / tid' }[x.type];
    chart = `<div class="card"><div class="eyebrow">${lab}</div>${lineChart(pts, { unit: x.type === 'w' ? ' kg' : '' })}</div>`;
    if (x.type === 'w') {
      const all = hist.flatMap((h) => h.sets.filter((s) => !s.warmup));
      const heavy = all.reduce((a, s) => ((s.kg || 0) > (a?.kg || 0) ? s : a), null);
      const top = Math.max(...all.map((s) => e1rm(s.kg, s.reps)));
      const vol = Math.max(...hist.map((h) => h.sets.reduce((a, s) => a + setVolume(s, 'w'), 0)));
      best = `<div class="stats"><div><b>${fmtNum(heavy?.kg)}</b><span>tyngste kg</span></div><div><b>${fmtNum(Math.round(top * 10) / 10)}</b><span>e1RM</span></div><div><b>${Math.round(vol)}</b><span>maks volum</span></div></div>`;
    }
  }
  return {
    title: x.name, back: 'history-back',
    html: `<div class="card">${bodyMap(x)}</div><div class="card">
        <div class="chips small"><span>${GROUPS[x.group] || ''}</span><span>${EQUIP[x.eq] || ''}</span><span>${TYPES[x.type]}</span>${x.custom ? '<span>Egen øvelse</span>' : ''}</div>
        <a class="btn block mt" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(x.name + ' exercise technique')}">▶︎ Se teknikk på YouTube</a>
        ${x.custom ? `<button class="btn block ghost danger mt" data-a="delCustom" data-id="${x.id}">Slett egen øvelse</button>` : ''}
      </div>
      ${best}${chart}
      <h3 class="sec">Historikk</h3>
      ${hist.length ? hist.slice(0, 30).map((h) => `<a class="item" href="#/session/${h.sessionId}"><div class="grow"><b>${fmtDay(h.date)}</b><small class="muted">${h.sets.map((s) => fmtSet(s, x.type) + (s.rpe != null ? ' @' + fmtNum(s.rpe) : '')).join(', ')}</small></div></a>`).join('') : '<p class="muted">Ikke logget ennå.</p>'}`,
  };
}

// ================= LOGG =================
function vHistory() {
  if (!S.sessions.length) return { title: 'Logg', tab: 'history', html: '<div class="card center"><p class="muted">Ingen økter logget ennå.</p><button class="btn primary" data-a="startPick">Start din første økt</button></div>' };
  let html = '', month = '';
  for (const s of S.sessions) {
    const m = fmtMonth(s.startedAt);
    if (m !== month) { month = m; html += `<h3 class="sec">${m}</h3>`; }
    html += sessionItem(s);
  }
  const total = S.sessions.length;
  return { title: 'Logg', tab: 'history', right: `<a class="btn sm" href="#/week/0">Ukerapport</a>`, html: `<div class="stats"><div><b>${total}</b><span>økter totalt</span></div><div><b>${S.sessions.reduce((a, s) => a + sessionSets(s), 0)}</b><span>sett</span></div><div><b>${fmtNum(Math.round(S.sessions.reduce((a, s) => a + sessionVolume(s), 0) / 100) / 10)} t</b><span>løftet</span></div></div>${html}` };
}

// ================= FREMGANG =================
function vProgress() {
  const ws = S.body.filter((b) => b.weight != null);
  const waist = S.body.filter((b) => b.waist != null);
  const first = ws[0], last = ws.at(-1);
  const diff = first && last && first !== last ? last.weight - first.weight : null;
  const photos = photosByAngle(ui.photoAngle);
  return {
    title: 'Fremgang', tab: 'progress',
    html: `
      <div class="card">
        <div class="row between"><div class="eyebrow">Kroppsvekt</div>${diff != null ? `<span class="delta ${diff <= 0 ? 'good' : ''}">${diff > 0 ? '+' : ''}${fmtNum(Math.round(diff * 10) / 10)} kg</span>` : ''}</div>
        ${last ? `<div class="bigval">${fmtNum(last.weight)} <small>kg</small></div>` : ''}
        ${lineChart(ws.map((b) => ({ x: b.date, y: b.weight })), { unit: ' kg' })}
        <button class="btn primary block mt" data-a="bodySheet">⚖️ Logg vekt / mål</button>
      </div>
      ${dailyWeekCard()}
      ${waist.length ? `<div class="card"><div class="eyebrow">Midjemål</div>${lineChart(waist.map((b) => ({ x: b.date, y: b.waist })), { unit: ' cm' })}</div>` : ''}
      <div class="card">
        <div class="row between"><div class="eyebrow">Progresjonsbilder</div><span class="muted small">${S.photos.length} bilder</span></div>
        <div class="chips">${Object.entries(ANGLES).map(([k, v]) => `<button class="chip ${ui.photoAngle === k ? 'on' : ''}" data-a="photoAngle" data-k="${k}">${v} (${photosByAngle(k).length})</button>`).join('')}</div>
        <div class="gallery">${photos.slice().reverse().map((p) => `<button class="ph" data-a="photoView" data-id="${p.id}"><img src="${photoURL(p)}" alt="" loading="lazy"><span>${fmtShort(p.date)}</span></button>`).join('') || '<p class="muted small">Ingen bilder i denne kategorien.</p>'}</div>
        <div class="row gap mt"><button class="btn primary grow" data-a="photoSheet">${icon.cam} Legg til bilde</button><a class="btn grow ${photos.length < 2 ? 'disabled' : ''}" href="#/compare?angle=${ui.photoAngle}">Sammenlign</a></div>
        <p class="muted small mt-s">Tips: Ta bildene samme sted, med samme lys og avstand – da blir sammenligningen best.</p>
      </div>
      ${S.body.length ? `<h3 class="sec">Registreringer</h3>${S.body.slice().reverse().slice(0, 20).map((b) => `<div class="item"><div class="grow"><b>${fmtDate(b.date)}</b><small class="muted">${b.weight != null ? fmtNum(b.weight) + ' kg' : ''}${b.waist != null ? ' · midje ' + fmtNum(b.waist) + ' cm' : ''}${b.note ? ' · ' + esc(b.note) : ''}</small></div><button class="icon-btn sm danger" data-a="delBody" data-id="${b.id}">${icon.x}</button></div>`).join('')}` : ''}
    `,
  };
}

function vCompare(_, q) {
  if (q.get('angle')) { ui.cmp.angle = q.get('angle'); }
  const c = ui.cmp;
  const list = photosByAngle(c.angle);
  if (!list.find((p) => p.id === c.a)) c.a = list[0]?.id || null;
  if (!list.find((p) => p.id === c.b)) c.b = list.at(-1)?.id || null;
  const A = list.find((p) => p.id === c.a), B = list.find((p) => p.id === c.b);
  const opt = (sel) => list.map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${fmtDate(p.date)}</option>`).join('');
  const wInfo = (p) => { const w = p && weightNear(p.date); return w ? ` · ${fmtNum(w.weight)} kg` : ''; };
  const days = A && B ? Math.round(Math.abs(B.date - A.date) / 864e5) : 0;
  return {
    title: 'Sammenlign', back: '#/progress', tab: 'progress',
    html: `
      <div class="chips">${Object.entries(ANGLES).map(([k, v]) => `<button class="chip ${c.angle === k ? 'on' : ''}" data-a="cmpAngle" data-k="${k}">${v}</button>`).join('')}</div>
      ${list.length < 2 ? '<p class="muted center">Du trenger minst to bilder i denne kategorien.</p>' : `
      <div class="cmp-sel">
        <label>Før<select data-cmp="a">${opt(c.a)}</select><small class="muted">${A ? fmtShort(A.date) + wInfo(A) : ''}</small></label>
        <label>Etter<select data-cmp="b">${opt(c.b)}</select><small class="muted">${B ? fmtShort(B.date) + wInfo(B) : ''}</small></label>
      </div>
      <div class="cmp ${c.mode}" style="--pos:${c.pos}%;--op:${1 - c.pos / 100}">
        <img class="cmp-b" src="${photoURL(B, 'full')}" alt="Etter">
        <img class="cmp-a" src="${photoURL(A, 'full')}" alt="Før">
        <div class="cmp-line"></div>
        <span class="cmp-tag l">Før</span><span class="cmp-tag r">Etter</span>
      </div>
      <input type="range" min="0" max="100" value="${c.pos}" class="range" data-cmp="pos">
      <div class="row between"><span class="muted small">${days} dager mellom bildene</span>
        <div class="seg"><button class="${c.mode === 'slide' ? 'on' : ''}" data-a="cmpMode" data-m="slide">Glider</button><button class="${c.mode === 'fade' ? 'on' : ''}" data-a="cmpMode" data-m="fade">Overtone</button></div></div>`}
    `,
  };
}

// ================= INNSTILLINGER / DATA =================
function vSettings() {
  return {
    title: 'Innstillinger', back: '#/home',
    html: `
      <div class="card">
        <div class="eyebrow">Profil</div>
        <label class="lbl">Navn (vises på forsiden)<input data-set="name" value="${esc(S.settings.name)}" placeholder="Ditt navn"></label>
        <label class="lbl">Standard hviletid (sek)<input data-set="restDefault" inputmode="numeric" value="${S.settings.restDefault}"></label>
        <label class="toggle"><input type="checkbox" data-set="sound" ${S.settings.sound ? 'checked' : ''}> Lyd når hvile er ferdig</label>
      </div>

      <div class="card">
        <div class="eyebrow">Daglige mål</div>
        <p class="muted small">Brukes i sjekklisten på forsiden. Lagres kun på telefonen. <a class="link" href="#/helse">Hent automatisk fra MyFitnessPal/Garmin via Apple Helse ›</a></p>
        <div class="grid2">
          <label class="lbl">Kalorier (maks)<input data-set="targets.kcal" inputmode="numeric" value="${S.settings.targets?.kcal ?? ''}" placeholder="f.eks. 2000"></label>
          <label class="lbl">Protein (g)<input data-set="targets.protein" inputmode="numeric" value="${S.settings.targets?.protein ?? ''}" placeholder="f.eks. 170"></label>
          <label class="lbl">Skritt<input data-set="targets.steps" inputmode="numeric" value="${S.settings.targets?.steps ?? ''}" placeholder="8000"></label>
          <label class="lbl">Søvn (timer)<input data-set="targets.sleep" inputmode="decimal" value="${S.settings.targets?.sleep != null ? fmtNum(S.settings.targets.sleep) : ''}" placeholder="7,5"></label>
        </div>
      </div>

      <div class="card">
        <div class="eyebrow">Importer program fra Claude</div>
        <p class="muted small">Lim inn programmet (JSON) som Claude lager for deg.</p>
        <textarea id="prog-in" rows="5" placeholder='{"format":"istrefi-program/1", "name": "...", "workouts": [...]}'></textarea>
        <label class="toggle"><input type="checkbox" id="prog-plan" checked> Erstatt ukesplanen</label>
        <label class="toggle"><input type="checkbox" id="prog-rm" checked> Fjern økter fra forrige importerte program</label>
        <button class="btn primary block" data-a="importPaste">Importer</button>
        <button class="btn block mt" data-a="loadRepoPrograms">Hent programmer fra GitHub-repoet</button>
        <div id="repo-progs"></div>
      </div>

      <div class="card">
        <div class="eyebrow">Send loggen til Claude</div>
        <p class="muted small">Kopier en oppsummering og lim den inn i chatten med Claude for å få et nytt ukesprogram.</p>
        <div class="seg">${[14, 28, 56, 90].map((d) => `<button class="${ui.exportDays === d ? 'on' : ''}" data-a="expDays" data-d="${d}">${d} d</button>`).join('')}</div>
        <button class="btn primary block mt" data-a="copyExport">Kopier treningslogg</button>
      </div>

      <div class="card">
        <div class="eyebrow">Backup</div>
        <p class="muted small">All data ligger kun på denne telefonen. Ta backup jevnlig (lagre i Filer / iCloud Drive).</p>
        <label class="toggle"><input type="checkbox" id="bk-photos" checked> Ta med bilder</label>
        <button class="btn block" data-a="backup">Eksporter backup</button>
        <label class="btn block mt">Gjenopprett fra backup<input type="file" accept="application/json,.json" data-file="restore" hidden></label>
        <div id="storage-info" class="muted small mt-s"></div>
      </div>

      <div class="card">
        <div class="eyebrow">Faresone</div>
        <button class="btn block danger" data-a="wipe">Slett all data</button>
      </div>
      <p class="muted small center">Istrefi Workout v${APP_VERSION} · ${allEx().length} øvelser</p>`,
    after: storageInfo,
  };
}
async function storageInfo() {
  const el = $('#storage-info'); if (!el) return;
  try {
    const persisted = await navigator.storage?.persisted?.();
    const est = await navigator.storage?.estimate?.();
    el.innerHTML = `Lagring: ${est ? (est.usage / 1048576).toFixed(1) + ' MB brukt' : 'ukjent'} · ${persisted ? '🔒 permanent' : 'ikke merket permanent'}${persisted ? '' : ' <button class="link" data-a="persist">Be om permanent lagring</button>'}`;
  } catch { el.textContent = ''; }
}

function vHealth() {
  const step = (n, title, body) => `<div class="hstep"><span class="hnum">${n}</span><div><b>${title}</b>${body}</div></div>`;
  return {
    title: 'Hent fra Helse', back: '#/home',
    html: `
      <div class="card"><div class="eyebrow">Først: hvordan det henger sammen</div>
        <p class="m0">Appen din får <b>ikke lov</b> av Apple til å lese Helse direkte. Derfor trenger vi et «bud»: en <b>snarvei</b> i Snarveier-appen på iPhone.</p>
        <div class="flow"><span>MyFitnessPal<br>Garmin</span>→<span>Apple<br>Helse</span>→<span>Snarvei<br><small>kopierer tallene</small></span>→<span>Denne appen<br><small>📲 Hent fra Helse</small></span></div>
        <p class="muted small m0">Snarveien lager du én gang. Etterpå er det bare: kjør snarveien → åpne appen → trykk knappen.</p>
      </div>

      <div class="card guide"><div class="eyebrow">Del 1 · Bare kalorier først (test at det virker)</div>
        ${step(1, 'Åpne Snarveier-appen', '<p>Den er forhåndsinstallert (ikon med to fargede firkanter). Finner du den ikke: sveip ned på hjemskjermen og søk «Snarveier».</p>')}
        ${step(2, 'Lag ny snarvei', '<p>Trykk <b>+</b> øverst til høyre. Trykk på navnet øverst («Ny snarvei») → <b>Gi nytt navn</b> → skriv <code>Istrefi Helse</code>.</p>')}
        ${step(3, 'Hent kaloriene', '<p>Trykk i søkefeltet nederst («Søk etter handlinger») og skriv <code>helse</code>. Velg den som heter <b>Finn Helse-datapunkter</b> (eng. <i>Find Health Samples</i>).</p><p>I den blå teksten som dukker opp: trykk på <b>Type</b> → bla og velg <b>Energi fra mat</b> (står under E; eng. <i>Dietary Energy</i>, det er kaloriene fra MyFitnessPal). Ikke velg «Aktiv energi».</p><p>Filteret <b>Startdato</b> ligger der allerede: trykk på «er i de siste» og velg <b>er i dag</b>.</p>')}
        ${step(4, 'Legg sammen alle måltidene', '<p>Søk etter <code>statistikk</code> og velg <b>Beregn statistikk</b>. Trykk på det blå ordet og velg <b>Sum</b>.</p>')}
        ${step(5, 'Gi tallet et navn', '<p>Søk etter <code>variabel</code> og velg <b>Angi variabel</b> (eng. <i>Set Variable</i>). Trykk på «Variabelnavn» og skriv <code>kcal</code>.</p>')}
        ${step(6, 'Lag teksten appen forstår', '<p>Søk etter <code>tekst</code> og velg <b>Tekst</b>. Trykk i tekstboksen og skriv:</p><pre>kcal=</pre><p>Rett etter = (uten mellomrom): se på raden <b>over tastaturet</b>. Der står variablene. Trykk på <b>kcal</b>. Den legges inn som en liten farget boble.</p>')}
        ${step(7, 'Kopier', '<p>Søk etter <code>kopier</code> og velg <b>Kopier til utklipp</b>. Trykk <b>Ferdig</b> oppe til høyre.</p>')}
        ${step(8, 'Test!', '<p>Trykk på snarveien én gang for å kjøre den. Første gang spør iPhone om tilgang til Helse: trykk <b>Tillat</b> / slå på Energi fra mat.</p><p>Gå tilbake hit og trykk knappen under. Når iPhone viser en liten <b>«Lim inn»</b>-boble, trykker du på den.</p>')}
        <button class="btn primary block mt" data-a="healthImport">📲 Hent fra Helse</button>
        <p class="muted small">Ser du kaloriene dine på sjekklisten nå? 🎉 Da virker det. Fortsett med del 2.</p>
      </div>

      <div class="card guide"><div class="eyebrow">Del 2 · Legg til protein og skritt</div>
        ${step(1, 'Rediger snarveien', '<p>I Snarveier: trykk på <b>⋯</b> på «Istrefi Helse»-kortet for å redigere.</p>')}
        ${step(2, 'Protein', '<p>Gjør steg 3–5 fra del 1 på nytt, men velg Type <b>Protein</b> og kall variabelen <code>protein</code>. De nye handlingene havner nederst. Hold fingeren på dem og dra dem opp <b>over</b> Tekst-handlingen.</p>')}
        ${step(3, 'Skritt', '<p>Samme igjen med Type <b>Skritt</b> og variabelnavn <code>skritt</code>.</p>')}
        ${step(4, 'Utvid teksten', '<p>Trykk i Tekst-boksen, helt bakerst, og skriv <code>;protein=</code> → trykk <b>protein</b>-variabelen. Skriv så <code>;skritt=</code> → trykk <b>skritt</b>. Ferdig ser den slik ut:</p><pre>kcal=[kcal];protein=[protein];skritt=[skritt]</pre>')}
      </div>

      <div class="card guide"><div class="eyebrow">Del 3 · Søvn (valgfritt, litt vanskeligere)</div>
        ${step(1, 'Finn søvnen', '<p>Legg til <b>Finn Helse-datapunkter</b> med Type <b>Søvn</b> (eng. <i>Sleep</i>). Filter: <b>Sluttdato</b> · <b>er i dag</b>. Trykk <b>Legg til filter</b> igjen: <b>Verdi</b> · <b>er ikke</b> · <b>Våken</b>.</p>')}
        ${step(2, 'Hent lengden', '<p>Søk etter <code>detaljer</code> og velg <b>Hent detaljer om Helse-datapunkt</b> → velg <b>Varighet</b>.</p>')}
        ${step(3, 'Summer og gi navn', '<p><b>Beregn statistikk</b> → <b>Sum</b>, så <b>Angi variabel</b> <code>sovn</code>. Dra dem over Tekst-handlingen.</p>')}
        ${step(4, 'Utvid teksten', '<p>Legg til <code>;sovn=</code> + <b>sovn</b>-variabelen bakerst i teksten. Appen skjønner selv om tallet er sekunder, minutter eller timer.</p>')}
      </div>

      <div class="card guide"><div class="eyebrow">Bonus · Kjør den automatisk hver kveld</div>
        ${step(1, 'Automasjon', '<p>Nederst i Snarveier: <b>Automasjon</b> → <b>+</b> → <b>Tidspunkt</b> → f.eks. <b>21:00</b>, Daglig.</p>')}
        ${step(2, 'Kjør umiddelbart', '<p>Velg <b>Kjør umiddelbart</b> (ikke «Spør før kjøring»), og velg snarveien <b>Istrefi Helse</b>.</p>')}
        <p class="muted small">Vil du at tallene skal havne på riktig dag selv om du åpner appen dagen etter, kan du legge til dato også: legg til <b>Dato</b> → <b>Formater dato</b> (egendefinert format <code>yyyy-MM-dd</code>), og skriv <code>;dato=</code> + <b>Formatert dato</b> bakerst i teksten.</p>
      </div>

      <div class="card guide"><div class="eyebrow">Får du ingen tall?</div>
        <ul>
          <li><b>MyFitnessPal må skrive til Helse:</b> MyFitnessPal → Mer → Innstillinger → Apper og enheter (Sharing &amp; Privacy) → Apple Helse → slå på næringsstoffer.</li>
          <li><b>Garmin:</b> Garmin Connect → Mer → Innstillinger → Tilkoblede apper → Apple Helse → slå på skritt og søvn.</li>
          <li><b>Sjekk i Helse-appen:</b> Utforsk → Ernæring → Energi fra mat. Står det tall der for i dag, virker koblingen.</li>
          <li>Stå det stille? Ta skjermbilde av snarveien og send det til Claude.</li>
        </ul>
      </div>`,
  };
}

function vWeek(arg) {
  const off = Math.min(0, parseInt(arg, 10) || 0);
  return { title: 'Ukerapport', back: '#/home', tab: 'history', html: weekReport(off, { sessionItem, prList }) };
}

const VIEWS = { helse: vHealth, week: vWeek, home: vHome, plan: vPlan, template: vTemplate, active: vActive, session: vSession, library: vLibrary, exercise: vExercise, history: vHistory, progress: vProgress, compare: vCompare, settings: vSettings };

// ================= Ark (bottom sheet) =================
function openSheet(html) { $('#sheet-body').innerHTML = html; $('#sheet').hidden = false; document.body.classList.add('noscroll'); }
function closeSheet() {
  if ($('#pick-list')) ui.lib = { q: '', g: '', eq: '' };
  $('#sheet').hidden = true; $('#sheet-body').innerHTML = ''; document.body.classList.remove('noscroll'); picker.cb = null;
}

const picker = { sel: new Set(), multi: true, cb: null };
function openPicker({ multi = true, onPick }) {
  picker.sel = new Set(); picker.multi = multi; picker.cb = onPick; ui.lib = { q: '', g: '', eq: '' };
  openSheet(`<div class="sheet-head"><b>${multi ? 'Velg øvelser' : 'Velg øvelse'}</b><button class="btn sm primary" data-a="pickDone">Legg til <span id="pick-n"></span></button></div>
    <div class="filters">${filterBar()}</div>
    <div id="pick-list">${libList(libFilter(), picker.sel)}</div>
    <button class="btn block ghost mt" data-a="customEx">${icon.plus} Lag egen øvelse</button>`);
}

function customExSheet(prefill = '') {
  openSheet(`<div class="sheet-head"><b>Ny egen øvelse</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
    <label class="lbl">Navn<input id="cx-name" value="${esc(prefill)}" placeholder="F.eks. Landmine Squat"></label>
    <label class="lbl">Muskelgruppe<select id="cx-group">${Object.entries(GROUPS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="lbl">Utstyr<select id="cx-eq">${Object.entries(EQUIP).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="lbl">Loggføring<select id="cx-type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <button class="btn primary block mt" data-a="saveCustom">Lagre øvelse</button>`);
}

function bodySheet() {
  const last = S.body.at(-1);
  openSheet(`<div class="sheet-head"><b>Logg kroppsmål</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
    <label class="lbl">Dato<input type="date" id="b-date" value="${isoDate()}"></label>
    <div class="grid2"><label class="lbl">Vekt (kg)<input id="b-w" inputmode="decimal" placeholder="${last?.weight != null ? fmtNum(last.weight) : '80,0'}"></label>
    <label class="lbl">Midje (cm)<input id="b-waist" inputmode="decimal" placeholder="${last?.waist != null ? fmtNum(last.waist) : 'valgfritt'}"></label></div>
    <label class="lbl">Notat<input id="b-note" placeholder="Valgfritt"></label>
    <button class="btn primary block mt" data-a="saveBody">Lagre</button>`);
}

function photoSheet() {
  openSheet(`<div class="sheet-head"><b>Nytt progresjonsbilde</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
    <div class="lbl">Vinkel</div>
    <div class="seg full" id="ph-angle">${Object.entries(ANGLES).map(([k, v]) => `<button class="${ui.photoAngle === k ? 'on' : ''}" data-a="phAngle" data-k="${k}">${v}</button>`).join('')}</div>
    <label class="lbl">Dato<input type="date" id="ph-date" value="${isoDate()}"></label>
    <label class="lbl">Notat<input id="ph-note" placeholder="Valgfritt"></label>
    <label class="btn primary block mt">${icon.cam} Ta / velg bilde<input type="file" accept="image/*" multiple data-file="photo" hidden></label>
    <p class="muted small">Bildene lagres kun på telefonen din.</p>`);
}

// ================= Handlinger =================
const A = {
  closeSheet,
  start: (el) => { closeSheet(); startWorkout(el.dataset.id); },
  startEmpty: () => startWorkout(null),
  startPick: () => {
    if (!S.templates.length) { startWorkout(null); return; }
    openSheet(`<div class="sheet-head"><b>Start økt</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      ${S.templates.map((t) => `<button class="item w100" data-a="start" data-id="${t.id}"><div class="grow"><b>${esc(t.name)}</b><small class="muted">${t.exercises.length} øvelser</small></div>${icon.play}</button>`).join('')}
      <button class="btn block mt" data-a="startEmpty">Tom økt</button>`);
  },
  newTemplate: async () => {
    const t = { id: uid(), name: 'Ny økt', notes: '', createdAt: Date.now(), exercises: [] };
    await store.putTemplate(t); go(`#/template/${t.id}`);
  },
  tMove: async (el) => {
    const t = tplById(parseRoute().arg); const i = +el.dataset.i, j = i + +el.dataset.d;
    if (j < 0 || j >= t.exercises.length) return;
    [t.exercises[i], t.exercises[j]] = [t.exercises[j], t.exercises[i]]; await store.putTemplate(t); render();
  },
  tRemove: async (el) => { const t = tplById(parseRoute().arg); t.exercises.splice(+el.dataset.i, 1); await store.putTemplate(t); render(); },
  tAdd: () => {
    const t = tplById(parseRoute().arg);
    openPicker({ onPick: async (ids) => {
      for (const id of ids) t.exercises.push({ exId: id, sets: 3, reps: '8-12', rpe: '8', rest: S.settings.restDefault, notes: '' });
      await store.putTemplate(t); render();
    } });
  },
  tDuplicate: async () => {
    const t = tplById(parseRoute().arg);
    const c = { ...structuredClone(t), id: uid(), name: t.name + ' (kopi)', programId: null, program: '', createdAt: Date.now() };
    await store.putTemplate(c); go(`#/template/${c.id}`);
  },
  tDelete: async () => { const t = tplById(parseRoute().arg); if (!confirm(`Slette «${t.name}»? (Loggførte økter beholdes.)`)) return; await store.delTemplate(t.id); go('#/plan'); },
  dayAdd: (el) => {
    const d = +el.dataset.day;
    openSheet(`<div class="sheet-head"><b>${DAYS[d]}</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      ${S.templates.map((t) => `<button class="item w100" data-a="dayPut" data-day="${d}" data-id="${t.id}"><div class="grow"><b>${esc(t.name)}</b></div>${icon.plus}</button>`).join('') || '<p class="muted">Lag en økt først.</p>'}
      ${S.plan.days[d].length ? `<button class="btn block ghost danger mt" data-a="dayClear" data-day="${d}">Gjør til hviledag</button>` : ''}`);
  },
  dayPut: async (el) => { const d = +el.dataset.day; if (!S.plan.days[d].includes(el.dataset.id)) S.plan.days[d].push(el.dataset.id); await store.savePlan(); closeSheet(); render(); },
  dayClear: async (el) => { S.plan.days[+el.dataset.day] = []; await store.savePlan(); closeSheet(); render(); },
  dayItem: (el) => {
    const d = +el.dataset.day, t = tplById(el.dataset.id);
    openSheet(`<div class="sheet-head"><b>${DAYS[d]}: ${esc(t.name)}</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      <button class="btn primary block" data-a="start" data-id="${t.id}">${icon.play} Start nå</button>
      <a class="btn block mt" href="#/template/${t.id}" data-a="closeSheet">Rediger økt</a>
      <div class="lbl mt">Flytt til</div><div class="seg full">${DAYS_SHORT.map((n, i) => `<button class="${i === d ? 'on' : ''}" data-a="dayMove" data-from="${d}" data-to="${i}" data-id="${t.id}">${n}</button>`).join('')}</div>
      <button class="btn block ghost danger mt" data-a="dayRemove" data-day="${d}" data-id="${t.id}">Fjern fra ${DAYS[d].toLowerCase()}</button>`);
  },
  dayMove: async (el) => {
    const f = +el.dataset.from, to = +el.dataset.to, id = el.dataset.id;
    S.plan.days[f] = S.plan.days[f].filter((x) => x !== id); if (!S.plan.days[to].includes(id)) S.plan.days[to].push(id);
    await store.savePlan(); closeSheet(); render();
  },
  dayRemove: async (el) => { const d = +el.dataset.day; S.plan.days[d] = S.plan.days[d].filter((x) => x !== el.dataset.id); await store.savePlan(); closeSheet(); render(); },

  // --- logging ---
  check: (el) => {
    const { w, mode } = getWorkout(el); const i = +el.dataset.i, j = +el.dataset.j;
    const e = w.exercises[i], s = e.sets[j];
    if (!s.done) {
      // Fyll tomme felt med placeholder (forrige økt) – trykk ✓ for å gjenta forrige prestasjon.
      $$(`input[data-i="${i}"][data-j="${j}"]`, el.closest('.workout')).forEach((inp) => {
        if (s[inp.dataset.f] == null && inp.placeholder && inp.dataset.f !== 'rpe') s[inp.dataset.f] = parseNum(inp.placeholder);
      });
      s.done = true;
      if (mode === 'active') { unlockAudio(); startRest(parseInt(e.target?.rest, 10) || S.settings.restDefault); }
    } else s.done = false;
    persistWorkout(w, mode, true); render();
  },
  toggleWarm: (el) => { const { w, mode } = getWorkout(el); const s = w.exercises[+el.dataset.i].sets[+el.dataset.j]; s.warmup = !s.warmup; persistWorkout(w, mode, true); render(); },
  addSet: (el) => { const { w, mode } = getWorkout(el); const e = w.exercises[+el.dataset.i]; const l = e.sets.at(-1); e.sets.push(l && !l.done ? {} : { kg: l?.kg, reps: l?.reps, sec: l?.sec, min: l?.min, km: l?.km }); persistWorkout(w, mode, true); render(); },
  removeSet: (el) => { const { w, mode } = getWorkout(el); const e = w.exercises[+el.dataset.i]; if (e.sets.length) e.sets.pop(); persistWorkout(w, mode, true); render(); },
  exMenu: (el) => {
    const { w } = getWorkout(el); const i = +el.dataset.i; const x = ex(w.exercises[i].exId);
    openSheet(`<div class="sheet-head"><b>${esc(x.name)}</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      <div class="workout" data-mode="${parseRoute().r === 'active' ? 'active' : 'edit'}" data-sid="${w.id}">
      <button class="item w100" data-a="wMove" data-i="${i}" data-d="-1">${icon.up}<div class="grow">Flytt opp</div></button>
      <button class="item w100" data-a="wMove" data-i="${i}" data-d="1">${icon.down}<div class="grow">Flytt ned</div></button>
      <button class="item w100" data-a="wSwap" data-i="${i}">⇄<div class="grow">Bytt øvelse</div></button>
      <a class="item w100" href="#/exercise/${x.id}" data-a="closeSheet">📈<div class="grow">Historikk og teknikk</div></a>
      ${['bb', 'sm', 'tb', 'ez'].includes(x.eq) ? `<button class="item w100" data-a="plates" data-kg="${[...w.exercises[i].sets].reverse().find((s) => s.kg)?.kg ?? lastPerformance(x.id, w.id)?.sets.at(-1)?.kg ?? ''}" data-bar="${x.eq === 'ez' ? 10 : 20}">🏋️<div class="grow">Skivekalkulator</div></button>` : ''}
      <button class="item w100 danger" data-a="wRemove" data-i="${i}">${icon.x}<div class="grow">Fjern fra økta</div></button></div>`);
  },
  wMove: (el) => { const { w, mode } = getWorkout(el); const i = +el.dataset.i, j = i + +el.dataset.d; if (j >= 0 && j < w.exercises.length) [w.exercises[i], w.exercises[j]] = [w.exercises[j], w.exercises[i]]; persistWorkout(w, mode, true); closeSheet(); render(); },
  wRemove: (el) => { const { w, mode } = getWorkout(el); if (!confirm('Fjerne øvelsen fra økta?')) return; w.exercises.splice(+el.dataset.i, 1); persistWorkout(w, mode, true); closeSheet(); render(); },
  wSwap: (el) => {
    const { w, mode } = getWorkout(el); const i = +el.dataset.i;
    openPicker({ multi: false, onPick: (ids) => { if (!ids[0]) return; const old = w.exercises[i]; w.exercises[i] = { ...newWorkoutExercise(ids[0], old.target ? { ...old.target, exId: ids[0] } : null) }; persistWorkout(w, mode, true); render(); } });
  },
  wAddEx: (el) => {
    const { w, mode } = getWorkout(el);
    openPicker({ onPick: (ids) => { for (const id of ids) w.exercises.push(newWorkoutExercise(id)); persistWorkout(w, mode, true); render(); } });
  },
  finish: () => { if (confirm('Fullføre og lagre økta?')) finishWorkout(); },
  cancelWorkout: async () => { if (!confirm('Slette den pågående økta? Alt du har logget nå forsvinner.')) return; S.active = null; await store.saveActive(); stopRest(); keepAwake(false); go('#/home'); },
  delSession: async (el) => { const { w } = getWorkout(el); if (!confirm('Slette økta fra loggen permanent?')) return; await store.delSession(w.id); go('#/history'); },
  restAdj: (el) => { if (!rest) return; rest.end += +el.dataset.s * 1000; rest.total = Math.max(rest.total, Math.ceil((rest.end - Date.now()) / 1000)); updRest(); },
  restSkip: stopRest,
  plates: (el) => {
    const kg = parseNum(el.dataset.kg), bar = +el.dataset.bar;
    openSheet(`<div class="sheet-head"><b>Skivekalkulator</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      <div class="grid2"><label class="lbl">Totalvekt (kg)<input id="pl-kg" inputmode="decimal" value="${kg != null ? fmtNum(kg) : ''}" placeholder="60"></label>
      <label class="lbl">Stang<select id="pl-bar">${[20, 15, 10].map((b) => `<option value="${b}" ${b === bar ? 'selected' : ''}>${b} kg</option>`).join('')}</select></label></div>
      <div id="pl-out" class="mt">${platesHTML(kg, bar)}</div>`);
  },
  dailyEdit: (el) => {
    const d = el.dataset.date;
    openSheet(`<div class="sheet-head"><b>${fmtDate(new Date(d + 'T12:00').getTime())}</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      ${dailyInputs(d)}<button class="btn primary block mt" data-a="closeDaily">Ferdig</button>`);
  },
  closeDaily: () => { closeSheet(); render(); },
  healthImport: async () => {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch {}
    if (applyHealth(text)) return;
    openSheet(`<div class="sheet-head"><b>Hent fra Helse</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      <p class="muted small">${text ? 'Fant ikke tall fra snarveien i utklippstavlen.' : 'Fikk ikke lest utklippstavlen.'} Kjør snarveien <b>Istrefi Helse</b> først, eller lim inn teksten her:</p>
      <textarea id="hl-in" rows="3" placeholder="istrefi;dato=…;kcal=…;protein=…"></textarea>
      <button class="btn primary block mt" data-a="healthPaste">Bruk</button>
      <a class="btn block ghost mt" href="#/helse" data-a="closeSheet">Hvordan setter jeg opp snarveien?</a>`);
  },
  healthPaste: () => { if (applyHealth($('#hl-in').value)) closeSheet(); else toast('Fant ingen tall i teksten'); },
  snooze: async () => { S.settings.snoozeUntil = Date.now() + 3 * 864e5; await store.saveSettings(); render(); },

  // --- bibliotek ---
  libG: (el) => { ui.lib.g = el.dataset.g; refreshLib(); },
  libEq: (el) => { ui.lib.eq = el.dataset.eq; refreshLib(); },
  customEx: () => customExSheet(ui.lib.q),
  saveCustom: async () => {
    const name = $('#cx-name').value.trim(); if (!name) { toast('Skriv inn et navn'); return; }
    const id = 'custom-' + slug(name);
    await store.putCustom({ id, name, group: $('#cx-group').value, eq: $('#cx-eq').value, type: $('#cx-type').value });
    const cb = picker.cb; closeSheet();
    if (cb) cb([id]); else go(`#/exercise/${id}`);
    toast('Øvelse lagret');
  },
  delCustom: async (el) => { if (!confirm('Slette øvelsen? Logg med øvelsen beholdes.')) return; await store.delCustom(el.dataset.id); go('#/library'); },
  pickDone: () => { const cb = picker.cb; const ids = [...picker.sel]; closeSheet(); cb?.(ids); },

  // --- kropp & bilder ---
  bodySheet,
  saveBody: async () => {
    const weight = parseNum($('#b-w').value), waist = parseNum($('#b-waist').value);
    if (weight == null && waist == null) { toast('Fyll inn vekt eller midjemål'); return; }
    await store.putBody({ id: uid(), date: fromIso($('#b-date').value || isoDate()), weight, waist, note: $('#b-note').value.trim() });
    closeSheet(); toast('Lagret ✓'); render();
  },
  delBody: async (el) => { if (!confirm('Slette registreringen?')) return; await store.delBody(el.dataset.id); render(); },
  photoAngle: (el) => { ui.photoAngle = el.dataset.k; render(); },
  photoSheet,
  phAngle: (el) => { ui.photoAngle = el.dataset.k; $$('#ph-angle button').forEach((b) => b.classList.toggle('on', b === el)); },
  photoView: (el) => {
    const p = S.photos.find((x) => x.id === el.dataset.id); const w = weightNear(p.date);
    openSheet(`<div class="sheet-head"><b>${ANGLES[p.angle]} · ${fmtDate(p.date)}</b><button class="icon-btn sm" data-a="closeSheet">${icon.x}</button></div>
      <img class="ph-full" src="${photoURL(p, 'full')}" alt="">
      <p class="muted small">${w ? `Kroppsvekt rundt denne datoen: ${fmtNum(w.weight)} kg` : ''}${p.note ? ' · ' + esc(p.note) : ''}</p>
      <div class="row gap"><a class="btn grow" href="#/compare?angle=${p.angle}" data-a="closeSheet">Sammenlign</a><button class="btn grow danger" data-a="delPhoto" data-id="${p.id}">Slett</button></div>`);
  },
  delPhoto: async (el) => { if (!confirm('Slette bildet?')) return; forgetURL(el.dataset.id); await store.delPhoto(el.dataset.id); closeSheet(); render(); },
  cmpAngle: (el) => { ui.cmp.angle = el.dataset.k; ui.cmp.a = ui.cmp.b = null; go('#/compare'); },
  cmpMode: (el) => { ui.cmp.mode = el.dataset.m; render(); },

  // --- data ---
  importPaste: async () => {
    try {
      const txt = $('#prog-in').value.trim(); if (!txt) { toast('Lim inn et program først'); return; }
      const r = await importProgram(txt, { replacePlan: $('#prog-plan').checked, removeOld: $('#prog-rm').checked });
      toast(`Importerte «${r.name || 'program'}» (${r.workouts} økter)`); go('#/plan');
    } catch (e) { alert('Kunne ikke importere: ' + e.message); }
  },
  loadRepoPrograms: async () => {
    const box = $('#repo-progs'); box.innerHTML = '<p class="muted small">Henter…</p>';
    try {
      const list = await (await fetch('programs/index.json', { cache: 'no-store' })).json();
      box.innerHTML = list.slice().reverse().map((p) => `<div class="item"><div class="grow"><b>${esc(p.name)}</b><small class="muted">${esc(p.date || '')} ${esc(p.description || '')}</small></div><button class="btn sm" data-a="importRepo" data-file="${esc(p.file)}">Importer</button></div>`).join('') || '<p class="muted small">Ingen programmer i repoet.</p>';
    } catch { box.innerHTML = '<p class="muted small">Fikk ikke hentet (er du på nett?).</p>'; }
  },
  importRepo: async (el) => {
    try {
      const p = await (await fetch('programs/' + el.dataset.file, { cache: 'no-store' })).json();
      validateProgram(p);
      if (!confirm(`Importere «${p.name}»? Ukesplanen erstattes.`)) return;
      await importProgram(p, { replacePlan: true, removeOld: $('#prog-rm')?.checked ?? true });
      toast('Program importert ✓'); go('#/plan');
    } catch (e) { alert('Kunne ikke importere: ' + e.message); }
  },
  expDays: (el) => { ui.exportDays = +el.dataset.d; render(); },
  copyExport: async () => { const ok = await copyText(exportForClaude(ui.exportDays)); toast(ok ? 'Kopiert! Lim inn i chatten med Claude.' : 'Kunne ikke kopiere'); },
  backup: async () => { toast('Lager backup…'); const b = await makeBackup({ photos: $('#bk-photos').checked }); await shareOrDownload(b, `istrefi-backup-${isoDate()}.json`); },
  persist: async () => { const ok = await navigator.storage?.persist?.(); toast(ok ? 'Lagring er nå permanent 🔒' : 'Nettleseren avslo – legg appen til på hjemskjermen'); storageInfo(); },
  wipe: async () => {
    if (!confirm('Slette ALL data (logg, økter, bilder)? Dette kan ikke angres.')) return;
    if (prompt('Skriv SLETT for å bekrefte') !== 'SLETT') return;
    await wipeAll(); location.hash = '#/home'; location.reload();
  },
};

function applyHealth(text) {
  const h = parseHealth(text);
  if (!h) return false;
  const date = h.date || isoDate();
  const day = (S.daily[date] ||= {});
  const got = [];
  if (h.kcal != null) { day.kcal = h.kcal; got.push(`${h.kcal} kcal`); }
  if (h.protein != null) { day.protein = h.protein; got.push(`${h.protein} g protein`); }
  if (h.steps != null) { day.steps = h.steps; got.push(`${h.steps} skritt`); }
  if (h.sleep != null) { day.sleep = h.sleep; got.push(`${fmtNum(h.sleep)} t søvn`); }
  store.saveDaily();
  toast(`${date === isoDate() ? 'I dag' : fmtDate(new Date(date + 'T12:00').getTime())}: ${got.join(' · ')} ✓`, 3500);
  render();
  return true;
}

// ================= Eventer =================
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  if (el && A[el.dataset.a]) {
    if (el.tagName === 'A' && el.dataset.a === 'closeSheet') { closeSheet(); return; }
    ev.preventDefault(); A[el.dataset.a](el, ev);
  }
});
$('#back').addEventListener('click', () => { if (backTarget === 'history-back' || history.length > 1) history.back(); else go(backTarget); });

let dailyT;
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.dataset.lib === 'q') { ui.lib.q = t.value; const pos = t.selectionStart; const listEl = $('#pick-list') || $('#lib-list'); const list = libFilter(); listEl.innerHTML = libList(list, $('#pick-list') ? picker.sel : null); const c = $('.count'); if (c && !$('#pick-list')) c.textContent = `${list.length} øvelser`; t.setSelectionRange?.(pos, pos); return; }
  if (t.dataset.f) {
    const { w, mode } = getWorkout(t); if (!w) return;
    const f = t.dataset.f;
    if (f === 'wname') w.name = t.value;
    else if (f === 'wnotes') w.notes = t.value;
    else if (f === 'exnote') w.exercises[+t.dataset.i].notes = t.value;
    else w.exercises[+t.dataset.i].sets[+t.dataset.j][f] = parseNum(t.value);
    persistWorkout(w, mode);
    return;
  }
  if (t.dataset.daily) {
    const d = t.dataset.date, f = t.dataset.daily;
    const day = (S.daily[d] ||= {});
    day[f] = parseNum(t.value);
    t.className = dailyClass(f, day[f]);
    clearTimeout(dailyT); dailyT = setTimeout(() => store.saveDaily(), 300);
    return;
  }
  if (t.id === 'pl-kg' || t.id === 'pl-bar') { $('#pl-out').innerHTML = platesHTML(parseNum($('#pl-kg').value), +$('#pl-bar').value); return; }
  if (t.dataset.cmp === 'pos') { ui.cmp.pos = +t.value; const cm = $('.cmp'); cm?.style.setProperty('--pos', t.value + '%'); cm?.style.setProperty('--op', 1 - t.value / 100); }
});

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (t.closest('#pick-list') && t.type === 'checkbox') {
    if (!picker.multi) { picker.sel = new Set([t.value]); A.pickDone(); return; }
    t.checked ? picker.sel.add(t.value) : picker.sel.delete(t.value);
    $('#pick-n').textContent = picker.sel.size ? `(${picker.sel.size})` : '';
    return;
  }
  if (t.dataset.tf) {
    const tp = tplById(parseRoute().arg); if (!tp) return;
    const f = t.dataset.tf;
    if (f === 'name') tp.name = t.value.trim() || 'Økt';
    else if (f === 'tnotes') tp.notes = t.value;
    else { const e = tp.exercises[+t.dataset.i]; e[f] = f === 'sets' || f === 'rest' ? parseInt(t.value, 10) || (f === 'sets' ? 1 : S.settings.restDefault) : t.value.trim(); }
    await store.putTemplate(tp); return;
  }
  if (t.dataset.set) {
    const k = t.dataset.set;
    if (k.startsWith('targets.')) {
      S.settings.targets = { ...(S.settings.targets || {}), [k.slice(8)]: parseNum(t.value) };
      await store.saveSettings(); return;
    }
    S.settings[k] = t.type === 'checkbox' ? t.checked : k === 'restDefault' ? parseInt(t.value, 10) || 90 : t.value.trim();
    await store.saveSettings(); return;
  }
  if (t.dataset.cmp === 'a' || t.dataset.cmp === 'b') { ui.cmp[t.dataset.cmp] = t.value; render(); return; }
  if (t.dataset.file === 'photo' && t.files?.length) {
    const angle = $('#ph-angle .on')?.dataset.k || 'front';
    toast('Lagrer bilde…', 8000);
    try {
      const n = await addPhotos([...t.files], { angle, date: fromIso($('#ph-date').value || isoDate()), note: $('#ph-note').value.trim() });
      ui.photoAngle = angle; closeSheet(); toast(`${n} bilde${n > 1 ? 'r' : ''} lagret ✓`); render();
    } catch (e) { toast('Feil: ' + e.message); }
    return;
  }
  if (t.dataset.file === 'restore' && t.files?.[0]) {
    if (!confirm('Gjenopprette? Dette ERSTATTER all nåværende data på telefonen.')) { t.value = ''; return; }
    try { await restoreBackup(await t.files[0].text()); toast('Backup gjenopprettet ✓'); go('#/home'); } catch (e) { alert('Feil: ' + e.message); }
  }
});

// Autosize tekstfelt og markér innhold ved fokus i tallfelt
document.addEventListener('focusin', (ev) => { const t = ev.target; if (t.matches?.('.set-row input')) setTimeout(() => t.select?.(), 0); });

// ================= Oppstart =================
async function seedIfEmpty() {
  if (await store.getKV('seeded')) return;
  if (S.templates.length) { await store.setKV('seeded', true); return; }
  try {
    const p = await (await fetch('programs/upper-lower-fettreduksjon.json')).json();
    await importProgram(p, { replacePlan: true });
    await store.setKV('seeded', true);
  } catch (e) { console.warn('Kunne ikke laste startprogram', e); }
}

(async function init() {
  try {
    await loadAll();
    await seedIfEmpty();
  } catch (e) {
    $('#main').innerHTML = `<div class="card"><b>Kunne ikke åpne lagringen</b><p class="muted">${esc(e.message)}</p></div>`;
    return;
  }
  document.body.insertAdjacentHTML('afterbegin', SPRITE);
  navigator.storage?.persist?.().catch(() => {});
  document.addEventListener('pointerdown', unlockAudio, { once: true });
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    // Når en ny versjon tar over: last siden på nytt én gang, så du ser oppdateringen med en gang.
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded && !S.active) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
  }
})();
