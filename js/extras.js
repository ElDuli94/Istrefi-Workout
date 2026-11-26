// Progresjonshint, daglig sjekkliste, streak/ukerapport, påminnelser og skivekalkulator.
import { S, sessionVolume, sessionSets } from './store.js';
import { esc, fmtNum, isoDate, fmtShort, weekStart } from './util.js';

const DAY = 864e5;
const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

// ---------- Progresjon (dobbel progresjon) ----------
function repRange(r) {
  const m = String(r || '').match(/(\d+)\s*[-–]\s*(\d+)/);
  if (m) return [+m[1], +m[2]];
  const n = String(r || '').match(/\d+/);
  return n ? [+n[0], +n[0]] : null;
}
// Klarte du toppen av rep-målet på alle arbeidssett med samme vekt sist? -> foreslå ny vekt.
export function progression(e, x, lp) {
  if (x.type !== 'w' || !lp) return null;
  const ws = lp.sets.filter((s) => !s.warmup && s.kg > 0 && s.reps != null);
  if (!ws.length) return null;
  const [low, top] = repRange(e.target?.reps) || [8, 12];
  const kg = Math.max(...ws.map((s) => s.kg));
  const atKg = ws.filter((s) => s.kg === kg);
  const need = e.target?.sets || ws.length;
  if (atKg.length < need || !atKg.every((s) => s.reps >= top)) return null;
  const step = ['db', 'kb'].includes(x.eq) ? 2 : 2.5;
  return { kg: Math.round((kg + step) * 100) / 100, from: kg, top, low, step };
}

// ---------- Daglig sjekkliste ----------
export const DAILY_FIELDS = [
  { f: 'kcal', label: 'Kalorier', unit: 'kcal', dir: 'max' },
  { f: 'protein', label: 'Protein', unit: 'g', dir: 'min' },
  { f: 'carbs', label: 'Karbo', unit: 'g', dir: 'max' },
  { f: 'fat', label: 'Fett', unit: 'g', dir: 'max' },
  { f: 'steps', label: 'Skritt', unit: '', dir: 'min' },
];
export function dailyClass(f, v) {
  const t = S.settings.targets?.[f];
  if (v == null || !t) return '';
  const dir = DAILY_FIELDS.find((d) => d.f === f).dir;
  return (dir === 'max' ? v <= t : v >= t) ? 'ok' : 'miss';
}
export function dailyInputs(date) {
  const d = S.daily[date] || {};
  return `<div class="daily-grid">${DAILY_FIELDS.map(({ f, label, unit }) => `<label>${label}${unit ? ` <small>${unit}</small>` : ''}
    <input class="${dailyClass(f, d[f])}" data-daily="${f}" data-date="${date}" inputmode="numeric"
      value="${d[f] != null ? fmtNum(d[f]) : ''}" placeholder="${S.settings.targets?.[f] ? fmtNum(S.settings.targets[f]) : '–'}"></label>`).join('')}</div>`;
}
export function dailyCard() {
  const date = isoDate();
  const has = DAILY_FIELDS.some(({ f }) => S.settings.targets?.[f]);
  return `<div class="card daily"><div class="row between"><div class="eyebrow">Dagens sjekkliste</div><a class="small muted" href="#/progress">Siste 7 dager ›</a></div>
    ${dailyInputs(date)}
    <button class="btn sm block mt-s" data-a="reportPaste">📋 Lim inn fra Claude</button>
    ${has ? '<p class="muted small m0 mt-s">Grå tall er målene dine. Grønn = nådd.</p>' : '<p class="muted small m0 mt-s">Sett målene dine under Innstillinger (tannhjulet).</p>'}</div>`;
}
const last7 = () => [...Array(7)].map((_, i) => isoDate(Date.now() - (6 - i) * DAY));
export function dailyWeekCard() {
  const days = last7();
  const val = (date, f) => S.daily[date]?.[f];
  const fmt = (f, v) => (v == null ? '–' : f === 'steps' ? Math.round(v).toLocaleString('nb-NO') : fmtNum(Math.round(v)));
  const rows = days.map((d) => `<tr data-a="dailyEdit" data-date="${d}"><td>${fmtShort(new Date(d + 'T12:00').getTime())}</td>${DAILY_FIELDS.map(({ f }) => `<td class="${dailyClass(f, val(d, f))}">${fmt(f, val(d, f))}</td>`).join('')}</tr>`).join('');
  const avgRow = DAILY_FIELDS.map(({ f }) => { const a = avg(days.map((d) => val(d, f)).filter((v) => v != null)); return `<td class="${dailyClass(f, a)}"><b>${fmt(f, a)}</b></td>`; }).join('');
  return `<div class="card"><div class="eyebrow">Kosthold og skritt – 7 dager</div>
    <table class="dtable"><thead><tr><th></th><th>kcal</th><th>Prot.</th><th>Karbo</th><th>Fett</th><th>Skritt</th></tr></thead>
    <tbody>${rows}</tbody><tfoot><tr><td>Snitt</td>${avgRow}</tr></tfoot></table>
    <p class="muted small m0">Trykk på en dag for å fylle inn eller rette.</p></div>`;
}

