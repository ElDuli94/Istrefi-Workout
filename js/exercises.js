// Øvelsesbibliotek.
// Format per linje: "Navn|utstyr|flagg"
//   utstyr: bb=stang, db=manualer, cb=kabel, mc=maskin, bw=kroppsvekt, kb=kettlebell,
//           bd=strikk, sm=smith, ez=EZ-stang, tb=trap bar, ot=annet
//   flagg (valgfritt): w=vekt×reps, b=kroppsvekt (+kg)×reps, t=tid (sek), c=kondisjon (min/km)
// ID = slug av navnet (f.eks. "Barbell Bench Press" -> "barbell-bench-press").
// IKKE endre navn på eksisterende øvelser – ID-en brukes i logg og programmer.

export const GROUPS = {
  bryst: 'Bryst', rygg: 'Rygg', skuldre: 'Skuldre', biceps: 'Biceps', triceps: 'Triceps',
  underarmer: 'Underarmer', quads: 'Lår (forside)', hamstrings: 'Lår (bakside)',
  sete: 'Sete & hofte', legger: 'Legger', core: 'Mage & core', helkropp: 'Helkropp',
  kondisjon: 'Kondisjon', mobilitet: 'Mobilitet', annet: 'Annet',
};

export const EQUIP = {
  bb: 'Stang', db: 'Manualer', cb: 'Kabel', mc: 'Maskin', bw: 'Kroppsvekt', kb: 'Kettlebell',
  bd: 'Strikk', sm: 'Smith', ez: 'EZ-stang', tb: 'Trap bar', ot: 'Annet',
};

export const TYPES = { w: 'Vekt × reps', b: 'Kroppsvekt × reps', t: 'Tid', c: 'Kondisjon' };

