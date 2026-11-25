// Sjekker at alle programmer i programs/ er gyldige og bruker eksisterende øvelses-ID-er.
// Kjør: node tools/check-programs.mjs   (eller: node tools/check-programs.mjs --list  for å liste alle ID-er)
import { readFileSync, readdirSync } from 'node:fs';
import { EXERCISES } from '../js/exercises.js';

const ids = new Set(EXERCISES.map((e) => e.id));
if (process.argv.includes('--list')) {
  for (const e of EXERCISES) console.log(`${e.id}\t${e.group}\t${e.eq}\t${e.type}`);
  process.exit(0);
}
let bad = 0;
const index = JSON.parse(readFileSync('programs/index.json', 'utf8'));
for (const f of readdirSync('programs').filter((f) => f.endsWith('.json') && f !== 'index.json')) {
  const p = JSON.parse(readFileSync('programs/' + f, 'utf8'));
  if (!index.some((i) => i.file === f)) { console.log(`! ${f} mangler i programs/index.json`); bad++; }
  const keys = new Set(p.workouts.map((w) => w.key));
  for (const w of p.workouts) for (const e of w.exercises) {
    if (!ids.has(e.id) && !e.name) { console.log(`✗ ${f} / ${w.name}: ukjent øvelse "${e.id}" (legg til "name" for å lage egen øvelse)`); bad++; }
  }
  for (const [d, arr] of Object.entries(p.schedule || {})) for (const k of [].concat(arr)) if (!keys.has(k)) { console.log(`✗ ${f}: schedule.${d} peker på ukjent økt "${k}"`); bad++; }
  console.log(`✓ ${f}: ${p.workouts.length} økter`);
}
console.log(`${EXERCISES.length} øvelser i biblioteket.`);
process.exit(bad ? 1 : 0);
