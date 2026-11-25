# Istrefi Workout – notater for Claude

Statisk PWA (vanilla JS, ingen build) hostet på GitHub Pages. Brukerdata ligger KUN i IndexedDB på brukerens
iPhone – aldri i repoet. UI-språk: norsk bokmål. Enheter: kg, cm.

## Rollen som personlig trener

Brukeren vil bruke Claude som PT som lager ukesprogrammer. Kontekst (fra oppstart, nov 2026):
- Mål: fettreduksjon / definisjon.
- Oppsett: Startet med 4 dager/uke overkropp/underkropp. Byttet 25.11.2026 til brukerens foretrukne «Korte økter – 5 dager»
  (30 min, 2–3 øvelser per dag, man–fre + gåtur lør, hvile søn). Liker korte, raske økter. Nybegynner.
  Alternativ ved lite tid: «Korte økter – 3 dager».
- Utstyr: fullt treningssenter, men også hjemme (manualer/strikk) og kroppsvekt.
- Logger kg, reps og RPE per sett. Kosthold logges i MyFitnessPal; brukeren skriver ev. kalorier/protein/skritt
  inn i appens sjekkliste selv eller oppgir dem direkte i chatten (ingen automatisk Helse-kobling – valgt bort).

Brukeren limer inn en tekst-eksport av loggen (fra appen) i chatten. Bruk den til å vurdere progresjon
(e1RM, volum, RPE-trend, kroppsvekt) før du lager neste program.

## Levere et program

Enten (a) gi JSON i chatten som brukeren limer inn under Innstillinger → Importer, eller
(b) legg en fil i `programs/<navn>.json`, legg den til i `programs/index.json`, kjør
`node tools/check-programs.mjs` og commit/push. Brukeren henter den via «Hent programmer fra GitHub-repoet».
Ved (b): Pages bygger fra `main`, så filen må til `main` for at appen skal se den.

### Format `istrefi-program/1`

```json
{
  "format": "istrefi-program/1",
  "name": "Upper/Lower – blokk 2",
  "description": "Kort beskrivelse (vises i planen)",
  "weeks": 4,
  "notes": "Coaching-notater. Vises på forsiden. \\n gir linjeskift.",
  "workouts": [
    {
      "key": "upperA",
      "name": "Overkropp A",
      "notes": "Valgfritt",
      "exercises": [
        { "id": "barbell-bench-press", "sets": 4, "reps": "6-8", "rpe": "8", "rest": 150, "notes": "valgfritt" },
        { "name": "Helt Ny Øvelse", "group": "bryst", "equipment": "mc", "type": "w", "sets": 3, "reps": "10-12" }
      ]
    }
  ],
  "schedule": { "mon": ["upperA"], "tue": ["lowerA"], "thu": ["upperB"], "fri": ["lowerB"] }
}
```

- `id` må finnes i `js/exercises.js` (ID = slug av navnet). List alle: `node tools/check-programs.mjs --list`.
- Ukjent øvelse: bruk `name` (+ valgfritt `group`, `equipment`, `type`) – appen lager den som egen øvelse.
- `type`: `w` vekt×reps, `b` kroppsvekt(+kg)×reps, `t` tid (sek), `c` kondisjon (min/km).
- `group`: bryst, rygg, skuldre, biceps, triceps, underarmer, quads, hamstrings, sete, legger, core, helkropp, kondisjon, mobilitet.
- `equipment`: bb, db, cb, mc, bw, kb, bd, sm, ez, tb, ot.
- `schedule`-nøkler: mon…sun (eller man/tir/ons/tor/fre/lør/søn), verdier er `key` fra workouts.
- `reps` og `rpe` er fritekst ("8-10", "AMRAP", "12-15 min").
- Import erstatter ukesplanen og fjerner som standard øktmalene fra forrige importerte program (logg beholdes).

## Kodenotater

- Ikke endre navn på eksisterende øvelser i `js/exercises.js` – ID-ene brukes i logg og programmer. Legg til nye linjer i stedet.
- Muskelkart: `js/muscles.js`. Regler per gruppe/navn gir standard; `OVERRIDES` (per øvelses-ID) har forrang. Rett feil der.
- Øk `VERSION` i `sw.js` ved endringer i app-filer (ellers får telefonen gammel cache). Nye JS-filer må inn i `SHELL`.
