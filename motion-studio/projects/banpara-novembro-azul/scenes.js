// ============================================================
// Banpará · Novembro Azul (30s, vertical 1080x1920, 60fps)
// Narração (ElevenLabs, Rômulo) começa no frame 12. Frames abaixo = tempo real da fala.
//   12 Novembro chegou · 150 lembrete importante · 263 Todo ano · 337 70 mil · 396 homens
//   515 câncer de próstata · 644 Mas · 688 quando descoberto cedo · 797 chances de cura · 880 90%
//   990 50 anos · 1097 45 · 1180 histórico na família · 1272 procure um urologista
//   1387 cuidar da sua saúde · 1522 quem você ama · 1574 Banpará · 1658 junto com você · 1730 Novembro Azul
// ============================================================

const SFX = [
  // A · laço
  ['swell', 14, .30, 0, { attack: .25, release: .5 }],
  ['air', 20, .18, 0, { dur: 1.2 }],
  ['glass', 44, .22, 0, { freq: 3400 }],
  ['haptic', 76, .45, 0, { f: 90 }],
  ['glass', 152, .16, .2, { freq: 4200 }],
  // B · 70 mil
  ['haptic', 300, .35, 0, { f: 100 }],
  ['glasstaps', 332, .10, 0, { to: 394, step: 1.6 }],
  ['haptic', 398, .45, 0, { f: 80 }],
  ['glass', 517, .18, -.2, { freq: 3800 }],
  // C · 90%
  ['haptic', 676, .35, 0, { f: 100 }],
  ['clicks', 880, .07, 0, { to: 948, step: 3 }],
  ['ping', 952, .32, 0, { f: 2350 }],
  ['air', 952, .2, 0, { dur: 1 }],
  // D · idade + urologista
  ['haptic', 1022, .35, 0, { f: 100 }],
  ['glass', 1000, .2, -.2, { freq: 3600 }],
  ['glass', 1046, .22, .2, { freq: 4300 }],
  ['glass', 1104, .2, -.2, { freq: 3600 }],
  ['glass', 1252, .22, .2, { freq: 4300 }],
  ['haptic', 1280, .45, 0, { f: 85 }],
  // E · coração + assinatura
  ['swell', 1440, .25, 0, { attack: .4 }],
  ['haptic', 1452, .4, 0, { f: 80 }],
  ['haptic', 1528, .45, 0, { f: 65 }],
  ['haptic', 1548, .4, 0, { f: 65 }],
  ['swell', 1612, .38, 0, { attack: .45, release: .5 }],
  ['haptic', 1616, .55, 0, { f: 75 }],
  ['glass', 1660, .2, 0, { freq: 3900 }],
  ['ping', 1700, .28, 0, { f: 2350 }],
  ['air', 1700, .2, 0, { dur: 1.2 }],
  ['glass', 1736, .2, .1, { freq: 4200 }],
];

// ---------- câmera em onda (t em segundos) ----------
const CAM = [
  [0, 1.10, 540, 900, -.01], [1.4, 1.0, 540, 960, 0], [4.2, 1.0, 540, 960, 0],
  [5.8, 1.07, 540, 1080, .006], [8.4, 1.02, 540, 1000, 0], [10.6, 1.0, 540, 960, 0],
  [13.6, 1.03, 540, 920, 0], [15.4, 1.09, 540, 820, -.006], [16.8, 1.0, 540, 960, 0],
  [19.5, 1.04, 540, 900, .005], [21.4, 1.07, 540, 1150, 0], [23.2, 1.0, 540, 960, 0],
  [25.6, 1.07, 540, 1050, 0], [26.6, 1.0, 540, 960, 0], [28.4, 1.05, 540, 1000, 0], [30, 1.06, 540, 1000, 0],
];
const camW = camPath(CAM, { sigma: .3 });
const CX = W / 2, DEEP = S.colors.deep, RED = B;
const camOn = (ctx, f) => applyCamPath(ctx, camW, f / FPS, { cx: CX, cy: H / 2, drift: .0015 });

