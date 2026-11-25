// Muskelkart: SVG-figur (forfra/bakfra) der musklene som trenes fargelegges.
// Figuren tegnes én gang som "sprite"; hver visning bruker <use> og CSS-variabler (--m-<muskel>).

export const MUSCLES = {
  chest: 'Bryst', delt_front: 'Fremre skulder', delt_side: 'Sideskulder', delt_rear: 'Bakre skulder',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Underarmer', traps: 'Trapezius', upperback: 'Øvre rygg',
  lats: 'Latissimus', lowerback: 'Korsrygg', abs: 'Mage', obliques: 'Skrå mage', glutes: 'Sete',
  quads: 'Forside lår', hamstrings: 'Bakside lår', adductors: 'Innside lår', calves: 'Legger',
};
const FRONT_SET = new Set(['chest', 'delt_front', 'delt_side', 'biceps', 'forearms', 'abs', 'obliques', 'quads', 'adductors', 'calves', 'traps']);
const BACK_SET = new Set(['traps', 'delt_rear', 'delt_side', 'triceps', 'forearms', 'upperback', 'lats', 'lowerback', 'glutes', 'hamstrings', 'calves']);

// ---------- Figur (venstre halvdel, speiles) ----------
const m = (id, d) => `<path d="${d}" style="fill:var(--m-${id},var(--m-off));stroke:var(--m-gap);stroke-width:.8;stroke-linejoin:round"/>`;
const base = (d) => `<path d="${d}" style="fill:var(--m-base)"/>`;

const ARM_UPPER = 'M24,53 C26.5,52.5 29.5,51.5 32,51 C33,57 32.5,64 30.5,70.5 L24.5,70.5 C22.5,64 22.5,58 24,53 Z';
const FOREARM = 'M24.3,72.5 L30.7,72.5 C31,81 29.5,91 27,99 L21.5,98.5 C20.5,89 21.5,80 24.3,72.5 Z';
const DELT_SIDE = 'M29.5,37.5 C25.5,40 23.5,45 24,51.5 C26.5,51 29,50 32,49.5 C31,45 30.5,41 29.5,37.5 Z';
const JOINTS = base('M24,99.5 C27,100 28,104 27,108 C26,111 22,111 21,108 C20,104 21,100 24,99.5 Z')
  + base('M38,142.5 L44.5,142.5 C45.5,144.5 45.5,146.5 44.5,148 L38,148 C37,146.5 37,144.5 38,142.5 Z')
  + base('M38.5,184 L43,184 L44.5,193 C42,194 38,194 35.5,193 Z');

const FRONT_HALF = [
  m('traps', 'M44.5,29 C42,31.5 39,33 35.5,34.5 L45.5,34 Z'),
  m('delt_front', 'M35.5,34.5 C33,35 31,36 29.5,37.5 C30.5,41 31.5,45 32.5,49 C33.5,44 35.5,39.5 38.5,36 Z'),
  m('delt_side', DELT_SIDE),
  m('chest', 'M38.5,36 L49.5,35.5 L49.5,53 C45,56.5 38,56 33,50.5 C34.5,44.5 36,40 38.5,36 Z'),
  m('biceps', ARM_UPPER),
  m('forearms', FOREARM),
  m('obliques', 'M33.5,53 C37,56 40,57.5 42.5,58 C42,68 42.5,79 43.5,90 C40.5,89 38,87.5 36.5,85 C35.5,74 35,63 33.5,53 Z'),
  m('abs', 'M43.5,57.5 L49.5,57 L49.5,92 L44.5,91 C43.5,80 43,68 43.5,57.5 Z'),
  '<path d="M43.3,66.5 L49.5,66 M43.4,75.5 L49.5,75 M43.8,84 L49.5,83.5" style="fill:none;stroke:var(--m-gap);stroke-width:1"/>',
  m('quads', 'M36.5,90 C39.5,93 43,96 46,99 C46.5,113 45.5,128 44,141 L38,141.5 C35,129 34,110 36.5,90 Z'),
  m('adductors', 'M46.8,98.5 L49.5,100.5 L49.5,107 C48.5,117 47,127 45,136 C46,123 46.8,110 46.8,98.5 Z'),
  m('calves', 'M37.5,149.5 C40,148.5 42.5,148.5 44.5,150 C44.5,161 43.5,172 42.5,183 L39,183 C37,172 36.5,160 37.5,149.5 Z'),
  JOINTS,
].join('');

