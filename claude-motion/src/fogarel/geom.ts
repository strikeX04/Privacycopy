export type P = {x: number; y: number};

export const pt = (x: number, y: number): P => ({x, y});
export const add = (a: P, b: P): P => ({x: a.x + b.x, y: a.y + b.y});
export const sub = (a: P, b: P): P => ({x: a.x - b.x, y: a.y - b.y});
export const mul = (a: P, k: number): P => ({x: a.x * k, y: a.y * k});
export const len = (a: P) => Math.hypot(a.x, a.y);
export const norm = (a: P): P => {
  const l = len(a) || 1;
  return {x: a.x / l, y: a.y / l};
};
export const polar = (ang: number, r: number): P => ({x: Math.cos(ang) * r, y: Math.sin(ang) * r});
export const lerpP = (a: P, b: P, k: number): P => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});
export const rot = (a: P, ang: number): P => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return {x: a.x * c - a.y * s, y: a.x * s + a.y * c};
};

export const bez = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

export const bezTan = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return norm({
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  });
};

const f = (n: number) => n.toFixed(1);

/** Smooth closed path through points (Catmull-Rom → cubic). */
export const smoothClosed = (pts: P[], tension = 1): string => {
  const n = pts.length;
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = add(p1, mul(sub(p2, p0), tension / 6));
    const c2 = sub(p2, mul(sub(p3, p1), tension / 6));
    d += `C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d + 'Z';
};

export const poly = (pts: P[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)},${f(p.y)}`).join('') + 'Z';

/**
 * Tapered ribbon along a cubic spine. Returns the outline and the
 * sampled top edge (left of travel direction) for placing spikes.
 */
export const ribbon = (
  p0: P,
  p1: P,
  p2: P,
  p3: P,
  width: (s: number) => number,
  samples = 26,
) => {
  const left: P[] = [];
  const right: P[] = [];
  const spine: P[] = [];
  const normals: P[] = [];
  for (let i = 0; i <= samples; i++) {
    const s = i / samples;
    const c = bez(p0, p1, p2, p3, s);
    const tg = bezTan(p0, p1, p2, p3, s);
    const nrm = {x: tg.y, y: -tg.x};
    const w = width(s) / 2;
    left.push(add(c, mul(nrm, w)));
    right.push(sub(c, mul(nrm, w)));
    spine.push(c);
    normals.push(nrm);
  }
  const outline = [...left, ...right.reverse()];
  return {d: smoothClosed(outline, 0.6), left, spine, normals};
};

/** Row of small spikes standing on an edge. */
export const spikes = (edge: P[], normals: P[], from: number, to: number, every: number, h: (s: number) => number) => {
  let d = '';
  const n = edge.length - 1;
  for (let i = Math.ceil(from * n); i < to * n; i += every) {
    const a = edge[i];
    const b = edge[Math.min(i + 1, n)];
    const s = i / n;
    const nrm = normals[i];
    const mid = lerpP(a, b, 0.35);
    const tip = add(mid, mul(nrm, h(s)));
    const back = lerpP(a, b, -0.5);
    d += poly([back, tip, b]);
  }
  return d;
};
