import { fmtShort } from './util.js';

// Enkel SVG-linjegraf. pts: [{x: tidsstempel, y: tall}]
export function lineChart(pts, { h = 170, unit = '', decimals = 1 } = {}) {
  if (pts.length < 2) return '<p class="muted small">Trenger minst to registreringer for å vise graf.</p>';
  const w = 340;
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (x1 === x0) x1 = x0 + 1;
  const pad = (y1 - y0) * 0.15 || Math.max(1, y1 * 0.05);
  y0 -= pad; y1 += pad;
  const L = 40, R = 10, T = 12, B = 24;
  const X = (x) => L + ((x - x0) / (x1 - x0)) * (w - L - R);
  const Y = (y) => T + (1 - (y - y0) / (y1 - y0)) * (h - T - B);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${X(pts.at(-1).x).toFixed(1)},${h - B}L${X(pts[0].x).toFixed(1)},${h - B}Z`;
  const fmt = (v) => v.toFixed(decimals).replace('.', ',');
  const ticks = [y0 + pad, (y0 + y1) / 2, y1 - pad];
  const grid = ticks.map((t) => `<line x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${fmt(t)}</text>`).join('');
  const dots = pts.map((p, i) => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${i === pts.length - 1 ? 4.5 : 2.5}" class="${i === pts.length - 1 ? 'last' : ''}"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Graf">
    ${grid}
    <path d="${area}" class="area"/><path d="${line}" class="line"/>${dots}
    <text x="${L}" y="${h - 6}">${fmtShort(x0)}</text>
    <text x="${w - R}" y="${h - 6}" text-anchor="end">${fmtShort(xs.at(-1))}</text>
    <text x="${X(pts.at(-1).x)}" y="${Y(pts.at(-1).y) - 10}" text-anchor="end" class="val">${fmt(pts.at(-1).y)}${unit}</text>
  </svg>`;
}
