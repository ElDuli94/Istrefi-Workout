import { S, store } from './store.js';
import { uid } from './util.js';

export const ANGLES = { front: 'Front', side: 'Side', back: 'Rygg', other: 'Annet' };

const urls = new Map();
export function photoURL(p, kind = 'thumb') {
  const key = p.id + kind;
  if (!urls.has(key)) urls.set(key, URL.createObjectURL(p[kind] || p.full));
  return urls.get(key);
}
export function forgetURL(id) {
  for (const k of ['thumb', 'full']) { const u = urls.get(id + k); if (u) { URL.revokeObjectURL(u); urls.delete(id + k); } }
}

function loadImg(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => { res(i); setTimeout(() => URL.revokeObjectURL(u), 1000); };
    i.onerror = () => rej(new Error('Kunne ikke lese bildet'));
    i.src = u;
  });
}
function resize(img, max, q) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob(r, 'image/jpeg', q));
}

export async function addPhotos(files, { angle, date, note = '' }) {
  let n = 0;
  for (const f of files) {
    const img = await loadImg(f);
    const [full, thumb] = await Promise.all([resize(img, 1600, 0.86), resize(img, 420, 0.8)]);
    await store.putPhoto({ id: uid(), date, angle, note, full, thumb, w: img.naturalWidth, h: img.naturalHeight });
    n++;
  }
  return n;
}

export const photosByAngle = (angle) => S.photos.filter((p) => !angle || p.angle === angle);

// Kroppsvekt nærmest en dato (innen 4 dager)
export function weightNear(t) {
  let best = null;
  for (const b of S.body) {
    if (b.weight == null) continue;
    const d = Math.abs(b.date - t);
    if (d < 4 * 864e5 && (!best || d < Math.abs(best.date - t))) best = b;
  }
  return best;
}