// ---------- laço (traço contínuo) e coração: mesma quantidade de pontos para o morph ----------
function bez(p0, p1, p2, p3, n, out) {
  for (let i = 0; i < n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
}
const RIB = (() => {
  const o = [];
  bez([-175, 330], [-60, 150], [95, 10], [95, -120], 60, o);
  bez([95, -120], [95, -245], [-95, -245], [-95, -120], 60, o);
  bez([-95, -120], [-95, 10], [60, 150], [175, 330], 60, o);
  o.push([175, 330]);
  return o;
})();
const HEART = RIB.map((_, i) => {
  const t = Math.PI - (i / (RIB.length - 1)) * TAU;
  return [16 * Math.sin(t) ** 3 * 15, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 15 + 20];
});
// desenha os pontos (morph m: 0 laço → 1 coração), só até a fração p do traço
function ribbon(ctx, { x, y, s = 1, rot = 0, p = 1, m = 0, lw = 62, fill = 0, alpha = 1, glow = 1 }) {
  const pts = RIB.map((r, i) => [lerp(r[0], HEART[i][0], m), lerp(r[1], HEART[i][1], m)]);
  const n = Math.max(2, Math.round(p * (pts.length - 1)) + 1);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-200, -260, 200, 340);
  g.addColorStop(0, '#9FD2FF'); g.addColorStop(.55, '#5AB0FF'); g.addColorStop(1, '#2F7BFF');
  if (fill > 0) {
    ctx.save(); ctx.globalAlpha *= fill; ctx.beginPath();
    pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = g;
  ctx.shadowColor = `rgba(90,176,255,${.55 * glow})`; ctx.shadowBlur = 50;
  const path = (a, b) => { ctx.beginPath(); for (let i = a; i < b; i++) i === a ? ctx.moveTo(...pts[i]) : ctx.lineTo(...pts[i]); ctx.stroke(); };
  path(0, Math.min(n, 125));
  if (n > 120) {   // trecho que cruza por cima: sombra curta para o laço ter profundidade
    ctx.shadowColor = `rgba(2,8,26,${.45 * (1 - m)})`; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    path(120, n);
  }
  ctx.restore();
}

// ---------- utilidades ----------
// texto único (sem quebra por palavra) com blur-in; parts = [[txt, cor?], ...] na mesma linha
function line(ctx, f, parts, { y, size = 60, weight = 600, start = 0, color = WH, exit = 0, drift = 0, dur = 30 }) {
  return words(ctx, f, parts, { x: CX, y, size, weight, start, color, exit, drift, dur, stagger: 3, ls: -1 });
}
function source(ctx, f, txt, { start, exit = 0, color = 'rgba(238,243,250,.5)' }) {
  words(ctx, f, [[txt]], { x: CX, y: 1830, size: 26, weight: 500, start, stagger: 0, dur: 30, exit, color, ls: 0 });
}
// contador grande (texto que muda): blur-in, cor de acento no prefixo/sufixo
function counter(ctx, parts, { y, size, a = 1, bl = 0, rise = 0 }) {
  ctx.save(); ctx.font = font(800, size); ctx.letterSpacing = '-4px'; ctx.textBaseline = 'middle';
  const ws = parts.map(([t]) => ctx.measureText(t).width), tot = ws.reduce((p, q) => p + q, 0);
  let x = CX - tot / 2;
  ctx.globalAlpha = a; ctx.filter = blur(bl);
  parts.forEach(([t, c], i) => { ctx.fillStyle = c || WH; ctx.fillText(t, x, y + rise); x += ws[i]; });
  ctx.restore();
}
// cartão que nasce de um ponto: largura primeiro, depois altura
function growCard(ctx, f, { x, y, w, h, start, r = 56, fill = CARD, stroke = 'rgba(255,255,255,.10)', shadow = 0, exit = 0 }) {
  const pw = prog(f, start, start + 24, E.smooth), ph = prog(f, start + 16, start + 46, E.smooth);
  const cw = lerp(24, w, pw), chh = lerp(24, h, ph), rr_ = Math.min(r, chh / 2, cw / 2);
  if (pw <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= clamp(pw * 3) * (1 - exit);
  ctx.filter = blur(exit * 24 + (1 - ph) * 3);
  if (shadow) { ctx.save(); ctx.filter = blur(50); ctx.fillStyle = `rgba(6,26,64,${shadow})`; rr(ctx, x - cw / 2 + 30, y - chh / 2 + 50, cw - 60, chh, rr_); ctx.fill(); ctx.restore(); }
  rr(ctx, x - cw / 2, y - chh / 2, cw, chh, rr_); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
  return ph;
}
function man(ctx, x, y, s, color) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  circle(ctx, 0, -15, 11); ctx.fill();
  rr(ctx, -16, 0, 32, 26, [14, 14, 6, 6]); ctx.fill();
  ctx.restore();
}
function check(ctx, x, y, r, p, { bg = DEEP, fg = '#fff' } = {}) {
  if (p <= 0) return;
  const s = spring(p * 30, 0, { k: 200, c: 15 });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = bg; circle(ctx, 0, 0, r); ctx.fill();
  const k = clamp((p - .25) / .6);
  ctx.strokeStyle = fg; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([r * 1.6 * k, 400]);
  ctx.beginPath(); ctx.moveTo(-r * .42, r * .02); ctx.lineTo(-r * .12, r * .32); ctx.lineTo(r * .45, -r * .32); ctx.stroke();
  ctx.restore();
}
// faíscas em órbita lenta (elementos de apoio)
function sparks(ctx, f, x, y, R, n, a = 1, seed = 1) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const ang = i / n * TAU + f * .004 * (i % 2 ? 1 : -1) + seed, rr2 = R * (1 + .12 * Math.sin(f / 70 + i * 2.1));
    ctx.globalAlpha = a * (.35 + .35 * Math.sin(f / 40 + i));
    ctx.fillStyle = i % 3 ? O : '#fff';
    circle(ctx, x + Math.cos(ang) * rr2, y + Math.sin(ang) * rr2 * .9, 5 + (i % 3) * 3); ctx.fill();
  }
  ctx.restore();
}

