// ============================================================
// "4 jeitos de perder dinheiro no plantão" · Reels 9:16, 82s, 30fps
// Narração: ElevenLabs (Talis), começa em 0,2s. Todos os tempos abaixo em SEGUNDOS (= fala + 0,2).
//   0,9 plantão · 3,0 perder · 3,3 dinheiro · 6,4 quatro · 9,2 comum
//   10,2 Primeiro RPA · 12,9 R$1.200 · 14,5 11% · 19,6 imposto de renda · 20,9 27,5% · 23,0 Com CNPJ · 25,6 bem menos
//   27,3 Segundo · 30,2 contrato · 31,0 tipo de sociedade · 33,1 dívida · 35,5 CPF · 37,6 lê antes de assinar
//   39,1 Terceiro · 41,0 cobrir plantão · 42,7 Pix · 44,5 Sem nota · 45,5 sem registro · 46,7 banco · 47,6 Receita
//   49,4 malha · 50,8 imposto · 51,2 multa 75% · 53,4 juros
//   54,9 quarto · 59,6 Anexo 5 · 62,4 R$186 · 64,6 Anexo 3 · 66,6 R$72 · 67,4 dez plantões · 69,1 R$1.140 · 71,3 Todo mês
//   72,4 essa diferença tem nome · 74,1 Fator R · 75,0 Quer saber · 77,2 Comenta PLANTÃO · 78,7 te chamo no direct
// ============================================================
const F = s => Math.round(s * FPS);

const SFX = [
  // gancho
  ['boom', F(.85), .32, 0, { dur: 1 }], ['slap', F(2.9), .45], ['whoosh', F(5.4), .22, 0, { dur: .45, f0: 400, f1: 3500, peak: .4 }],
  ['haptic', F(6.35), .5, 0, { f: 80 }], ['glass', F(6.9), .2], ['boom', F(9.05), .38, 0, { dur: 1 }],
  // 01 RPA
  ['rustle', F(11.0), .4], ['pop', F(12.9), .3, 0, { f0: 700, f1: 200 }], ['scribble', F(14.2), .3, .3],
  ['haptic', F(14.5), .5, .2, { f: 85 }], ['glass', F(15.7), .2, .2], ['scribble', F(17.4), .25, -.2], ['boom', F(20.85), .4, 0, { dur: 1 }],
  ['scribble', F(23.4), .35], ['ping', F(25.6), .22, 0, { f: 2350 }],
  // 02 sócio
  ['rustle', F(28.1), .4], ['scribble', F(31.0), .22], ['scribble', F(31.8), .35, .2], ['pop', F(32.4), .3, .3, { f0: 800, f1: 260 }],
  ['whoosh', F(34.2), .18, 0, { dur: .4, f0: 300, f1: 1500, peak: .5 }], ['boom', F(35.45), .5, 0, { dur: 1.1 }], ['air', F(37.6), .2, 0, { dur: .9 }],
  // 03 Pix
  ['whoosh', F(40.2), .2, 0, { dur: .5, f0: 300, f1: 2500, peak: .5 }], ['glass', F(41.05), .22, -.2], ['glass', F(42.1), .22, .2],
  ['ping', F(42.75), .35, 0, { f: 2350 }], ['slap', F(44.5), .45, -.2], ['slap', F(45.5), .45, .2],
  ['haptic', F(46.35), .35, -.3, { f: 100 }], ['glass', F(46.95), .22, .3], ['haptic', F(48.75), .45, 0, { f: 85 }],
  ['haptic', F(50.75), .4, 0, { f: 90 }], ['boom', F(51.35), .55, 0, { dur: 1.1 }], ['haptic', F(53.4), .45, 0, { f: 85 }],
  // 04 Fator R
  ['glass', F(59.9), .22], ['haptic', F(62.55), .45, 0, { f: 85 }], ['glass', F(64.9), .22], ['haptic', F(66.45), .45, 0, { f: 95 }],
  ['whoosh', F(67.2), .2, 0, { dur: .45, f0: 400, f1: 3000, peak: .4 }], ['clicks', F(67.9), .07, 0, { to: F(68.9), step: 2 }],
  ['boom', F(69.05), .45, 0, { dur: 1 }], ['haptic', F(71.25), .4, 0, { f: 90 }],
  ['swell', F(74.0), .4, 0, { attack: .5, release: .4 }], ['boom', F(74.05), .5, 0, { dur: 1.2 }],
  // final
  ['glasstaps', F(75.0), .14, 0, { to: F(76.0), step: 9 }], ['whoosh', F(76.6), .18, 0, { dur: .4, f0: 500, f1: 3500, peak: .4 }],
  ['haptic', F(77.25), .55, 0, { f: 80 }], ['ping', F(77.35), .3, 0, { f: 2350 }], ['air', F(78.7), .2, 0, { dur: 1.2 }],
];