// ---------- Streak og ukerapport ----------
const plannedDays = () => S.plan.days.filter((d) => d.length).length;
const daysTrained = (a, b) => new Set(S.sessions.filter((s) => s.startedAt >= a && s.startedAt < b).map((s) => isoDate(s.startedAt))).size;
export function streak() {
  const need = plannedDays();
  if (!need) return 0;
  let ws = weekStart().getTime(), n = 0;
  if (daysTrained(ws, addDays(ws, 7)) >= need) n++;
  ws = addDays(ws, -7);
  while (n < 520 && daysTrained(ws, addDays(ws, 7)) >= need) { n++; ws = addDays(ws, -7); }
  return n;
}
function isoWeek(t) {
  const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - w1) / DAY - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
export function weekReport(off, { sessionItem, prList }) {
  const a = addDays(weekStart().getTime(), 7 * off), b = addDays(a, 7);
  const sess = S.sessions.filter((s) => s.startedAt >= a && s.startedAt < b);
  const need = plannedDays(), trained = daysTrained(a, b);
  const vol = sess.reduce((x, s) => x + sessionVolume(s), 0);
  const wIn = (x, y) => avg(S.body.filter((e) => e.weight != null && e.date >= x && e.date < y).map((e) => e.weight));
  const wNow = wIn(a, b), wPrev = wIn(addDays(a, -7), a);
  const days = [...Array(7)].map((_, i) => isoDate(addDays(a, i) + DAY / 2));
  const dAvg = (f) => avg(days.map((d) => S.daily[d]?.[f]).filter((v) => v != null));
  const logged = days.filter((d) => S.daily[d] && Object.values(S.daily[d]).some((v) => v != null)).length;
  const prs = sess.slice().reverse().flatMap(prList);
  const n1 = (v, dec = 0) => (v == null ? '–' : fmtNum(Math.round(v * 10 ** dec) / 10 ** dec));
  const tgt = S.settings.targets || {};
  const dl = (f, label, dec = 0) => `<div><b class="${dailyClass(f, dAvg(f))}">${n1(dAvg(f), dec)}</b><span>${label}</span>${tgt[f] ? `<small class="muted">mål ${fmtNum(tgt[f])}</small>` : ''}</div>`;
  const done = need && trained >= need;
  return `
    <div class="row between week-nav">
      <a class="icon-btn" href="#/week/${off - 1}" aria-label="Forrige uke">‹</a>
      <div class="center"><b>Uke ${isoWeek(a)}</b><div class="muted small">${fmtShort(a)} – ${fmtShort(b - DAY)}</div></div>
      ${off < 0 ? `<a class="icon-btn" href="#/week/${off + 1}" aria-label="Neste uke">›</a>` : '<span class="icon-btn"></span>'}
    </div>
    <div class="card hero ${done ? '' : 'rest'} center">
      <div class="eyebrow">${off === 0 ? 'Denne uka' : 'Oppsummering'}</div>
      <h2>${done ? 'Plan fullført 💪' : need ? `${trained} av ${need} treningsdager` : `${trained} treningsdager`}</h2>
      <p class="muted m0">🔥 ${streak()} uker på rad med fullført plan</p>
    </div>
    <div class="stats"><div><b>${sess.length}</b><span>økter</span></div><div><b>${sess.reduce((x, s) => x + sessionSets(s), 0)}</b><span>sett</span></div><div><b>${Math.round(vol)}</b><span>kg volum</span></div></div>
    <div class="card"><div class="eyebrow">Kroppsvekt</div>
      ${wNow != null ? `<div class="bigval">${n1(wNow, 1)} <small>kg snitt</small></div>${wPrev != null ? `<span class="delta ${wNow - wPrev <= 0 ? 'good' : ''}">${wNow - wPrev > 0 ? '+' : ''}${n1(wNow - wPrev, 1)} kg mot uka før</span>` : ''}` : '<p class="muted small m0">Ingen veiinger denne uka.</p>'}
    </div>
    <div class="card"><div class="eyebrow">Daglig snitt (${logged} av 7 dager logget)</div>
      <div class="stats in m0">${dl('kcal', 'kcal')}${dl('protein', 'g protein')}${dl('steps', 'skritt')}</div>
      <div class="stats two in m0 mt-s">${dl('carbs', 'g karbo')}${dl('fat', 'g fett')}</div>
    </div>
    ${prs.length ? `<div class="card prs"><b>🏆 Rekorder</b>${prs.map((p) => `<div>${esc(p)}</div>`).join('')}</div>` : ''}
    ${sess.length ? `<h3 class="sec">Økter</h3>${sess.map(sessionItem).join('')}` : ''}`;
}

