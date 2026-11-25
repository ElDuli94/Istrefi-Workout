# Istrefi Workout 🏋️

Personlig treningsapp som kjører i nettleseren og legges på hjemskjermen på iPhone.
**All data lagres kun lokalt på telefonen** (IndexedDB) – ingenting sendes til noen server.

## Funksjoner

- **Ukesplan** – hvilke økter som skal gjøres hvilken dag, med ✓ når dagen er gjennomført.
- **Øktmaler** – bygg egne økter med sett, reps, RPE, hviletid og notater per øvelse.
- **Logging** – kg, reps og RPE per sett. Forrige økts tall vises som forslag; trykk ✓ for å gjenta dem.
  Trykk på settnummeret for å merke et sett som oppvarming.
- **Hviletimer** – starter automatisk når du huker av et sett (±15 s, lyd når ferdig).
- **Bibliotek med 445 øvelser** – søk og filtrer på muskelgruppe og utstyr (stang, manualer, kabel, maskin,
  kroppsvekt, kettlebell, strikk …). Lag egne øvelser ved behov.
- **Historikk og rekorder** – estimert 1RM-graf per øvelse, 🏆 nye rekorder etter hver økt.
- **Progresjonshint** – «⬆️ Øk vekten» når du klarte toppen av rep-målet på alle sett sist, med ny vekt ferdig utfylt.
- **Daglig sjekkliste** – kalorier, protein, skritt og søvn mot egne mål (kun lokalt), med 7-dagersoversikt.
  Kan fylles ut automatisk fra Apple Helse (MyFitnessPal/Garmin) via en snarvei – oppskrift i appen under «Oppsett».
- **Streak og ukerapport** – uker på rad med fullført plan, ukeoppsummering av trening, vekt og kosthold.
- **Påminnelse** om progresjonsbilde og midjemål hver 2. uke, og **skivekalkulator** for stangøvelser.
- **Muskelkart** – fargelagt figur forfra/bakfra for alle øvelser.
- **Kroppsvekt og midjemål** med grafer.
- **Progresjonsbilder** – kategorier front/side/rygg, sammenligning med glidebryter eller overtoning.
- **Claude som PT** – eksporter treningsloggen som tekst til Claude, og importer programmene Claude lager.
- **Backup** – eksporter/gjenopprett alt (inkl. bilder) som én fil, f.eks. til iCloud Drive.
- Fungerer **offline** på treningssenteret.

## Kom i gang (GitHub Pages)

1. Merge denne branchen til `main`.
2. På GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   velg `main` og `/ (root)`, trykk **Save**. (For gratis-kontoer må repoet være offentlig for å bruke Pages.
   Kun koden ligger i repoet – dine treningsdata og bilder ligger aldri der.)
3. Etter et minutt er appen på `https://<brukernavn>.github.io/Istrefi-Workout/`.
4. Åpne adressen i **Safari** på iPhone → Del-knappen → **Legg til på Hjem-skjerm**.
5. Åpne appen **fra hjemskjermen** og bruk den derfra. (Safari og hjemskjerm-appen har separat lagring.)

## Bruke Claude som personlig trener

**Fra appen til Claude:** Innstillinger (tannhjulet) → *Send loggen til Claude* → **Kopier treningslogg**,
og lim inn i chatten. Be om f.eks. «neste ukes program basert på loggen min».

**Fra Claude til appen:**
- *Lim inn:* Claude gir deg en JSON-blokk → Innstillinger → *Importer program fra Claude* → lim inn → Importer.
- *Via repoet:* Claude legger programmet i `programs/` (og i `programs/index.json`). I appen:
  Innstillinger → **Hent programmer fra GitHub-repoet** → Importer.

Formatet er beskrevet i [`CLAUDE.md`](CLAUDE.md).

## Viktig om lagring på iPhone

- Data ligger i appens lagring på telefonen. Sletter du appen fra hjemskjermen, eller tømmer nettstedsdata i Safari-innstillingene, **forsvinner dataene**.
- Ta derfor **backup** jevnlig: Innstillinger → Eksporter backup → «Arkiver i Filer».
- Lyd fra hviletimeren følger lydløs-bryteren på iPhone.

## Utvikling

Ren HTML/CSS/JavaScript uten byggesteg. Kjør lokalt med f.eks. `python3 -m http.server` og åpne `http://localhost:8000`.

- `js/exercises.js` – øvelsesbiblioteket
- `js/app.js` – visninger og handlinger
- `js/store.js`, `js/db.js` – lagring (IndexedDB)
- `js/data.js` – import/eksport/backup
- `programs/` – treningsprogrammer (JSON)
- `tools/check-programs.mjs` – validerer programmene (`node tools/check-programs.mjs`)

Ved endringer i app-filene: øk `VERSION` i `sw.js` så telefonen henter den nye versjonen.