// ---------- câmera em onda: aproxima nos "socos" ----------
const CAM = [
  [0, 1.08, 540, 900, 0], [1.2, 1.0, 540, 960, 0], [2.6, 1.0, 540, 960, 0], [3.4, 1.06, 540, 950, -.006], [4.8, 1.0, 540, 960, 0], [6.6, 1.03, 540, 900, 0],
  [8.4, 1.0, 540, 960, 0], [9.4, 1.07, 540, 1060, 0], [10.2, 1.0, 540, 960, 0], [12.1, 1.02, 500, 900, 0],
  [14.0, 1.0, 540, 960, 0], [15.0, 1.05, 700, 700, .005], [16.6, 1.0, 540, 960, 0], [20.4, 1.0, 540, 960, 0], [21.3, 1.06, 540, 1150, 0], [22.6, 1.0, 540, 960, 0],
  [25.0, 1.03, 540, 1000, 0], [28.6, 1.0, 540, 940, 0], [30.8, 1.03, 540, 900, .004], [33.0, 1.0, 540, 960, 0], [35.0, 1.0, 540, 960, 0], [35.9, 1.07, 540, 1120, 0], [37.2, 1.0, 540, 960, 0],
  [42.4, 1.0, 540, 960, 0], [43.2, 1.05, 540, 760, 0], [44.4, 1.0, 540, 960, 0], [47.6, 1.03, 540, 900, 0],
  [50.9, 1.0, 540, 960, 0], [51.8, 1.07, 540, 1080, -.005], [53.0, 1.0, 540, 960, 0], [56.6, 1.03, 540, 700, 0], [59.2, 1.0, 540, 960, 0],
  [61.9, 1.0, 540, 960, 0], [62.8, 1.05, 540, 800, 0], [64.0, 1.0, 540, 960, 0],
  [68.6, 1.0, 540, 960, 0], [69.5, 1.07, 540, 1090, .005], [70.8, 1.0, 540, 960, 0],
  [73.6, 1.0, 540, 960, 0], [74.5, 1.09, 540, 1000, 0], [75.8, 1.0, 540, 960, 0],
  [77.0, 1.0, 540, 960, 0], [77.9, 1.07, 540, 1130, 0], [79.4, 1.02, 540, 1000, 0], [82, 1.06, 540, 1040, 0],
];
const camW = camPath(CAM, { sigma: .3 });
const CX = W / 2, INK = S.colors.ink, CREAM = WH, GOLD = O, RED = B, GREEN = '#1E7A55';
const IMPACT = S.fonts.impact, SERIF = S.fonts.serif;
const PG = (t, a, b, e = E.smooth) => prog(t, a, b, e);          // progresso em segundos
const SP = (f, s0, o = { k: 120, c: 14 }) => spring(f, F(s0), o);  // mola a partir de s0 segundos