const RAW = {
bryst: `Barbell Bench Press|bb
Incline Barbell Bench Press|bb
Decline Barbell Bench Press|bb
Paused Bench Press|bb
Spoto Press|bb
Floor Press|bb
Wide-Grip Bench Press|bb
Dumbbell Bench Press|db
Incline Dumbbell Press|db
Low-Incline Dumbbell Press|db
Decline Dumbbell Press|db
Neutral-Grip Dumbbell Press|db
Dumbbell Floor Press|db
Single-Arm Dumbbell Bench Press|db
Dumbbell Squeeze Press|db
Dumbbell Fly|db
Incline Dumbbell Fly|db
Decline Dumbbell Fly|db
Dumbbell Pullover|db
Smith Machine Bench Press|sm
Smith Machine Incline Press|sm
Smith Machine Decline Press|sm
Machine Chest Press|mc
Incline Machine Press|mc
Decline Machine Press|mc
Hammer Strength Chest Press|mc
Pec Deck|mc
Cable Crossover|cb
High-to-Low Cable Fly|cb
Low-to-High Cable Fly|cb
Single-Arm Cable Fly|cb
Seated Cable Fly|cb
Cable Chest Press|cb
Single-Arm Cable Chest Press|cb
Push-Up|bw
Incline Push-Up|bw
Decline Push-Up|bw
Wide Push-Up|bw
Archer Push-Up|bw
Deficit Push-Up|bw
Weighted Push-Up|bw
Clap Push-Up|bw
Ring Push-Up|bw
Knee Push-Up|bw
Chest Dip|bw
Weighted Chest Dip|bw
Ring Dip|bw
Band Chest Press|bd
Band Chest Fly|bd
Band-Resisted Push-Up|bd|b
Kettlebell Floor Press|kb
Svend Press|ot
Plate Press|ot`,

rygg: `Deadlift|bb
Sumo Deadlift|bb
Deficit Deadlift|bb
Paused Deadlift|bb
Rack Pull|bb
Trap Bar Deadlift|tb
Snatch-Grip Deadlift|bb
Barbell Row|bb
Pendlay Row|bb
Yates Row|bb
Seal Row|bb
T-Bar Row|bb
Landmine Row|bb
Meadows Row|bb
One-Arm Dumbbell Row|db
Chest-Supported Dumbbell Row|db
Kroc Row|db
Renegade Row|db
Dumbbell Seal Row|db
Barbell Shrug|bb
Dumbbell Shrug|db
Cable Shrug|cb
Trap Bar Shrug|tb
Smith Machine Shrug|sm
Pull-Up|bw
Chin-Up|bw
Neutral-Grip Pull-Up|bw
Wide-Grip Pull-Up|bw
Weighted Pull-Up|bw
Weighted Chin-Up|bw
Assisted Pull-Up Machine|mc
Band-Assisted Pull-Up|bd|b
Negative Pull-Up|bw
Scapular Pull-Up|bw
Inverted Row|bw
Ring Row|bw
Muscle-Up|bw
Lat Pulldown|cb
Close-Grip Lat Pulldown|cb
Neutral-Grip Lat Pulldown|cb
Underhand Lat Pulldown|cb
Wide-Grip Lat Pulldown|cb
Single-Arm Lat Pulldown|cb
Kneeling Single-Arm Lat Pulldown|cb
Straight-Arm Pulldown|cb
Cable Pullover|cb
Seated Cable Row|cb
Wide-Grip Seated Cable Row|cb
Single-Arm Cable Row|cb
Face-Away Cable Row|cb
Machine Row|mc
Chest-Supported Machine Row|mc
Hammer Strength Row|mc
High Row Machine|mc
Low Row Machine|mc
Machine Pullover|mc
Machine Lat Pulldown|mc
Smith Machine Row|sm
Back Extension|bw
Weighted Back Extension|ot|w
Reverse Hyperextension|mc
Superman|bw
Jefferson Curl|bb
Band Row|bd
Band Lat Pulldown|bd
Band Straight-Arm Pulldown|bd
Kettlebell Row|kb
Kettlebell Gorilla Row|kb
Reverse Snow Angel|bw`,

skuldre: `Overhead Press|bb
Push Press|bb
Seated Barbell Shoulder Press|bb
Behind-the-Neck Press|bb
Z Press|bb
Landmine Press|bb
Half-Kneeling Landmine Press|bb
Bradford Press|bb
Dumbbell Shoulder Press|db
Seated Dumbbell Shoulder Press|db
Arnold Press|db
Single-Arm Dumbbell Press|db
Dumbbell Lateral Raise|db
Seated Lateral Raise|db
Lean-Away Dumbbell Lateral Raise|db
Incline Y-Raise|db
Dumbbell Front Raise|db
Plate Front Raise|ot|w
Barbell Front Raise|bb
Cable Front Raise|cb
Rear Delt Fly|db
Incline Rear Delt Fly|db
Reverse Pec Deck|mc
Cable Rear Delt Fly|cb
Face Pull|cb
Cable Lateral Raise|cb
Cable Y-Raise|cb
Upright Row|bb
Cable Upright Row|cb
Dumbbell Upright Row|db
Machine Shoulder Press|mc
Machine Lateral Raise|mc
Smith Machine Shoulder Press|sm
Pike Push-Up|bw
Handstand Push-Up|bw
Handstand Hold|bw|t
Wall Walk|bw
Band Pull-Apart|bd
Band Face Pull|bd
Band Lateral Raise|bd
Band Overhead Press|bd
Band Dislocates|bd
Kettlebell Press|kb
Kettlebell Bottoms-Up Press|kb
Kettlebell Halo|kb
Cuban Press|db
Cable External Rotation|cb
Dumbbell External Rotation|db
Lu Raise|db
Prone Y-T-W Raise|db`,

biceps: `Barbell Curl|bb
EZ-Bar Curl|ez
EZ-Bar Preacher Curl|ez
Drag Curl|bb
21s Barbell Curl|bb
Dumbbell Curl|db
Alternating Dumbbell Curl|db
Hammer Curl|db
Cross-Body Hammer Curl|db
Incline Dumbbell Curl|db
Concentration Curl|db
Dumbbell Preacher Curl|db
Spider Curl|db
Zottman Curl|db
Seated Dumbbell Curl|db
Bayesian Cable Curl|cb
Cable Curl|cb
Rope Hammer Curl|cb
High Cable Curl|cb
Single-Arm Cable Curl|cb
Cable Preacher Curl|cb
Machine Preacher Curl|mc
Machine Bicep Curl|mc
Band Curl|bd
Kettlebell Curl|kb
Chin-Up Hold|bw|t`,

triceps: `Close-Grip Bench Press|bb
JM Press|bb
Skull Crusher|ez
Dumbbell Skull Crusher|db
Overhead Dumbbell Extension|db
Single-Arm Overhead Dumbbell Extension|db
Dumbbell Kickback|db
Tate Press|db
Triceps Pushdown|cb
Rope Pushdown|cb
Single-Arm Cable Pushdown|cb
Reverse-Grip Pushdown|cb
Overhead Cable Extension|cb
Cable Triceps Kickback|cb
Cross-Body Cable Extension|cb
Machine Triceps Extension|mc
Assisted Dip Machine|mc
Seated Dip Machine|mc
Triceps Dip|bw
Bench Dip|bw
Weighted Dip|bw
Diamond Push-Up|bw
Bodyweight Skull Crusher|bw
Band Pushdown|bd
Band Overhead Extension|bd
Smith Machine Close-Grip Press|sm
EZ-Bar Overhead Extension|ez`,

underarmer: `Barbell Wrist Curl|bb
Reverse Barbell Wrist Curl|bb
Dumbbell Wrist Curl|db
Reverse Dumbbell Wrist Curl|db
Behind-the-Back Wrist Curl|bb
Reverse Curl|ez
Plate Pinch|ot|t
Dead Hang|bw|t
Wrist Roller|ot|w
Hand Gripper|ot|w
Towel Hang|bw|t`,

quads: `Back Squat|bb
High-Bar Squat|bb
Low-Bar Squat|bb
Front Squat|bb
Pause Squat|bb
Box Squat|bb
Safety Bar Squat|bb
Zercher Squat|bb
Overhead Squat|bb
Anderson Squat|bb
Goblet Squat|db
Dumbbell Squat|db
Heel-Elevated Goblet Squat|db
Kettlebell Goblet Squat|kb
Kettlebell Front Squat|kb
Hack Squat|mc
Leg Press|mc
Single-Leg Leg Press|mc
Narrow-Stance Leg Press|mc
Pendulum Squat|mc
Belt Squat|mc
V-Squat|mc
Smith Machine Squat|sm
Leg Extension|mc
Single-Leg Extension|mc
Dumbbell Bulgarian Split Squat|db
Barbell Bulgarian Split Squat|bb
Smith Machine Split Squat|sm
Split Squat|db
Front-Foot Elevated Split Squat|db
Dumbbell Walking Lunge|db
Barbell Walking Lunge|bb
Reverse Lunge|db
Barbell Reverse Lunge|bb
Forward Lunge|db
Lateral Lunge|db
Curtsy Lunge|db
Dumbbell Step-Up|db
Barbell Step-Up|bb
Bodyweight Squat|bw
Jump Squat|bw
Pistol Squat|bw
Sissy Squat|bw
Wall Sit|bw|t
Bodyweight Lunge|bw
Jumping Lunge|bw
Cossack Squat|bw
Spanish Squat|bd|w
Band Squat|bd
Box Jump|bw
Broad Jump|bw`,

hamstrings: `Romanian Deadlift|bb
Stiff-Leg Deadlift|bb
Dumbbell Romanian Deadlift|db
Single-Leg Romanian Deadlift|db
Kettlebell Romanian Deadlift|kb
Smith Machine Romanian Deadlift|sm
Cable Romanian Deadlift|cb
Good Morning|bb
Seated Good Morning|bb
Lying Leg Curl|mc
Seated Leg Curl|mc
Standing Single-Leg Curl|mc
Nordic Hamstring Curl|bw
Glute-Ham Raise|bw
Stability Ball Leg Curl|ot|b
Sliding Leg Curl|bw
Dumbbell Leg Curl|db
Band Leg Curl|bd
Cable Leg Curl|cb`,

sete: `Barbell Hip Thrust|bb
Dumbbell Hip Thrust|db
Single-Leg Hip Thrust|bw
B-Stance Hip Thrust|bb
Machine Hip Thrust|mc
Smith Machine Hip Thrust|sm
Glute Bridge|bw
Barbell Glute Bridge|bb
Single-Leg Glute Bridge|bw
Frog Pump|bw
Cable Glute Kickback|cb
Glute Kickback Machine|mc
Donkey Kick|bw
Fire Hydrant|bw
Hip Abduction Machine|mc
Hip Adduction Machine|mc
Cable Hip Abduction|cb
Cable Hip Adduction|cb
Banded Lateral Walk|bd|b
Banded Clamshell|bd|b
Banded Glute Bridge|bd|b
Cable Pull-Through|cb
45-Degree Hip Extension|bw
Reverse Lunge to Knee Drive|db
Copenhagen Plank|bw|t
Dumbbell Sumo Squat|db
Kettlebell Sumo Deadlift|kb
Step-Down|bw`,

legger: `Standing Calf Raise Machine|mc
Seated Calf Raise|mc
Leg Press Calf Raise|mc
Smith Machine Calf Raise|sm
Dumbbell Calf Raise|db
Single-Leg Dumbbell Calf Raise|db
Bodyweight Calf Raise|bw
Donkey Calf Raise|mc
Barbell Calf Raise|bb
Tibialis Raise|bw
Jump Rope Calf Bounces|bw`,

core: `Plank|bw|t
Side Plank|bw|t
RKC Plank|bw|t
Weighted Plank|ot|t
Plank Shoulder Tap|bw
Crunch|bw
Bicycle Crunch|bw
Reverse Crunch|bw
Decline Crunch|bw
Sit-Up|bw
Decline Sit-Up|bw
V-Up|bw
Hollow Body Hold|bw|t
Hollow Rock|bw
Dead Bug|bw
Bird Dog|bw
Mountain Climber|bw
Flutter Kicks|bw
Lying Leg Raise|bw
Hanging Leg Raise|bw
Hanging Knee Raise|bw
Toes-to-Bar|bw
Captain's Chair Knee Raise|mc|b
L-Sit|bw|t
Ab Wheel Rollout|ot|b
Cable Crunch|cb
Machine Crunch|mc
Pallof Press|cb
Band Pallof Press|bd
Cable Woodchopper|cb
Russian Twist|bw
Weighted Russian Twist|db
Landmine Rotation|bb
Dragon Flag|bw
Suitcase Carry|db
Stir the Pot|ot|b
Windshield Wiper|bw
Dumbbell Side Bend|db
Stability Ball Crunch|ot|b
Jackknife|bw
Body Saw|bw
Cable Oblique Crunch|cb`,

helkropp: `Power Clean|bb
Hang Clean|bb
Clean and Jerk|bb
Snatch|bb
Hang Snatch|bb
Clean Pull|bb
Barbell Thruster|bb
Dumbbell Thruster|db
Dumbbell Snatch|db
Dumbbell Clean and Press|db
Man Maker|db
Devil Press|db
Kettlebell Swing|kb
Single-Arm Kettlebell Swing|kb
Kettlebell Clean|kb
Kettlebell Snatch|kb
Kettlebell Clean and Press|kb
Turkish Get-Up|kb
Farmer's Carry|db
Trap Bar Farmer's Carry|tb
Overhead Carry|db
Sled Push|ot|w
Sled Pull|ot|w
Tire Flip|ot|b
Sandbag Carry|ot|w
Burpee|bw
Bear Crawl|bw|t
Wall Ball|ot|w
Medicine Ball Slam|ot|w
Battle Ropes|ot|t
Landmine Thruster|bb`,

kondisjon: `Treadmill Running|mc|c
Outdoor Running|ot|c
Incline Treadmill Walk|mc|c
Walking|ot|c
Stationary Bike|mc|c
Outdoor Cycling|ot|c
Assault Bike|mc|c
Rowing Machine|mc|c
SkiErg|mc|c
Elliptical|mc|c
Stair Climber|mc|c
Jump Rope|ot|c
Swimming|ot|c
HIIT Intervals|ot|c
Sprint Intervals|ot|c
Hiking|ot|c`,

mobilitet: `Hip Flexor Stretch|bw|t
World's Greatest Stretch|bw|t
Cat-Cow|bw|t
90-90 Hip Switch|bw
Deep Squat Hold|bw|t
Thoracic Rotation|bw
Couch Stretch|bw|t
Pigeon Stretch|bw|t
Hamstring Stretch|bw|t
Chest Doorway Stretch|bw|t
Foam Rolling|ot|t
Ankle Mobility Drill|bw`,
};

export function slug(s) {
  return String(s).toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/&/g, 'and').replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const EXERCISES = [];
const seen = new Set();
for (const [group, block] of Object.entries(RAW)) {
  for (const line of block.split('\n')) {
    const [name, eq, flag] = line.trim().split('|');
    if (!name) continue;
    const id = slug(name);
    if (seen.has(id)) { console.warn('Duplikat øvelse', id); continue; }
    seen.add(id);
    const type = flag || (eq === 'bw' ? 'b' : 'w');
    EXERCISES.push({ id, name, group, eq, type });
  }
}