// ============================================================
// CENAS
// ============================================================
// A · laço + NOVEMBRO AZUL (0–278) --------------------------------
function sceneA(ctx, f) {
  ctx.save(); bg(ctx, f, true); camOn(ctx, f);
  const ex = prog(f, 236, 262, E.inC), dr = prog(f, 0, 280, E.lin);
  const s = lerp(.55, 1.05, spring(f, 2, { k: 70, c: 14 })) * (1 + .05 * dr) * (1 + ex * .6);
  sparks(ctx, f, CX, 640, 330, 9, prog(f, 60, 110) * (1 - ex));
  layer(ctx, 1, ex * 30, L => ribbon(L, { x: CX, y: 640 - dr * 30, s, rot: Math.sin(f / 90) * .03, p: prog(f, 4, 74, E.smooth), lw: 62 }));
  line(ctx, f, [['NOVEMBRO']], { y: 1210 - dr * 24, size: 150, weight: 800, start: 10, exit: ex, drift: dr * 8 });
  line(ctx, f, [['AZUL', O]], { y: 1385 - dr * 24, size: 250, weight: 800, start: 40, exit: ex, drift: dr * 10 });
  line(ctx, f, [['Um lembrete'], ['importante.', O]], { y: 1580 - dr * 20, size: 58, start: 146, exit: ex, drift: dr * 4 });
  ctx.restore();
}