// texto centralizado palavra por palavra (tempos em segundos)
function say(ctx, f, parts, { y, x = CX, size = 56, weight = 600, at, color, exit = 0, drift = 0, fam = DISPLAY, ls = -1, align = 'center' }) {
  return words(ctx, f, parts, { x, y, size, weight, start: F(at), stagger: F(.07), dur: F(.5), color, exit, drift, fam, ls, align });
}
const imp = (ctx, f, parts, o) => say(ctx, f, parts, { weight: 400, fam: IMPACT, ls: 0, ...o });
const ser = (ctx, f, parts, o) => say(ctx, f, parts, { weight: 'italic 400', fam: SERIF, ls: 0, ...o });
// bloco de cor que cresce da esquerda para a direita (atrás de um texto de impacto)
function block(ctx, f, { x = CX, y, w, h, at, color = RED, exit = 0, rot = -.01 }) {
  const t = f / FPS, p = PG(t, at, at + .28, E.out5);
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= 1 - exit; ctx.filter = blur(exit * 20);
  rr(ctx, -w / 2, -h / 2, w * p, h, 10); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function underline(ctx, f, x, y, w, at, color = GOLD, lw = 10) {
  const p = PG(f / FPS, at, at + .35, E.out5); if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + w * p, y); ctx.stroke(); ctx.restore();
}
// seta tracejada (curva) que se desenha
function dashArrow(ctx, f, x0, y0, x1, y1, at, color, dur = .45, bend = .3) {
  const p = PG(f / FPS, at, at + dur, E.outC); if (p <= 0) return;
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([14, 12]);
  ctx.beginPath(); const n = 40;
  for (let i = 0; i <= n * p; i++) { const s = i / n, u = 1 - s; const px = u * u * x0 + 2 * u * s * mx + s * s * x1, py = u * u * y0 + 2 * u * s * my + s * s * y1; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.setLineDash([]);
  if (p > .95) { const a = Math.atan2(y1 - my, x1 - mx); ctx.translate(x1, y1); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-18, -12); ctx.lineTo(-18, 12); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

// ---------- barra de capítulos + etiqueta ----------
const CHAP = [[10.0, 26.9, 'Receber por RPA'], [26.9, 38.7, 'Virar sócio sem ler o contrato'], [38.7, 54.5, 'Receber “por fora” no Pix da PF'], [54.5, 74.6, 'Ter CNPJ e pagar imposto a mais']];
function chapters(ctx, f, n, dark, showTag = true) {
  const t = f / FPS, x0 = 120, w = 195, gap = 15, y = 150;
  for (let i = 0; i < 4; i++) {
    const [a, b2] = CHAP[i], fill = i < n - 1 ? 1 : i === n - 1 ? PG(t, a, b2, E.lin) : 0;
    const x = x0 + i * (w + gap);
    ctx.fillStyle = dark ? 'rgba(242,237,227,.16)' : 'rgba(16,38,30,.13)'; rr(ctx, x, y - 3, w, 6, 3); ctx.fill();
    if (fill > 0) { ctx.fillStyle = GOLD; rr(ctx, x, y - 3, w * fill, 6, 3); ctx.fill(); }
  }
  if (!showTag) return;
  const [a, , title] = CHAP[n - 1], s = SP(f, a + .3, { k: 160, c: 15 });
  if (s <= .01) return;
  ctx.save(); ctx.translate(x0 + 34, 238); ctx.scale(s, s);
  ctx.fillStyle = GOLD; circle(ctx, 0, 0, 32); ctx.fill();
  ctx.font = font(400, 36, IMPACT); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('0' + n, 0, 2);
  ctx.restore();
  say(ctx, f, [[title]], { x: x0 + 86, y: 240, size: 40, weight: 800, at: a + .4, color: dark ? CREAM : INK, align: 'left', ls: -.5 });
}
function base(ctx, f, dark) { bg(ctx, f, dark); applyCamPath(ctx, camW, f / FPS, { cx: CX, cy: H / 2, drift: .0008 }); }

// ============================================================
// GANCHO (0–9,8)
// ============================================================
function sceneHook(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true);
  // "4" gigante de fundo (contorno dourado)
  const g4 = SP(f, 6.2, { k: 70, c: 13 }), up = PG(t, 7.5, 8.2);
  ctx.save(); ctx.translate(CX, lerp(820, 470, up)); ctx.scale(lerp(.5, 1, g4) * lerp(1, .55, up), lerp(.5, 1, g4) * lerp(1, .55, up));
  ctx.font = font(400, 900, IMPACT); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = .06 + .94 * clamp(g4); ctx.fillStyle = PG(t, 6.2, 6.5) > 0 ? GOLD : 'rgba(201,160,67,.0)';
  ctx.fillText('4', 0, 40 + Math.sin(f / 30) * 6);
  ctx.globalAlpha = .08 * (1 - clamp(g4)); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.strokeText('4', 0, 40);
  ctx.restore();
  ser(ctx, f, [['jeitos', CREAM]], { y: lerp(1170, 760, up), size: lerp(120, 80, up), at: 6.9, drift: PG(t, 6.9, 9.8, E.lin) * 4 });
  // bloco 1: PLANTÃO → PERDER dinheiro
  const ex1 = PG(t, 5.3, 5.8, E.inC), dr = PG(t, 0, 5.8, E.lin);
  if (t < 6.0) {
    const mv = PG(t, 1.8, 2.5);
    ctx.save(); ctx.translate(CX, lerp(0, -300, mv)); ctx.scale(lerp(1, .62, mv), lerp(1, .62, mv)); ctx.translate(-CX, 0);
    say(ctx, f, [['Você que dá']], { y: 600, size: 58, at: .2, color: CREAM, exit: ex1 });
    imp(ctx, f, [['PLANTÃO', CREAM]], { y: 820, size: 250, at: .75, exit: ex1, drift: dr * 6 });
    ctx.restore();
    say(ctx, f, [['sabia que dá pra']], { y: 760, size: 56, at: 2.1, color: 'rgba(242,237,227,.85)', exit: ex1 });
    block(ctx, f, { y: 930, w: 640, h: 230, at: 2.8, exit: ex1 });
    imp(ctx, f, [['PERDER', CREAM]], { y: 940, size: 220, at: 2.95, exit: ex1, drift: dr * 4 });
    ser(ctx, f, [['dinheiro', GOLD]], { y: 1115, size: 140, at: 3.25, exit: ex1 });
    say(ctx, f, [['sem nem perceber?']], { y: 1250, size: 60, at: 4.0, color: CREAM, exit: ex1 });
  }
  // bloco 2: o 3º é o mais COMUM
  say(ctx, f, [['E o'], ['3º', GOLD], ['é o mais']], { y: 880, size: 60, at: 7.85, color: CREAM, drift: PG(t, 7.8, 9.8, E.lin) * 4 });
  imp(ctx, f, [['COMUM.', CREAM]], { y: 1100, size: 260, at: 8.95, drift: PG(t, 9, 9.8, E.lin) * 6 });
  underline(ctx, f, CX, 1250, 560, 9.15);
  ctx.restore();
}

// ============================================================
// 01 · RPA (9,8–26,9)
// ============================================================
const REC = mk(1120, 700); let recReady = false;
function buildRec() {
  recReady = true; const g = REC.getContext('2d'); g.scale(2, 2);
  rr(g, 0, 0, 560, 350, 26); g.fillStyle = '#fff'; g.fill(); g.save(); g.clip();
  g.fillStyle = S.colors.dark; g.fillRect(0, 0, 560, 74);
  g.font = font(400, 46, IMPACT); g.fillStyle = CREAM; g.textBaseline = 'middle'; g.fillText('RPA', 30, 40);
  g.font = font(700, 24); g.fillStyle = INK; g.fillText('Recibo de Pagamento Autônomo', 30, 116);
  g.font = font(500, 20); g.fillStyle = '#6E7C75'; g.fillText('Valor bruto', 30, 172);
  g.fillStyle = 'rgba(16,38,30,.08)'; [300, 322].forEach(y => g.fillRect(30, y, 500, 8));
  g.restore();
}
function sceneRPA(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, false); chapters(ctx, f, 1, false);
  if (!recReady) buildRec();
  const s = SP(f, 11.0, { k: 80, c: 14 }), dr = PG(t, 11, 23, E.lin);
  const x = lerp(-400, 345, s) + dr * 10, y = 600 - dr * 20, rot = lerp(-.25, -.035, s) + Math.sin(f / 40) * .01;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.filter = blur(30); ctx.fillStyle = 'rgba(16,38,30,.22)'; rr(ctx, -260, -150, 520, 350, 26); ctx.fill(); ctx.restore();
  ctx.drawImage(REC, -280, -175, 560, 350);
  const va = PG(t, 12.85, 13.2, E.out5);
  ctx.globalAlpha = va; ctx.filter = blur((1 - va) * 10); ctx.font = font(400, 100, IMPACT); ctx.fillStyle = INK; ctx.textBaseline = 'middle';
  ctx.fillText('R$ 1.200', -250, 60 + (1 - va) * 20);
  ctx.restore();
  // -11% INSS
  dashArrow(ctx, f, 600, 470, 760, 430, 14.15, RED, .35, -.25);
  imp(ctx, f, [['-11%', RED]], { y: 540, x: 860, size: 140, at: 14.45 });
  ser(ctx, f, [['INSS na fonte', RED]], { y: 640, x: 860, size: 52, at: 15.0 });
  say(ctx, f, [['= R$ 132']], { y: 712, x: 860, size: 46, weight: 800, at: 15.7, color: INK });
  // resto vira renda PF → IR até 27,5%
  dashArrow(ctx, f, 330, 800, 380, 940, 17.3, INK, .4, .3);
  say(ctx, f, [['o que sobra vira renda de pessoa física']], { y: 1010, size: 46, at: 17.5, color: INK });
  imp(ctx, f, [['IR DE ATÉ 27,5%', RED]], { y: 1170, size: 150, at: 20.75, drift: PG(t, 20.8, 23, E.lin) * 5 });
  ctx.restore();
}
function sceneRPA2(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true); chapters(ctx, f, 1, true, false);
  const dr = PG(t, 22.6, 27, E.lin);
  say(ctx, f, [['Plantão pago via']], { y: 690, size: 58, at: 22.85, color: CREAM, drift: dr * 4 });
  imp(ctx, f, [['RPA', CREAM]], { y: 930, size: 300, at: 22.95, drift: dr * 6 });
  const k = PG(t, 23.35, 23.75, E.outC);
  if (k > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(300, 990); ctx.lineTo(300 + 480 * k, 990 - 110 * k); ctx.stroke(); ctx.restore(); }
  say(ctx, f, [['Com CNPJ, o mesmo plantão']], { y: 1160, size: 56, at: 24.35, color: CREAM, drift: dr * 3 });
  ser(ctx, f, [['pode pagar bem menos.', GOLD]], { y: 1280, size: 92, at: 25.45, drift: dr * 4 });
  ctx.restore();
}