const BACK_HALF = [
  m('traps', 'M45,27.5 L50,27 L50,55 C47,50 44,45 41.5,40 C39.5,37.5 37.5,35.5 35.5,34.5 C39,33 42.5,31 45,27.5 Z'),
  m('delt_rear', 'M35.5,34.5 C33,35 31,36 29.5,37.5 C30.5,41 31.5,45 32.5,49 C34,45 36,41 38.5,38.5 Z'),
  m('delt_side', DELT_SIDE),
  m('upperback', 'M38.8,38.8 C39.8,39.3 40.8,39.8 41.3,40.3 C43.8,45 46.8,50 49.5,55.5 L49.5,57.5 C44.5,56.5 38.8,54 33.6,50.8 C34.6,46 36.6,42 38.8,38.8 Z'),
  m('lats', 'M33.6,52.5 C39,56 45,58.3 49.5,59.3 L49.5,70 C46,72.5 42,77.5 40,84 C37.5,74 35,62.5 33.6,52.5 Z'),
  m('lowerback', 'M44,73.5 C46,72 48,71 49.5,71 L49.5,90.5 L44.5,89.5 C43.5,84 43.5,78 44,73.5 Z'),
  m('triceps', ARM_UPPER),
  m('forearms', FOREARM),
  m('glutes', 'M37,88 C41,87 46,88.5 49.5,91 L49.5,108 C45,112 39,111.5 36,107 C35,100 35.5,94 37,88 Z'),
  m('hamstrings', 'M36.2,109.5 C40,113 45,113.5 48.5,112 C48,123 46.5,133 44.5,142 L38,142 C35.5,132 35,120 36.2,109.5 Z'),
  m('calves', 'M37,149.5 C40,146.8 43.5,146.8 45.5,149.5 C46,158 44.5,168 42.5,181 L39,181 C36.5,170 35.5,158 37,149.5 Z'),
  JOINTS,
].join('');

const SILHOUETTE = 'M50,26 L45,26 L44,30.5 C38,32 31,33.5 27,37 C22.5,41 22,48 22.5,55 C21,63 21,70 22,74 C19.5,84 19.5,94 20,100 L28.5,100 C30.5,92 31.5,82 31.5,74 C32.5,66 33,60 33.5,57 C34,67 34.5,79 36,90 C33.5,106 33.5,126 36.5,143 C35.5,150 35,160 36.5,170 C37,177 37.5,183 38,186 L44,186 C44.5,175 46,163 45.5,152 L45.5,146 C47.5,132 49,118 49.6,104 L50,104 Z';
const HEAD = '<path d="M45.2,21 L54.8,21 L55.6,30 L44.4,30 Z" style="fill:var(--m-base)"/><ellipse cx="50" cy="15" rx="8.5" ry="10.5" style="fill:var(--m-base)"/>';
const fig = (half) => `<path d="${SILHOUETTE}" style="fill:var(--m-sil)"/><g>${half}</g><g transform="matrix(-1 0 0 1 100 0)"><path d="${SILHOUETTE}" style="fill:var(--m-sil)"/>${half}</g>${HEAD}`;

export const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="body-front" viewBox="16 2 68 194">${fig(FRONT_HALF)}</symbol>
  <symbol id="body-back" viewBox="16 2 68 194">${fig(BACK_HALF)}</symbol>