// B · +70 mil homens (250–660) ----------------------------------
const GRID = [...Array(70)].map((_, i) => [i % 10, Math.floor(i / 10)]);
function sceneB(ctx, f) {
  const b = f - 250, ex = prog(b, 364, 392, E.inC), dr = prog(b, 0, 410, E.lin);
  ctx.save(); bg(ctx, f, true); camOn(ctx, f);
  const cy = 640 - dr * 26;
  layer(ctx, 1, ex * 26, L => {
    const ph = growCard(L, b, { x: CX, y: cy, w: 900, h: 660, start: 2, r: 60, exit: 0 });
    // ícones: 1 por mil, nascem junto com o contador
    GRID.forEach(([c, r], i) => {
      const st = 82 + i * .9, sp = spring(b, st, { k: 160, c: 15 });
      const x = CX - 360 + c * 80, y = cy - 250 + r * 83 + 6;
      man(L, x, y, (ph > .9 ? .55 : 0) * 1, 'rgba(255,255,255,.10)');   // trilho apagado
      man(L, x, y - (1 - sp) * 20, sp, i % 9 === 4 ? '#fff' : O);
    });
    L.save(); L.font = font(500, 26, MONO); L.fillStyle = 'rgba(238,243,250,.55)'; L.textAlign = 'right'; L.textBaseline = 'middle';
    L.globalAlpha = prog(b, 150, 176) * (1 - ex);
    L.fillText('1 ícone = 1.000 homens', CX + 410, cy + 360); L.restore();
  });
  line(ctx, f - 250, [['Todo ano,']], { y: 1120 - dr * 20, size: 56, start: 10, exit: ex, color: 'rgba(238,243,250,.85)' });
  const n = Math.round(70 * prog(b, 82, 146, E.smooth)), ca = prog(b, 70, 96, E.out5);
  counter(ctx, [['+', O], [n + ' mil']], { y: 1285 - dr * 22, size: 220, a: ca * (1 - ex), bl: (1 - ca) * 18 + ex * 26, rise: (1 - ca) * 30 - ex * 14 });
  line(ctx, b, [['homens recebem o diagnóstico']], { y: 1450 - dr * 18, size: 56, start: 146, exit: ex, drift: dr * 4 });
  line(ctx, b, [['de'], ['câncer de próstata', O], ['no Brasil.']], { y: 1525 - dr * 18, size: 56, start: 263, exit: ex, drift: dr * 4 });
  source(ctx, b, 'Fonte: INCA, estimativa de casos novos por ano', { start: 160, exit: ex });
  ctx.restore();
}

// C · 90% de chance de cura (632–1003) --------------------------
function sceneC(ctx, f) {
  const c = f - 632, ex = prog(c, 340, 368, E.inC), dr = prog(c, 0, 370, E.lin);
  ctx.save(); bg(ctx, f, true); camOn(ctx, f);
  const cy = 690 - dr * 24, R = 250, fill = .9 * prog(c, 248, 318, E.smooth);
  layer(ctx, 1, ex * 26, L => {
    // trilho do anel nasce varrendo a volta
    const tr = prog(c, 8, 44, E.smooth);
    L.save(); L.lineCap = 'round';
    L.strokeStyle = 'rgba(255,255,255,.10)'; L.lineWidth = 54;
    L.beginPath(); L.arc(CX, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * tr); L.stroke();
    // ponto que corre no trilho enquanto "procura" (antes do preenchimento)
    const run = prog(c, 40, 250, E.lin), seek = (1 - prog(c, 236, 252)) * prog(c, 36, 50);
    if (seek > 0) {
      const ang = -Math.PI / 2 + TAU * (run * 2.2 % 1);
      L.globalAlpha = seek; L.fillStyle = O; L.shadowColor = 'rgba(90,176,255,.8)'; L.shadowBlur = 30;
      circle(L, CX + Math.cos(ang) * R, cy + Math.sin(ang) * R, 22); L.fill(); L.shadowBlur = 0; L.globalAlpha = 1;
    }
    if (fill > 0) {
      const g = L.createLinearGradient(CX - R, cy - R, CX + R, cy + R);
      g.addColorStop(0, '#9FD2FF'); g.addColorStop(1, '#2F7BFF');
      L.strokeStyle = g; L.lineWidth = 54; L.shadowColor = 'rgba(90,176,255,.6)'; L.shadowBlur = 40;
      L.beginPath(); L.arc(CX, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * fill); L.stroke();
    }
    L.restore();
    // pulso quando chega a 90%
    if (c >= 318) {
      const p = prog(c, 318, 360, E.outC);
      L.save(); L.globalAlpha = (1 - p) * .8; L.strokeStyle = O; L.lineWidth = 6;
      circle(L, CX, cy, R + 30 + p * 140); L.stroke(); L.restore();
    }
    // lupa ("descoberto cedo") dentro do anel, sai quando o número entra
    const lu = spring(c, 60, { k: 90, c: 14 }) * (1 - prog(c, 236, 256, E.inC));
    if (lu > .01) {
      L.save(); L.translate(CX - 6, cy - 6); L.scale(lu, lu); L.rotate(Math.sin(c / 30) * .12);
      L.filter = blur(prog(c, 236, 256) * 16);
      L.strokeStyle = '#fff'; L.lineWidth = 22; L.lineCap = 'round';
      circle(L, -14, -14, 62); L.stroke();
      L.beginPath(); L.moveTo(32, 32); L.lineTo(84, 84); L.stroke();
      L.fillStyle = O; circle(L, -14, -14, 18 + 6 * Math.sin(c / 12)); L.fill();
      L.restore();
    }
    const na = prog(c, 246, 270, E.out5);
    counter(L, [[String(Math.round(fill * 100))], ['%', O]], { y: cy + 4, size: 170, a: na, bl: (1 - na) * 16, rise: (1 - na) * 20 });
  });
  line(ctx, c, [['Quando descoberto'], ['cedo,', O]], { y: 1120 - dr * 20, size: 62, start: 56, exit: ex, drift: dr * 4 });
  line(ctx, c, [['a chance de']], { y: 1225 - dr * 20, size: 62, start: 160, exit: ex, color: 'rgba(238,243,250,.85)' });
  line(ctx, c, [['cura', O], ['chega a 90%']], { y: 1350 - dr * 22, size: 112, weight: 800, start: 196, exit: ex, drift: dr * 6 });
  source(ctx, c, 'Fonte: Sociedade Brasileira de Urologia', { start: 260, exit: ex });
  ctx.restore();
}