// ============================================================
// 02 · Sócio sem ler (26,9–38,7)
// ============================================================
const CTR = mk(1240, 1640); let ctrReady = false;
function buildCtr() {
  ctrReady = true; const g = CTR.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#FBF7EE'; g.fillRect(10, 10, 600, 800);
  g.strokeStyle = 'rgba(16,38,30,.08)'; g.lineWidth = 2; g.strokeRect(10, 10, 600, 800);
  g.font = font(700, 30); g.letterSpacing = '4px'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('CONTRATO DE SOCIEDADE', 310, 90); g.letterSpacing = '0px'; g.textAlign = 'left';
  g.fillStyle = 'rgba(16,38,30,.12)';
  [150, 178, 206, 234, 262, 290].forEach((y, i) => g.fillRect(60, y, i % 3 === 2 ? 380 : 500, 9));
  [610, 638, 666, 694, 722].forEach((y, i) => g.fillRect(60, y, i % 2 ? 420 : 500, 9));
  g.font = font(700, 32); g.fillStyle = INK;
  ['Os sócios respondem', 'pelas obrigações', 'da sociedade.'].forEach((l, i) => g.fillText(l, 70, 410 + i * 44));
  // fitas
  g.fillStyle = 'rgba(232,220,180,.85)';
  [[60, 10, -.12], [560, 10, .12]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); g.fillRect(-60, -18, 120, 36); g.restore(); });
}
function sceneSocio(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, false); chapters(ctx, f, 2, false);
  if (!ctrReady) buildCtr();
  const s = SP(f, 28.0, { k: 80, c: 14 }), dr = PG(t, 28, 33, E.lin);
  const cx = CX + Math.sin(f / 50) * 6, cy = lerp(1900, 900, s) - dr * 24, rot = lerp(.18, .02, s) + Math.sin(f / 45) * .008;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.save(); ctx.filter = blur(34); ctx.fillStyle = 'rgba(16,38,30,.25)'; ctx.fillRect(-280, -360, 580, 800); ctx.restore();
  ctx.drawImage(CTR, -310, -410, 620, 820);
  // marca-texto + círculo vermelho na cláusula
  marker(ctx, f, -250, 44, 380, 120, { start: F(31.0), dur: F(.5), color: '#F3D86B', alpha: .55 });
  ink(ctx, f, pathEllipse(-50, 44, 300, 100, { seed: 3 }), { start: F(31.8), dur: F(.6), color: RED, width: 7 });
  ctx.restore();
  ser(ctx, f, [['leia isso!', RED]], { x: 830, y: 690, size: 84, at: 32.35, drift: dr * 3 });
  ctx.restore();
}
function sceneCPF(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true); chapters(ctx, f, 2, true, false);
  const dr = PG(t, 32.8, 38.7, E.lin);
  say(ctx, f, [['Uma dívida ou um processo']], { y: 600, size: 60, at: 33.05, color: CREAM, drift: dr * 3 });
  say(ctx, f, [['do grupo']], { y: 680, size: 60, at: 33.9, color: CREAM });
  const a = PG(t, 34.2, 34.8, E.outC);
  if (a > 0) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(CX, 745); ctx.lineTo(CX, 745 + 120 * a); ctx.stroke();
    if (a > .9) { ctx.beginPath(); ctx.moveTo(CX - 18, 850); ctx.lineTo(CX, 868); ctx.lineTo(CX + 18, 850); ctx.stroke(); } ctx.restore(); }
  say(ctx, f, [['pode chegar no']], { y: 950, size: 58, at: 34.8, color: CREAM });
  block(ctx, f, { y: 1120, w: 820, h: 230, at: 35.3, color: GOLD });
  imp(ctx, f, [['SEU CPF.', INK]], { y: 1130, size: 220, at: 35.4, drift: dr * 5 });
  ser(ctx, f, [['Lê antes de assinar.', GOLD]], { y: 1330, size: 92, at: 37.5 });
  say(ctx, f, [['depende do tipo de sociedade e do contrato']], { y: 1430, size: 30, weight: 500, at: 38.0, color: 'rgba(242,237,227,.55)' });
  ctx.restore();
}