</svg>`;

// ---------- Kobling øvelse -> muskler ----------
// [gruppe|null, regex på navn, primær, sekundær]. Første treff vinner.
const R = [
  // Bryst
  ['bryst', /pullover/i, 'chest lats', 'triceps'],
  ['bryst', /fly|crossover|pec deck|squeeze|svend|plate press/i, 'chest', 'delt_front'],
  ['bryst', /dip/i, 'chest triceps', 'delt_front'],
  ['bryst', /incline|low-to-high/i, 'chest delt_front', 'triceps'],
  ['bryst', /./, 'chest', 'delt_front triceps'],
  // Rygg
  ['rygg', /trap bar deadlift/i, 'quads glutes hamstrings', 'lowerback traps forearms'],
  ['rygg', /deadlift|rack pull/i, 'glutes hamstrings lowerback', 'traps quads forearms lats'],
  ['rygg', /shrug/i, 'traps', 'forearms'],
  ['rygg', /chin-up/i, 'lats biceps', 'upperback forearms'],
  ['rygg', /pull-up|pulldown|muscle-up/i, 'lats', 'biceps upperback forearms'],
  ['rygg', /straight-arm|pullover/i, 'lats', 'triceps'],
  ['rygg', /extension|hyper|superman|jefferson/i, 'lowerback', 'glutes hamstrings'],
  ['rygg', /row/i, 'upperback lats', 'biceps delt_rear forearms'],
  ['rygg', /./, 'lats upperback', 'biceps'],
  // Skuldre
  ['skuldre', /rear delt|reverse pec|face pull|pull-apart|y-t-w|external rotation|cuban|dislocates/i, 'delt_rear', 'upperback traps'],
  ['skuldre', /upright/i, 'delt_side traps', 'biceps'],
  ['skuldre', /lateral|y-raise|lu raise/i, 'delt_side', 'traps'],
  ['skuldre', /front raise/i, 'delt_front', 'delt_side'],
  ['skuldre', /halo/i, 'delt_front delt_side', 'traps'],
  ['skuldre', /handstand hold|wall walk/i, 'delt_front', 'triceps abs traps'],
  ['skuldre', /./, 'delt_front', 'delt_side triceps traps'],
  // Armer
  ['biceps', /hammer|zottman|reverse/i, 'biceps forearms', ''],
  ['biceps', /chin-up/i, 'biceps lats', 'forearms'],
  ['biceps', /./, 'biceps', 'forearms'],
  ['triceps', /close-grip|jm press|dip|push-up|press/i, 'triceps', 'chest delt_front'],
  ['triceps', /./, 'triceps', ''],
  ['underarmer', /hang/i, 'forearms', 'lats'],
  ['underarmer', /reverse curl/i, 'forearms biceps', ''],
  ['underarmer', /./, 'forearms', ''],
  // Lår forside
  ['quads', /extension|sissy|spanish|wall sit/i, 'quads', ''],
  ['quads', /cossack|lateral lunge|curtsy/i, 'quads adductors glutes', ''],
  ['quads', /jump/i, 'quads glutes', 'calves hamstrings'],
  ['quads', /lunge|split|step-up|pistol/i, 'quads glutes', 'adductors hamstrings'],
  ['quads', /front squat|zercher|goblet|overhead squat/i, 'quads glutes', 'abs adductors upperback'],
  ['quads', /leg press|hack|pendulum|belt|v-squat/i, 'quads glutes', 'adductors'],
  ['quads', /./, 'quads glutes', 'adductors lowerback hamstrings'],
  // Lår bakside
  ['hamstrings', /curl|nordic|glute-ham/i, 'hamstrings', 'calves'],
  ['hamstrings', /./, 'hamstrings glutes', 'lowerback forearms'],
  // Sete
  ['sete', /adduction|copenhagen/i, 'adductors', 'obliques'],
  ['sete', /abduction|lateral walk|clamshell|fire hydrant/i, 'glutes', ''],
  ['sete', /sumo/i, 'glutes adductors quads', 'hamstrings'],
  ['sete', /step-down|lunge/i, 'quads glutes', 'hamstrings'],
  ['sete', /./, 'glutes', 'hamstrings'],
  ['legger', /./, 'calves', ''],
  // Core
  ['core', /side plank|oblique|russian|woodchopper|pallof|side bend|suitcase|windshield|rotation|bicycle/i, 'obliques', 'abs'],
  ['core', /bird dog|superman/i, 'lowerback abs', 'glutes'],
  ['core', /mountain/i, 'abs', 'delt_front quads obliques'],
  ['core', /plank|dead bug|hollow|wheel|body saw|stir/i, 'abs', 'obliques delt_front'],
  ['core', /./, 'abs', 'obliques'],
  // Helkropp
  ['helkropp', /clean|snatch|jerk/i, 'quads glutes hamstrings traps', 'delt_front upperback lowerback calves'],
  ['helkropp', /thruster|wall ball|man maker|devil/i, 'quads glutes delt_front', 'triceps abs'],
  ['helkropp', /swing/i, 'glutes hamstrings', 'lowerback delt_front abs'],
  ['helkropp', /get-up/i, 'delt_front abs obliques', 'glutes quads triceps'],
  ['helkropp', /overhead carry/i, 'delt_front delt_side traps', 'abs obliques'],
  ['helkropp', /carry/i, 'forearms traps', 'abs obliques glutes'],
  ['helkropp', /sled push/i, 'quads glutes', 'calves delt_front'],
  ['helkropp', /sled pull/i, 'hamstrings glutes upperback', 'biceps'],
  ['helkropp', /tire/i, 'glutes hamstrings quads lowerback', 'chest delt_front'],
  ['helkropp', /burpee/i, 'chest quads delt_front', 'abs triceps'],
  ['helkropp', /battle/i, 'delt_front delt_side', 'forearms abs'],
  ['helkropp', /slam/i, 'lats abs', 'delt_front'],
  ['helkropp', /./, 'delt_front abs quads', 'glutes'],
  // Kondisjon
  ['kondisjon', /row/i, 'lats upperback quads', 'biceps glutes hamstrings'],
  ['kondisjon', /ski/i, 'lats abs', 'triceps quads'],
  ['kondisjon', /swim/i, 'lats delt_front', 'chest triceps'],
  ['kondisjon', /jump rope/i, 'calves', 'quads delt_side'],
  ['kondisjon', /bike|cycling/i, 'quads glutes', 'hamstrings calves'],
  ['kondisjon', /./, 'quads hamstrings glutes calves', ''],
  // Mobilitet
  ['mobilitet', /hip flexor|couch/i, 'quads', ''],
  ['mobilitet', /90-90|pigeon/i, 'glutes', ''],
  ['mobilitet', /hamstring/i, 'hamstrings', ''],
  ['mobilitet', /chest/i, 'chest', 'delt_front'],
  ['mobilitet', /thoracic|cat-cow/i, 'upperback lowerback', ''],
  ['mobilitet', /squat/i, 'adductors glutes', 'quads'],
  ['mobilitet', /ankle/i, 'calves', ''],
  ['mobilitet', /./, 'quads glutes hamstrings', 'lowerback'],
];
const split = (s) => (s ? s.split(/\s+/).filter(Boolean) : []);

// Manuelle korreksjoner per øvelse (gjennomgått én og én). Format: 'primær | sekundær'.
const OVERRIDES = {
  'incline-push-up': 'chest | delt_front triceps',
  'floor-press': 'chest triceps | delt_front',
  'dumbbell-floor-press': 'chest triceps | delt_front',
  'kettlebell-floor-press': 'chest triceps | delt_front',
  'sumo-deadlift': 'glutes quads adductors hamstrings | lowerback traps forearms',
  'rack-pull': 'lowerback traps glutes | hamstrings forearms upperback',
  'snatch-grip-deadlift': 'glutes hamstrings lowerback | traps upperback quads forearms',
  'barbell-row': 'upperback lats | biceps delt_rear lowerback forearms',
  'pendlay-row': 'upperback lats | biceps delt_rear lowerback forearms',
  'yates-row': 'upperback lats | biceps delt_rear lowerback forearms',
  't-bar-row': 'upperback lats | biceps delt_rear lowerback forearms',
  'landmine-row': 'upperback lats | biceps delt_rear lowerback forearms',
  'renegade-row': 'upperback lats | biceps abs obliques delt_front',
  'scapular-pull-up': 'upperback lats | traps',
  'muscle-up': 'lats chest triceps | biceps delt_front abs',
  'straight-arm-pulldown': 'lats | triceps abs',
  'band-straight-arm-pulldown': 'lats | triceps abs',
  'back-extension': 'lowerback glutes | hamstrings',
  'weighted-back-extension': 'lowerback glutes | hamstrings',
  'reverse-hyperextension': 'glutes hamstrings lowerback | ',
  'superman': 'lowerback glutes | hamstrings upperback',
  'jefferson-curl': 'hamstrings lowerback | glutes',
  '45-degree-hip-extension': 'glutes | hamstrings lowerback',
  'overhead-press': 'delt_front | delt_side triceps traps abs',
  'push-press': 'delt_front triceps | delt_side traps quads glutes',
  'z-press': 'delt_front | delt_side triceps abs',
  'landmine-press': 'delt_front chest | triceps delt_side',
  'half-kneeling-landmine-press': 'delt_front chest | triceps obliques abs',
  'arnold-press': 'delt_front delt_side | triceps',
  'incline-y-raise': 'delt_side traps | delt_rear upperback',
  'cable-y-raise': 'delt_side traps | delt_rear upperback',
  'pike-push-up': 'delt_front triceps | delt_side chest traps',
  'handstand-push-up': 'delt_front triceps | delt_side traps chest',
  'band-dislocates': 'delt_front delt_rear | chest upperback',
  'kettlebell-bottoms-up-press': 'delt_front | triceps forearms delt_side',
  'cuban-press': 'delt_rear delt_side | upperback traps',
  'lu-raise': 'delt_side delt_front | traps',
  'tate-press': 'triceps | ',
  'bench-dip': 'triceps | delt_front',
  'dead-hang': 'forearms lats | upperback',
  'overhead-squat': 'quads glutes | delt_front delt_side traps abs upperback',
  'bodyweight-squat': 'quads glutes | adductors hamstrings',
  'band-squat': 'quads glutes | adductors hamstrings',
  'wall-sit': 'quads | glutes',
  'curtsy-lunge': 'glutes quads | adductors',
  'good-morning': 'hamstrings lowerback glutes | ',
  'seated-good-morning': 'lowerback hamstrings | glutes',
  'glute-ham-raise': 'hamstrings | glutes calves',
  'stability-ball-leg-curl': 'hamstrings | glutes abs',
  'sliding-leg-curl': 'hamstrings | glutes abs',
  'hip-adduction-machine': 'adductors | ',
  'cable-hip-adduction': 'adductors | ',
  'copenhagen-plank': 'adductors obliques | abs',
  'reverse-lunge-to-knee-drive': 'quads glutes | hamstrings abs',
  'hanging-leg-raise': 'abs | obliques forearms lats',
  'hanging-knee-raise': 'abs | obliques forearms',
  'toes-to-bar': 'abs | lats obliques forearms',
  'l-sit': 'abs quads | triceps obliques',
  'dragon-flag': 'abs | obliques lats',
  'ab-wheel-rollout': 'abs | lats obliques delt_front',
  'suitcase-carry': 'obliques forearms | abs traps',
  'windshield-wiper': 'obliques abs | ',
  'snatch': 'quads glutes hamstrings traps | delt_front delt_side upperback lowerback',
  'hang-snatch': 'glutes hamstrings traps | quads delt_front delt_side upperback',
  'clean-and-jerk': 'quads glutes hamstrings traps delt_front | triceps upperback lowerback calves',
  'clean-pull': 'glutes hamstrings quads traps | lowerback upperback calves forearms',
  'dumbbell-clean-and-press': 'quads glutes delt_front | triceps traps hamstrings',
  'kettlebell-clean-and-press': 'glutes hamstrings delt_front | triceps traps forearms',
  'dumbbell-snatch': 'glutes hamstrings delt_front traps | quads delt_side lowerback',
  'kettlebell-snatch': 'glutes hamstrings delt_front traps | forearms delt_side lowerback',
  'kettlebell-clean': 'glutes hamstrings traps | forearms lowerback quads',
  'man-maker': 'chest delt_front quads glutes | upperback triceps abs',
  'devil-press': 'chest delt_front glutes hamstrings | triceps quads abs',
  'walking': 'quads glutes calves | hamstrings',
  'incline-treadmill-walk': 'glutes calves hamstrings | quads',
  'stair-climber': 'quads glutes | calves hamstrings',
  'assault-bike': 'quads glutes | hamstrings delt_front chest triceps biceps',
  'elliptical': 'quads glutes hamstrings | calves',
  'hiit-intervals': 'quads glutes | hamstrings calves abs delt_front',
  'swimming': 'lats delt_front | chest triceps upperback abs',
  'skierg': 'lats triceps abs | delt_rear quads glutes',
  'worlds-greatest-stretch': 'quads hamstrings upperback | glutes adductors',
  'thoracic-rotation': 'upperback | obliques',
  'cat-cow': 'lowerback upperback | abs',
};
const parse = (str) => { const [p, s = ''] = str.split('|'); const pr = split(p.trim()); return { primary: pr, secondary: split(s.trim()).filter((k) => !pr.includes(k)) }; };

export function musclesFor(x) {
  if (x.muscles) return x.muscles;
  if (OVERRIDES[x.id]) return parse(OVERRIDES[x.id]);
  for (const [g, re, p, s] of R) {
    if (g && g !== x.group) continue;
    if (re.test(x.name)) { const pr = split(p); return { primary: pr, secondary: split(s).filter((k) => !pr.includes(k)) }; }
  }
  return { primary: [], secondary: [] };
}

function vars(mu) {
  return [...mu.secondary.map((k) => `--m-${k}:var(--m-sec)`), ...mu.primary.map((k) => `--m-${k}:var(--m-pri)`)].join(';');
}
const score = (mu, set) => mu.primary.filter((k) => set.has(k)).length * 2 + mu.secondary.filter((k) => set.has(k)).length;

// Liten figur (den siden flest muskler vises på)
export function bodyMini(x) {
  const mu = musclesFor(x);
  const side = score(mu, BACK_SET) > score(mu, FRONT_SET) ? 'back' : 'front';
  return `<svg class="body mini" viewBox="0 0 68 194" style="${vars(mu)}" aria-hidden="true"><use href="#body-${side}" width="68" height="194"/></svg>`;
}

// Stor figur forfra + bakfra med forklaring
export function bodyMap(x) {
  const mu = musclesFor(x);
  const names = (arr) => arr.map((k) => MUSCLES[k]).join(', ');
  return `<div class="bodymap" style="${vars(mu)}">
    <div class="bm-figs">
      <figure><svg class="body" viewBox="0 0 68 194"><use href="#body-front" width="68" height="194"/></svg><figcaption>Forfra</figcaption></figure>
      <figure><svg class="body" viewBox="0 0 68 194"><use href="#body-back" width="68" height="194"/></svg><figcaption>Bakfra</figcaption></figure>
    </div>
    <div class="bm-legend">
      ${mu.primary.length ? `<div><i class="pri"></i><span><b>Hovedmuskler</b>${names(mu.primary)}</span></div>` : ''}
      ${mu.secondary.length ? `<div><i class="sec"></i><span><b>Hjelpemuskler</b>${names(mu.secondary)}</span></div>` : ''}
    </div>
  </div>`;
}