// D · idade + urologista (cena clara, 975–1403) ------------------
const ROWS = [
  { y: 0, tag: '50+', t: 'anos', sub: 'hora de fazer os exames', in: 15, subIn: 40, ok: 66 },
  { y: 1, tag: '45+', t: 'anos', sub: 'se há histórico na família', in: 122, subIn: 205, ok: 277 },
];
function sceneD(ctx, f) {
  const d = f - 975, ex = prog(d, 380, 405, E.inC), dr = prog(d, 0, 425, E.lin);
  ctx.save(); bg(ctx, f, false); camOn(ctx, f);
  const cy = 700 - dr * 26;
  layer(ctx, 1, ex * 26, L => {
    const ph = growCard(L, d, { x: CX, y: cy, w: 920, h: 470, start: 4, r: 60, fill: '#FFFFFF', stroke: 'rgba(6,26,64,.06)', shadow: .22 });
    if (ph < .6) return;
    ROWS.forEach((r, i) => {
      const y = cy - 105 + r.y * 210, a = prog(d, r.in, r.in + 22, E.out5);
      // divisória
      if (i === 1) { L.fillStyle = 'rgba(6,26,64,.07)'; L.fillRect(CX - 400, cy, 800 * prog(d, 100, 130, E.smooth), 2); }
      // pílula da idade: ponto → pílula (largura) com mola
      const pw = spring(d, r.in, { k: 120, c: 14 });
      if (pw > .01) {
        const w = lerp(30, 220, clamp(pw)), h = lerp(30, 130, clamp(pw * 1.4));
        L.save(); L.fillStyle = 'rgba(90,176,255,.18)'; rr(L, CX - 410, y - h / 2, w, h, h / 2); L.fill();
        L.globalAlpha = a; L.font = font(800, 78); L.letterSpacing = '-3px'; L.textBaseline = 'middle'; L.fillStyle = DEEP; L.textAlign = 'center';
        L.fillText(r.tag, CX - 410 + 110, y + 3); L.restore();
      }
      L.save(); L.textBaseline = 'middle'; L.letterSpacing = '-1px';
      L.globalAlpha = a; L.filter = blur((1 - a) * 14);
      L.font = font(800, 62); L.fillStyle = K; L.fillText(r.t, CX - 160 + (1 - a) * 30, y - 26);
      const sa = prog(d, r.subIn, r.subIn + 24, E.out5);
      L.globalAlpha = sa; L.filter = blur((1 - sa) * 14);
      L.font = font(500, 38); L.fillStyle = 'rgba(6,26,64,.62)'; L.fillText(r.sub, CX - 160 + (1 - sa) * 30, y + 34);
      L.restore();
      check(L, CX + 380, y, 34, prog(d, r.ok, r.ok + 26));
    });
  });
  line(ctx, d, [['Procure um']], { y: 1280 - dr * 22, size: 78, weight: 600, start: 296, exit: ex, color: K });
  line(ctx, d, [['urologista.', DEEP]], { y: 1420 - dr * 24, size: 150, weight: 800, start: 306, exit: ex, color: K, drift: dr * 6 });
  ctx.restore();
}