// ============================================================
// 03 · Pix por fora (38,7–54,5)
// ============================================================
const PHW = 420, PHH = 860, PSC = mk(392 * 2, 832 * 2);
function drawPhoneScreen(f) {
  const t = f / FPS, g = PSC.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0);
  const w = 392, h = 832;
  g.fillStyle = '#EFEBE3'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, 130);
  g.fillStyle = '#C9D1CC'; circle(g, 56, 88, 26); g.fill();
  g.font = font(700, 24); g.fillStyle = INK; g.textBaseline = 'middle'; g.fillText('Colega de plantão', 96, 80);
  g.font = font(500, 16); g.fillStyle = '#7A857F'; g.fillText('online', 96, 106);
  const b1 = SP(f, 41.0, { k: 150, c: 15 });
  if (b1 > .01) {
    g.save(); g.translate(24, 190); g.scale(b1, b1); g.globalAlpha = clamp(b1 * 2);
    rr(g, 0, 0, 290, 130, [6, 24, 24, 24]); g.fillStyle = '#fff'; g.fill();
    g.font = font(600, 22); g.fillStyle = INK; ['Cobre meu plantão', 'sábado? Te passo', 'no Pix.'].forEach((l, i) => g.fillText(l, 20, 34 + i * 32));
    g.restore();
  }
  const b2 = SP(f, 42.05, { k: 150, c: 15 });
  if (b2 > .01) {
    g.save(); g.translate(w - 24, 360); g.scale(b2, b2); g.globalAlpha = clamp(b2 * 2);
    rr(g, -150, 0, 150, 60, [24, 6, 24, 24]); g.fillStyle = S.colors.dark; g.fill();
    g.font = font(700, 22); g.fillStyle = CREAM; g.fillText('Fechado!', -128, 31); g.restore();
  }
  // notificação Pix
  const n = PG(t, 42.65, 43.05, E.out5);
  if (n > 0) {
    g.save(); g.translate(0, lerp(-130, 0, n));
    rr(g, 14, 14, w - 28, 104, 22); g.fillStyle = 'rgba(16,24,20,.94)'; g.fill();
    g.fillStyle = GOLD; circle(g, 62, 66, 26); g.fill();
    g.font = font(800, 18); g.fillStyle = INK; g.textAlign = 'center'; g.fillText('Pix', 62, 67); g.textAlign = 'left';
    g.font = font(800, 20); g.fillStyle = GOLD; g.fillText('PIX RECEBIDO', 102, 48);
    g.font = font(700, 22); g.fillStyle = '#fff'; g.fillText('R$ 1.200 · na sua conta PF', 102, 80);
    g.restore();
  }
}
function phone(ctx, f, x, y, s, rot) {
  drawPhoneScreen(f);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.filter = blur(36); ctx.fillStyle = 'rgba(16,38,30,.3)'; rr(ctx, -PHW / 2 + 20, -PHH / 2 + 40, PHW - 40, PHH, 60); ctx.fill(); ctx.restore();
  rr(ctx, -PHW / 2, -PHH / 2, PHW, PHH, 60); ctx.fillStyle = '#121614'; ctx.fill();
  ctx.save(); rr(ctx, -196, -416, 392, 832, 46); ctx.clip(); ctx.drawImage(PSC, -196, -416, 392, 832); ctx.restore();
  rr(ctx, -50, -402, 100, 26, 13); ctx.fillStyle = '#121614'; ctx.fill();
  ctx.restore();
}
function stamp(ctx, f, txt, x, y, at, rot) {
  const s = SP(f, at, { k: 220, c: 16 }); if (s <= .01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lerp(1.6, 1, clamp(s)), lerp(1.6, 1, clamp(s))); ctx.globalAlpha = clamp(s * 2);
  ctx.font = font(400, 64, IMPACT); const w = ctx.measureText(txt).width + 48;
  ctx.strokeStyle = RED; ctx.lineWidth = 6; rr(ctx, -w / 2, -48, w, 96, 14); ctx.stroke();
  ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 4); ctx.restore();
}
function scenePix(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, false); chapters(ctx, f, 3, false);
  const pill = SP(f, 39.8, { k: 150, c: 14 });
  if (pill > .01) { ctx.save(); ctx.translate(120 + 150, 320); ctx.scale(pill, pill); rr(ctx, -150, -30, 300, 60, 30); ctx.fillStyle = GOLD; ctx.fill();
    ctx.font = font(800, 28); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('o mais comum', 0, 2); ctx.restore(); }
  const s = SP(f, 40.15, { k: 75, c: 14 }), dr = PG(t, 40, 46, E.lin);
  phone(ctx, f, CX + Math.sin(f / 45) * 8, lerp(2000, 880, s) - dr * 20, .95, lerp(.2, -.03, s) + Math.sin(f / 50) * .012);
  stamp(ctx, f, 'SEM NOTA', 300, 1400, 44.5, -.1);
  stamp(ctx, f, 'SEM REGISTRO', 760, 1500, 45.5, .07);
  ctx.restore();
}
function bankIcon(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-90, -40); ctx.lineTo(0, -95); ctx.lineTo(90, -40); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 5; i++) rr(ctx, -78 + i * 36, -28, 14, 90, 4), ctx.fill();
  rr(ctx, -95, 66, 190, 18, 6); ctx.fill(); ctx.restore();
}
function receitaIcon(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  rr(ctx, -70, -90, 130, 170, 14); ctx.stroke();
  [-50, -22, 6].forEach(yy => { ctx.beginPath(); ctx.moveTo(-44, yy); ctx.lineTo(34, yy); ctx.stroke(); });
  circle(ctx, 40, 50, 36); ctx.fillStyle = S.colors.dark; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(66, 76); ctx.lineTo(98, 108); ctx.stroke(); ctx.restore();
}
function sceneMalha(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true); chapters(ctx, f, 3, true, false);
  const ex = PG(t, 49.1, 49.5, E.inC);
  if (t < 49.7) {
    ctx.save(); ctx.globalAlpha = 1 - ex; ctx.filter = blur(ex * 24); ctx.translate(0, -ex * 120);
    const b = SP(f, 46.3, { k: 140, c: 14 }), r = SP(f, 46.9, { k: 140, c: 14 });
    if (b > .01) { bankIcon(ctx, 280, 600, b, CREAM); say(ctx, f, [['Banco']], { x: 280, y: 720, size: 40, at: 46.4, color: CREAM }); }
    dashArrow(ctx, f, 400, 560, 690, 560, 46.6, GOLD, .5, -.12);
    if (r > .01) { receitaIcon(ctx, 800, 600, r, CREAM); say(ctx, f, [['Receita']], { x: 800, y: 720, size: 40, at: 47.0, color: CREAM }); }
    say(ctx, f, [['O banco informa o que entra.']], { y: 880, size: 56, at: 47.9, color: CREAM });
    imp(ctx, f, [['A RECEITA CRUZA.', GOLD]], { y: 1030, size: 140, at: 48.65 });
    ctx.restore();
  }
  const dr = PG(t, 49.4, 54.5, E.lin);
  say(ctx, f, [['Caiu na malha:']], { y: 700, size: 62, at: 49.4, color: CREAM, drift: dr * 3 });
  imp(ctx, f, [['IMPOSTO DEVIDO', CREAM]], { y: 860, size: 128, at: 50.65, drift: dr * 4 });
  block(ctx, f, { y: 1040, w: 860, h: 170, at: 51.15 });
  imp(ctx, f, [['+ MULTA DE 75%', CREAM]], { y: 1048, size: 128, at: 51.25, drift: dr * 4 });
  imp(ctx, f, [['+ JUROS', GOLD]], { y: 1220, size: 128, at: 53.3 });
  say(ctx, f, [['Lei 9.430/1996, art. 44']], { y: 1350, size: 30, weight: 500, at: 52.2, color: 'rgba(242,237,227,.55)' });
  ctx.restore();
}