// ---------- Påminnelse: bilde og midjemål ----------
export function reminderCard() {
  if ((S.settings.snoozeUntil || 0) > Date.now() || !S.sessions.length) return '';
  const lastPhoto = S.photos.at(-1)?.date || 0;
  const lastWaist = S.body.filter((b) => b.waist != null).at(-1)?.date || 0;
  const last = Math.min(lastPhoto, lastWaist);
  const days = last ? Math.floor((Date.now() - last) / DAY) : null;
  if (days != null && days < 14) return '';
  return `<div class="card remind"><div class="eyebrow">Påminnelse</div>
    <p class="m0">📸 Tid for progresjonsbilde og midjemål${days != null ? ` – det er ${days} dager siden sist` : ''}.</p>
    <div class="row gap mt"><button class="btn sm primary grow" data-a="photoSheet">Ta bilde</button><button class="btn sm grow" data-a="bodySheet">Logg mål</button><button class="btn sm ghost" data-a="snooze">Senere</button></div></div>`;
}

// ---------- Skivekalkulator ----------
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
export function platesFor(target, bar) {
  let per = (target - bar) / 2;
  if (!(per >= 0)) return null;
  const out = [];
  for (const p of PLATES) while (per >= p - 1e-9) { out.push(p); per -= p; }
  return { out, rest: Math.round(per * 2 * 100) / 100 };
}
export function platesHTML(target, bar) {
  if (!target) return '<p class="muted small">Skriv inn totalvekt.</p>';
  const r = platesFor(target, bar);
  if (!r) return `<p class="muted small">Totalvekten er lavere enn stanga (${fmtNum(bar)} kg).</p>`;
  if (!r.out.length) return '<p class="muted small">Bare stanga 👍</p>';
  return `<div class="plates">${r.out.map((p) => `<span class="plate p${String(p).replace('.', '_')}">${fmtNum(p)}</span>`).join('')}</div>
    <p class="m0"><b>På hver side:</b> ${r.out.map(fmtNum).join(' + ')} kg</p>
    ${r.rest ? `<p class="muted small">Går ikke helt opp – ${fmtNum(r.rest)} kg mangler med vanlige skiver.</p>` : ''}`;
}