// E · coração → B → assinatura (1375–1800) ----------------------
function sceneE(ctx, f) {
  const e = f - 1375, dr = prog(e, 0, 425, E.lin);
  ctx.save(); bg(ctx, f, true); camOn(ctx, f);
  // laço volta e vira coração; coração bate em "ama"; depois encolhe até o ponto do B
  const m = prog(e, 22, 78, E.smooth), shrink = prog(e, 196, 226, E.inC);
  const beat = 1 + .06 * Math.sin(Math.PI * prog(e, 150, 166)) + .05 * Math.sin(Math.PI * prog(e, 170, 186));
  const hs = lerp(.7, .95, spring(e, 0, { k: 80, c: 14 })) * beat * lerp(1, .05, shrink);
  if (shrink < 1) {
    sparks(ctx, f, CX, 700, 330, 9, prog(e, 80, 120) * (1 - shrink), 2);
    layer(ctx, 1 - prog(e, 214, 228), shrink * 10, L =>
      ribbon(L, { x: CX, y: lerp(700 - dr * 20, 860, shrink), s: hs, rot: Math.sin(f / 90) * .03 * (1 - m), p: prog(e, 0, 26, E.smooth), m, fill: prog(e, 60, 110, E.smooth), lw: lerp(62, 40, m) }));
  }
  const tx = prog(e, 196, 220, E.inC);
  line(ctx, e, [['Cuidar da sua'], ['saúde', O]], { y: 1190 - dr * 20, size: 64, start: 10, exit: tx, drift: dr * 4 });
  line(ctx, e, [['é cuidar de']], { y: 1280 - dr * 20, size: 64, start: 66, exit: tx, color: 'rgba(238,243,250,.85)' });
  line(ctx, e, [['quem você'], ['ama.', O]], { y: 1420 - dr * 22, size: 128, weight: 800, start: 146, exit: tx, drift: dr * 6 });

  // B: quadrado vermelho nasce do ponto (largura → altura), a logo entra quando a forma assenta
  const LB = IMG('logo-b.png'), LF = IMG('logo-full.png');
  if (e >= 206 && LB && LF) {
    const pw = prog(e, 206, 226, E.smooth), ph = prog(e, 220, 244, E.smooth);
    const slide = prog(e, 268, 304, E.smooth);   // B vai para a esquerda e o nome sai de trás dele
    const fw = 820, fh = fw * LF.height / LF.width, bwF = fh * 352 / 401;   // B dentro da logo completa
    const bw0 = 300, bw = lerp(bw0, bwF, slide), bh = bw * LB.height / LB.width;
    const y0 = 860 - dr * 10, x0 = lerp(CX, CX - fw / 2 + bwF / 2, slide);
    const lift = 1 + .03 * prog(e, 300, 425, E.lin);
    ctx.save(); ctx.translate(CX, y0); ctx.scale(lift, lift); ctx.translate(-CX, -y0);
    // nome "Banpará" deslizando de trás do B (recorte à direita do B)
    if (slide > 0) {
      ctx.save(); const bx = x0 + bw / 2;
      ctx.beginPath(); ctx.rect(bx - 2, y0 - fh, fw + 40, fh * 2); ctx.clip();
      const off = (1 - slide) * -fw * .55;
      ctx.globalAlpha = clamp(slide * 1.6); ctx.filter = blur((1 - slide) * 12);
      ctx.drawImage(LF, CX - fw / 2 + off, y0 - fh / 2, fw, fh);
      ctx.restore();
    }
    const cw = lerp(16, bw, pw), ch = lerp(16, bh, ph);
    ctx.save(); ctx.fillStyle = RED;
    ctx.shadowColor = 'rgba(226,6,19,.45)'; ctx.shadowBlur = 60 * (1 - slide * .5);
    rr(ctx, x0 - cw / 2, y0 - ch / 2, cw, ch, lerp(Math.min(cw, ch) / 2, 2, ph)); ctx.fill(); ctx.restore();
    const la = prog(e, 236, 252);
    if (la > 0) { ctx.save(); ctx.globalAlpha = la; ctx.drawImage(LB, x0 - bw / 2, y0 - bh / 2, bw, bh); ctx.restore(); }
    ctx.restore();
  }
  // "Junto com você no" + pílula Novembro Azul
  line(ctx, e, [['Junto com você no']], { y: 1150 - dr * 14, size: 60, start: 283, color: 'rgba(238,243,250,.9)', drift: dr * 3 });
  if (e >= 330) {
    const pw = spring(e, 332, { k: 110, c: 14 }), w = lerp(110, 600, clamp(pw)), h = 120, y = 1290 - dr * 14;
    ctx.save(); ctx.globalAlpha = clamp(pw * 3);
    ctx.fillStyle = O; ctx.shadowColor = 'rgba(90,176,255,.5)'; ctx.shadowBlur = 40;
    rr(ctx, CX - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
    // mini laço à esquerda + texto
    const ta = prog(e, 346, 370, E.out5);
    ctx.globalAlpha = ta; ctx.filter = blur((1 - ta) * 10);
    ctx.save(); ctx.translate(CX - w / 2 + 70, y); ctx.scale(.13, .13);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 64; ctx.strokeStyle = K;
    ctx.beginPath(); RIB.forEach(([a, b2], i) => i ? ctx.lineTo(a, b2) : ctx.moveTo(a, b2)); ctx.stroke(); ctx.restore();
    ctx.font = font(800, 56); ctx.letterSpacing = '-1.5px'; ctx.textBaseline = 'middle'; ctx.fillStyle = K;
    ctx.fillText('Novembro Azul', CX - w / 2 + 125 + (1 - ta) * 20, y + 2);
    ctx.restore();
  }
  ctx.restore();
}

// ============================================================
// MONTAGEM
// ============================================================
const SC = [
  { a: 0, fn: sceneA }, { a: 250, fn: sceneB }, { a: 632, fn: sceneC },
  { a: 975, fn: sceneD }, { a: 1375, fn: sceneE },
];
const TR = [
  { a: 250, b: 278, x: 540, y: 640 },    // nasce do laço
  { a: 632, b: 660, x: 540, y: 1270 },   // nasce do contador
  { a: 975, b: 1003, x: 540, y: 680 },   // nasce do anel
  { a: 1375, b: 1403, x: 540, y: 1400 }, // nasce de "urologista"
];
const BOARD = [
  [70, 'Laço se desenha', 'Novembro chegou'], [200, 'NOVEMBRO AZUL', 'um lembrete importante'],
  [420, '+70 mil', '1 ícone = mil homens'], [600, 'Câncer de próstata', 'fonte INCA'],
  [800, 'Descoberto cedo', 'lupa no anel'], [960, '90% de cura', 'anel completo'],
  [1120, '50+ e 45+', 'card claro'], [1340, 'Urologista', ''],
  [1470, 'Laço vira coração', ''], [1560, 'Quem você ama', 'coração bate'],
  [1640, 'B do Banpará', 'nasce do coração'], [1790, 'Assinatura', 'Novembro Azul'],
];