// ============================================================
// 04 · Fator R (54,5–74,6)
// ============================================================
function sceneAnexo(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, false); chapters(ctx, f, 4, false);
  const ex = PG(t, 67.0, 67.4, E.inC);
  if (t < 67.6) {
    ctx.save(); ctx.globalAlpha = 1 - ex; ctx.filter = blur(ex * 24); ctx.translate(0, -ex * 140);
    // pergunta enquanto a fala chega no Anexo
    say(ctx, f, [['Mesmo com CNPJ…']], { y: 560, size: 64, weight: 700, at: 55.9, color: INK, exit: PG(t, 59.0, 59.4, E.inC) });
    ser(ctx, f, [['imposto a mais?', RED]], { y: 670, size: 96, at: 57.6, exit: PG(t, 59.0, 59.4, E.inC) });
    say(ctx, f, [['ANEXO V', RED]], { y: 500, size: 42, weight: 800, at: 59.5, ls: 3 });
    imp(ctx, f, [['R$ 1.200 × 15,5%', INK]], { y: 610, size: 120, at: 60.1 });
    imp(ctx, f, [['= R$ 186', RED]], { y: 760, size: 150, at: 62.4 });
    say(ctx, f, [['ANEXO III · COM FATOR R', GREEN]], { y: 930, size: 42, weight: 800, at: 64.5, ls: 3 });
    imp(ctx, f, [['R$ 1.200 × 6%', INK]], { y: 1040, size: 120, at: 64.9 });
    imp(ctx, f, [['= R$ 72', GREEN]], { y: 1190, size: 150, at: 66.4 });
    ctx.restore();
  }
  if (t >= 67.2) {
    const dr = PG(t, 67.4, 72.2, E.lin);
    say(ctx, f, [['Em 10 plantões por mês:']], { y: 520, size: 58, weight: 700, at: 67.35, color: INK });
    const bars = [['Anexo V', 1860, RED, 67.9], ['Anexo III', 720, GREEN, 68.25]];
    bars.forEach(([lab, val, col, at], i) => {
      const y = 650 + i * 170, p = PG(t, at, at + .6, E.out5), wmax = 560, bw = wmax * val / 1860;
      say(ctx, f, [[lab]], { x: 140, y, size: 36, weight: 700, at, color: INK, align: 'left' });
      ctx.fillStyle = 'rgba(16,38,30,.08)'; rr(ctx, 140, y + 36, wmax, 60, 12); ctx.fill();
      if (p > 0) { ctx.fillStyle = col; rr(ctx, 140, y + 36, bw * p, 60, 12); ctx.fill(); }
      const va = PG(t, at + .45, at + .7, E.out5);
      if (va > 0) { ctx.save(); ctx.globalAlpha = va; ctx.font = font(400, 70, IMPACT); ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText('R$ ' + val.toLocaleString('pt-BR'), 140 + wmax + 24, y + 68); ctx.restore(); }
    });
    block(ctx, f, { y: 1080, w: 700, h: 210, at: 68.95, color: GOLD });
    imp(ctx, f, [['R$ 1.140', INK]], { y: 1090, size: 200, at: 69.05, drift: dr * 5 });
    ser(ctx, f, [['de diferença', INK]], { y: 1270, size: 92, at: 69.85 });
    imp(ctx, f, [['TODO MÊS.', RED]], { y: 1400, size: 110, at: 71.2 });
  }
  ctx.restore();
}
function sceneFator(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true); chapters(ctx, f, 4, true, false);
  const dr = PG(t, 72.2, 74.8, E.lin);
  say(ctx, f, [['E essa diferença tem nome:']], { y: 800, size: 60, at: 72.35, color: CREAM, drift: dr * 3 });
  const g = PG(t, 73.95, 74.4, E.out5);
  imp(ctx, f, [['FATOR R', GOLD]], { y: 1000, size: 250, at: 73.95, drift: dr * 6 });
  if (g > 0) { ctx.save(); ctx.globalAlpha = (1 - PG(t, 74.0, 74.8)) * .7; ctx.strokeStyle = GOLD; ctx.lineWidth = 6; rr(ctx, CX - 290 - g * 40, 860 - g * 30, 580 + g * 80, 280 + g * 60, 40); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// ============================================================
// FINAL · recapitulando + Comente PLANTÃO (74,6–82)
// ============================================================
const RECAP = [['01', 'RPA'], ['02', 'Sócio sem ler'], ['03', 'Pix por fora'], ['04', 'Fator R']];
function sceneFinal(ctx, f) {
  const t = f / FPS; ctx.save(); base(ctx, f, true); chapters(ctx, f, 4, true, false);
  const up = PG(t, 76.5, 77.1), dr = PG(t, 77, 82, E.lin);
  ctx.save(); ctx.translate(0, -up * 160); ctx.globalAlpha = 1 - up; ctx.filter = blur(up * 24);
  say(ctx, f, [['Recapitulando:', GOLD]], { y: 520, size: 52, weight: 700, at: 74.8, exit: up });
  RECAP.forEach(([n, lab], i) => {
    const x = i % 2 ? 760 : 320, y = i < 2 ? 700 : 940, s = SP(f, 75.0 + i * .3, { k: 170, c: 14 });
    if (s <= .01) return;
    ctx.save(); ctx.translate(x, y + Math.sin(f / 25 + i) * 5); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(242,237,227,.08)'; rr(ctx, -210, -90, 420, 180, 36); ctx.fill();
    ctx.fillStyle = GOLD; circle(ctx, -136, 0, 44); ctx.fill();
    ctx.font = font(400, 48, IMPACT); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, -136, 3);
    ctx.font = font(800, 36); ctx.fillStyle = CREAM; ctx.textAlign = 'left'; ctx.fillText(lab, -74, 3);
    ctx.restore();
  });
  ctx.restore();
  say(ctx, f, [['Comenta']], { y: 850, size: 68, weight: 700, at: 77.0, color: CREAM });
  const pulse = 1 + .03 * Math.sin(f / 7) * PG(t, 77.6, 78);
  ctx.save(); ctx.translate(CX, 1080); ctx.scale(pulse, pulse); ctx.translate(-CX, -1080);
  imp(ctx, f, [['PLANTÃO', GOLD]], { y: 1080, size: 270, at: 77.15, drift: dr * 6 });
  ctx.restore();
  for (let k = 0; k < 2; k++) {   // anéis saindo da palavra
    const p = t < 77.6 ? 0 : (((t - 77.6) / 1.6 + k * .5) % 1);
    if (p > 0) { ctx.save(); ctx.globalAlpha = (1 - p) * .45; ctx.strokeStyle = GOLD; ctx.lineWidth = 5; rr(ctx, CX - 380 - p * 80, 950 - p * 60, 760 + p * 160, 260 + p * 120, 130); ctx.stroke(); ctx.restore(); }
  }
  ser(ctx, f, [['que eu te chamo no direct.', CREAM]], { y: 1270, size: 84, at: 78.6, drift: dr * 4 });
  ctx.restore();
}