// ---------- Kveldsrapport fra Claude ----------
// Én linje per dag: "ISTREFI dato=2026-11-25 kcal=1890 protein=172 karbo=160 fett=60 skritt=9512 vekt=84.2 midje=90"
const R_KEYS = { fettprosent: 'fatPct', kroppsfett: 'fatPct', muskel: 'muscle', muskelmasse: 'muscle', bmi: 'bmi', benmasse: 'bone', vann: 'water', kroppsvann: 'water', kcal: 'kcal', protein: 'protein', karbo: 'carbs', karbohydrater: 'carbs', fett: 'fat', skritt: 'steps', sovn: 'sleep', 'søvn': 'sleep', vekt: 'weight', midje: 'waist' };
export function parseReport(text) {
  const days = [];
  // Del ved hvert «ISTREFI» – linjeskift kan forsvinne når koden kopieres på iPhone.
  for (const line of String(text || '').split(/(?=istrefi)/i)) {
    if (!/istrefi/i.test(line)) continue;
    const d = line.match(/dato\s*=\s*(\d{4}-\d{2}-\d{2})/i);
    if (!d) continue;
    const day = { date: d[1] };
    for (const m of line.matchAll(/([a-zæøå]+)\s*=\s*(-?[\d.,]+)/gi)) {
      const key = R_KEYS[m[1].toLowerCase()]; if (!key) continue;
      const v = parseFloat(m[2].replace(',', '.'));
      if (Number.isFinite(v) && v > 0) day[key] = v;
    }
    if (Object.keys(day).length > 1) days.push(day);
  }
  return days;
}

// ---------- Kroppssammensetning (fra smartvekt) ----------
export const COMP = [
  { k: 'fatPct', label: 'Kroppsfett', unit: '%', dec: 1, goodDown: true },
  { k: 'muscle', label: 'Muskelmasse', unit: 'kg', dec: 1, goodDown: false },
  { k: 'bmi', label: 'BMI', unit: '', dec: 1, goodDown: true },
  { k: 'water', label: 'Kroppsvann', unit: '%', dec: 1, goodDown: false },
  { k: 'bone', label: 'Benmasse', unit: 'kg', dec: 1, goodDown: null },
];
export const COMP_KEYS = COMP.map((c) => c.k);
export function compCard(sel, lineChart) {
  const have = COMP.filter((c) => S.body.some((b) => b[c.k] != null));
  if (!have.length) return '';
  const cur = have.find((c) => c.k === sel) || have[0];
  const pts = S.body.filter((b) => b[cur.k] != null).map((b) => ({ x: b.date, y: b[cur.k] }));
  const first = pts[0].y, last = pts.at(-1).y, diff = last - first;
  const good = cur.goodDown == null || pts.length < 2 ? '' : (cur.goodDown ? diff <= 0 : diff >= 0) ? 'good' : '';
  const n = (v) => fmtNum(Math.round(v * 10) / 10);
  // Fettmasse og fettfri masse utledet fra siste veiing med vekt + fett%
  const lastFull = S.body.filter((b) => b.weight != null && b.fatPct != null).at(-1);
  const fatKg = lastFull ? (lastFull.weight * lastFull.fatPct) / 100 : null;
  return `<div class="card"><div class="row between"><div class="eyebrow">Kroppssammensetning</div>${pts.length > 1 ? `<span class="delta ${good}">${diff > 0 ? '+' : ''}${n(diff)}${cur.unit ? ' ' + cur.unit : ''}</span>` : ''}</div>
    <div class="chips">${have.map((c) => `<button class="chip sm ${c.k === cur.k ? 'on' : ''}" data-a="compSel" data-k="${c.k}">${c.label}</button>`).join('')}</div>
    <div class="bigval">${last.toFixed(cur.dec).replace('.', ',')} <small>${cur.unit}</small></div>
    ${lineChart(pts, { unit: cur.unit ? ' ' + cur.unit : '' })}
    ${fatKg != null ? `<div class="stats two in m0 mt"><div><b>${n(fatKg)}</b><span>kg fettmasse</span></div><div><b>${n(lastFull.weight - fatKg)}</b><span>kg fettfri masse</span></div></div>` : ''}
    <p class="muted small m0 mt-s">Smartvekter måler kroppsfett og muskler med strøm gjennom kroppen. Det svinger med væske, så se på trenden over uker, ikke dag til dag. Vei deg på samme tid hver morgen.</p>
  </div>`;
}