// ============================================================
// MONTAGEM
// ============================================================
const SC = [
  { a: F(0), fn: sceneHook }, { a: F(9.8), fn: sceneRPA }, { a: F(22.6), fn: sceneRPA2 },
  { a: F(26.9), fn: sceneSocio }, { a: F(32.8), fn: sceneCPF }, { a: F(38.7), fn: scenePix },
  { a: F(46.0), fn: sceneMalha }, { a: F(54.5), fn: sceneAnexo }, { a: F(72.1), fn: sceneFator }, { a: F(74.6), fn: sceneFinal },
];
const TR = [
  { a: F(9.8), b: F(10.3), x: 540, y: 1100 }, { a: F(22.6), b: F(23.0), x: 540, y: 1170 },
  { a: F(26.9), b: F(27.35), x: 540, y: 1280 }, { a: F(32.8), b: F(33.2), x: 400, y: 900 },
  { a: F(38.7), b: F(39.15), x: 540, y: 1130 }, { a: F(46.0), b: F(46.4), x: 540, y: 300 },
  { a: F(54.5), b: F(54.95), x: 540, y: 1230 }, { a: F(72.1), b: F(72.5), x: 540, y: 1090 },
  { a: F(74.6), b: F(75.0), x: 540, y: 1000, type: 'zoomblur' },
];
const BOARD = [
  [F(1.4), 'Gancho', 'PLANTÃO'], [F(4.6), 'PERDER dinheiro', ''], [F(9.6), 'O 3º é o mais COMUM', ''],
  [F(16.5), '01 RPA', '-11% INSS'], [F(22.0), '01 IR até 27,5%', ''], [F(26.3), '01 RPA riscado', 'pode pagar bem menos'],
  [F(32.8), '02 Contrato', 'cláusula circulada'], [F(37.9), '02 SEU CPF', ''], [F(43.6), '03 Pix', 'notificação'],
  [F(46.2), '03 Sem nota', 'carimbos'], [F(49.0), '03 Receita cruza', ''], [F(54.0), '03 Malha', 'multa 75% + juros'],
  [F(63.0), '04 Anexo V', ''], [F(67.0), '04 Anexo III', ''], [F(71.8), '04 R$ 1.140', 'barras'], [F(74.5), 'FATOR R', ''],
  [F(76.2), 'Recapitulando', ''], [F(81.5), 'Comenta PLANTÃO', ''],
];
