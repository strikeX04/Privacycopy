// ============================================================
// Cartão NFC de avaliação do Google · anúncio Meta (30s, vertical 1080x1920, 60fps)
// Narração (ElevenLabs, Ana Alice) começa no frame 12. Frames = tempo real da fala:
//   12 Você que tem um negócio · 103 Belém · 151 procura no Google · 256 a sua loja aparece?
//   341 quanto mais avaliações · 457 mais fácil o Google mostra · 624 mas pedir avaliação · 712 trabalho
//   804 com o cartão NFC · 960 aproximar o celular · 1066 a página de avaliação · 1141 abre na hora
//   1229 mais avaliações · 1316 mais gente encontrando · 1441 mais vendas · 1526 quer o seu cartão?
//   1605 entre em contato · 1686 WhatsApp (fim da fala ~1730)
// Área segura Reels: texto/botão entre y=270 e y=1250.
// ============================================================

const SFX = [
  ['swell', 20, .22, 0, { attack: .2 }],
  ['haptic', 46, .35, 0, { f: 100 }],
  ['typing', 156, .16, 0, { to: 236, step: 4.5 }],
  ['glasstaps', 250, .12, 0, { to: 290, step: 10 }],
  ['clicks', 345, .07, .2, { to: 425, step: 4 }],
  ['whoosh', 470, .2, 0, { dur: .5, f0: 300, f1: 3000, peak: .5 }],
  ['ping', 560, .26, 0, { f: 2350 }],
  ['whoosh', 612, .18, -.3, { dur: .4, f0: 600, f1: 4000, peak: .4 }],
  ['glass', 636, .22, .2, { freq: 3800 }],
  ['glasstaps', 712, .06, .2, { to: 760, step: 12 }],
  ['swell', 806, .22, 0, { attack: .3 }],
  ['haptic', 830, .4, 0, { f: 95 }],
  ['swell', 962, .3, 0, { attack: .35 }],
  ['haptic', 962, .55, 0, { f: 80 }],
  ['air', 966, .18, 0, { dur: .9 }],
  ['whoosh', 1040, .16, 0, { dur: .4, f0: 400, f1: 3200, peak: .4 }],
  ['glasstaps', 1146, .14, 0, { to: 1200, step: 11 }],
  ['ping', 1206, .26, 0, { f: 2350 }],
  ['whoosh', 1215, .18, .3, { dur: .45, f0: 300, f1: 3500, peak: .5 }],
  ['haptic', 1236, .35, 0, { f: 100 }],
  ['haptic', 1322, .35, 0, { f: 100 }],
  ['haptic', 1446, .45, 0, { f: 85 }],
  ['whoosh', 1515, .16, 0, { dur: .4, f0: 400, f1: 3000, peak: .4 }],
  ['swell', 1612, .3, 0, { attack: .4 }],
  ['haptic', 1622, .5, 0, { f: 85 }],
  ['click', 1696, .35, 0, { freq: 2200, dur: .03 }],
  ['ping', 1700, .3, 0, { f: 2350 }],
  ['air', 1700, .18, 0, { dur: 1 }],
];

// ---------- câmera em onda ----------
const CAM = [
  [0, 1.08, 540, 900, 0], [1.5, 1.0, 540, 960, 0], [4.2, 1.0, 540, 940, 0], [5.6, 1.06, 540, 900, -.005],
  [9.6, 1.02, 540, 960, 0], [11.4, 1.05, 540, 940, .005], [13.2, 1.0, 540, 960, 0], [15.6, 1.07, 560, 900, 0],
  [17.4, 1.0, 540, 960, 0], [19.4, 1.05, 540, 920, 0], [20.6, 1.0, 540, 960, 0], [24, 1.05, 540, 960, 0],
  [25.6, 1.0, 540, 960, 0], [28.2, 1.06, 540, 1050, 0], [30, 1.06, 540, 1040, 0],
];
const camW = camPath(CAM, { sigma: .3 });
const CX = W / 2, GOLD = B, GREEN = S.colors.green;
const YS = 1112, YB = 1205, PS = 1.18;   // PS: escala do celular   // linhas de texto (pequena / grande)

// ---------- utilidades ----------
function star(g, x, y, r, fill = 1, on = GOLD, off = 'rgba(14,21,37,.12)') {
  const path = () => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); };
  g.save(); g.lineJoin = 'round'; path(); g.fillStyle = off; g.fill();
  if (fill > 0) { g.save(); g.beginPath(); g.rect(x - r, y - r, 2 * r * clamp(fill), 2 * r); g.clip(); path(); g.fillStyle = on; g.fill(); g.restore(); }
  g.restore();
}
function stars(g, x, y, r, val, gap = 2.3, on, off) { for (let i = 0; i < 5; i++) star(g, x + i * r * gap, y, r, clamp(val - i), on, off); }
function txt(g, s, x, y, size, w = 600, color = K, align = 'left', fam = DISPLAY) {
  g.font = font(w, size, fam); g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);
}
function nfcWaves(g, x, y, s, color, a = 1, ph = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = color; g.lineCap = 'round'; g.lineWidth = 7;
  for (let i = 0; i < 3; i++) {
    g.globalAlpha = a * (.4 + .6 * (.5 + .5 * Math.sin(ph - i * 1.2)));
    g.beginPath(); g.arc(-18, 0, 18 + i * 16, -.9, .9); g.stroke();
  }
  g.restore();
}
// linha de texto centralizada (blur-in por palavra)
function line(ctx, f, parts, { y, size = 56, weight = 600, start = 0, exit = 0, color = K, drift = 0 }) {
  return words(ctx, f, parts, { x: CX, y, size, weight, start, color, exit, drift, dur: 28, stagger: 3, ls: -1 });
}

// ---------- celular (a tela é desenhada num canvas próprio) ----------
const PW = 360, PH = 740, SW = 332, SH = 712, SR = 2;
const scr = mk(SW * SR, SH * SR);
const SHOPS = [['Concorrente A', 4.8, 312], ['Concorrente B', 4.7, 205], ['Concorrente C', 4.6, 131], ['Sua Loja', 4.1, 12]];
const QUERY = 'loja perto de mim';

function screenSearch(g, f) {
  // barra de busca
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH);
  txt(g, '9:41', 30, 26, 15, 700);
  rr(g, 18, 56, SW - 36, 54, 27); g.fillStyle = '#F1F3F6'; g.fill();
  g.strokeStyle = '#5F6B7A'; g.lineWidth = 3; circle(g, 46, 81, 9); g.stroke();
  g.beginPath(); g.moveTo(53, 88); g.lineTo(60, 95); g.stroke();
  const n = Math.floor(prog(f, 156, 236, E.lin) * QUERY.length);
  const q = QUERY.slice(0, n);
  txt(g, q || 'Pesquisar', 74, 83, 20, 500, q ? K : '#8A94A3');
  if (n > 0 && n < QUERY.length || (f > 150 && f < 250 && Math.floor(f / 16) % 2 === 0)) {
    g.font = font(500, 20); g.fillStyle = O; g.fillRect(74 + g.measureText(q).width + 2, 70, 2.5, 26);
  }
  // mapa (antes dos resultados) → lista de resultados sobe
  const up = prog(f, 244, 290, E.smooth);
  g.save(); g.translate(0, -up * 60); g.globalAlpha = 1 - up;
  rr(g, 18, 130, SW - 36, 330, 22); g.fillStyle = '#E8EEF5'; g.fill(); g.save(); g.clip();
  g.strokeStyle = '#fff'; g.lineWidth = 12;
  [[0, 210, SW, 250], [0, 360, SW, 300], [110, 130, 160, 460], [240, 130, 210, 460]].forEach(([a, b2, c, d]) => { g.beginPath(); g.moveTo(a, b2); g.lineTo(c, d); g.stroke(); });
  [[90, 200], [200, 280], [270, 380], [70, 390]].forEach(([px, py], i) => {
    const s = spring(f, 40 + i * 8, { k: 160, c: 14 });
    g.save(); g.translate(px, py); g.scale(s, s); g.fillStyle = i === 3 ? '#9AA5B4' : '#E5484D';
    g.beginPath(); g.arc(0, -16, 12, Math.PI * .85, Math.PI * .15); g.lineTo(0, 4); g.closePath(); g.fill();
    g.fillStyle = '#fff'; circle(g, 0, -16, 4.5); g.fill(); g.restore();
  });
  g.restore(); g.restore();
  if (up <= 0) return;
  // resultados: Sua Loja ganha avaliações e sobe para o 1º lugar
  const grow = prog(f, 345, 425, E.smooth), climb = prog(f, 468, 540, E.smooth);
  SHOPS.forEach(([name, r0, n0], i) => {
    const me = i === 3;
    const slot = me ? lerp(3, 0, climb) : i + climb;
    const appear = prog(f, 246 + i * 10, 276 + i * 10, E.out5);
    const y = 140 + slot * 128 + (1 - appear) * 40;
    g.save(); g.globalAlpha = appear;
    rr(g, 18, y, SW - 36, 112, 20);
    g.fillStyle = me ? (climb > .5 ? 'rgba(31,111,229,.10)' : '#fff') : '#fff'; g.fill();
    g.strokeStyle = me ? `rgba(31,111,229,${.25 + .55 * prog(f, 268, 290)})` : 'rgba(14,21,37,.08)'; g.lineWidth = me ? 3 : 2;
    if (me && climb < .02) g.setLineDash([10, 8]);
    g.stroke(); g.setLineDash([]);
    g.fillStyle = me ? O : '#D7DEE8'; rr(g, 34, y + 20, 72, 72, 18); g.fill();
    if (me) txt(g, 'SL', 70, y + 57, 26, 800, '#fff', 'center');
    const rating = me ? lerp(r0, 4.8, grow) : r0, count = me ? Math.round(lerp(n0, 148, grow)) : n0;
    txt(g, name, 122, y + 36, 21, 700, me ? K : '#3B4656');
    txt(g, rating.toFixed(1).replace('.', ','), 122, y + 72, 18, 700, '#3B4656');
    stars(g, 168, y + 71, 9, rating, 2.2);
    txt(g, `(${count})`, 268, y + 72, 17, 500, me && grow > 0 ? O : '#8A94A3');
    if (me && f > 548) {
      const b = spring(f, 550, { k: 200, c: 15 });
      g.save(); g.translate(SW - 52, y + 30); g.scale(b, b); g.fillStyle = O; rr(g, -26, -16, 52, 32, 16); g.fill();
      txt(g, '1º', 0, 1, 18, 800, '#fff', 'center'); g.restore();
    }
    g.restore();
  });
}
function screenChat(g, f) {
  g.fillStyle = '#EEF1F5'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, 110);
  txt(g, '9:41', 30, 26, 15, 700);
  g.fillStyle = '#C9D2DE'; circle(g, 50, 74, 22); g.fill();
  txt(g, 'Cliente', 84, 66, 20, 700); txt(g, 'visto por último hoje', 84, 90, 14, 500, '#8A94A3');
  // balão enviado
  const s = spring(f, 634, { k: 140, c: 15 });
  if (s > .01) {
    g.save(); g.translate(SW - 24, 200); g.scale(s, s); g.globalAlpha = clamp(s * 2);
    rr(g, -250, -46, 250, 152, [22, 22, 6, 22]); g.fillStyle = O; g.fill();
    txt(g, 'Oi! Pode avaliar', -228, -14, 19, 600, '#fff');
    txt(g, 'a gente no Google?', -228, 12, 19, 600, '#fff');
    rr(g, -232, 34, 214, 50, 12); g.fillStyle = 'rgba(255,255,255,.18)'; g.fill();
    txt(g, 'link da avaliação', -216, 59, 16, 500, '#fff');
    g.restore();
    // ✓✓ visto
    const v = prog(f, 680, 696);
    g.save(); g.globalAlpha = v; g.strokeStyle = O; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
    [0, 9].forEach(dx => { g.beginPath(); g.moveTo(SW - 70 + dx, 330); g.lineTo(SW - 64 + dx, 336); g.lineTo(SW - 54 + dx, 324); g.stroke(); });
    txt(g, 'Visto', SW - 80, 331, 14, 600, '#8A94A3', 'right'); g.restore();
  }
  // "digitando…" aparece e some (ninguém responde)
  const ty = prog(f, 700, 712) * (1 - prog(f, 756, 770));
  if (ty > 0) {
    g.save(); g.globalAlpha = ty; rr(g, 24, 372, 92, 50, 25); g.fillStyle = '#fff'; g.fill();
    [0, 1, 2].forEach(i => { g.fillStyle = '#9AA5B4'; circle(g, 50 + i * 20, 397 + Math.sin(f / 6 - i) * 3, 5); g.fill(); });
    g.restore();
  }
  // relógio girando
  const ck = prog(f, 740, 760, E.out5);
  if (ck > 0) {
    g.save(); g.globalAlpha = ck; g.translate(SW / 2, 520); g.scale(ck, ck);
    g.strokeStyle = '#9AA5B4'; g.lineWidth = 6; g.lineCap = 'round'; circle(g, 0, 0, 40); g.stroke();
    const a = f / 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); g.moveTo(0, 0); g.lineTo(Math.cos(a / 12) * 16, Math.sin(a / 12) * 16); g.stroke();
    g.restore();
  }
}
function screenTap(g, f) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH);
  txt(g, '9:41', 30, 26, 15, 700);
  const a = prog(f, 820, 850);
  g.save(); g.globalAlpha = a;
  nfcWaves(g, SW / 2 + 10, 300, 2.2, O, 1, f / 6);
  txt(g, 'Aproxime do cartão', SW / 2, 430, 22, 700, K, 'center');
  g.restore();
}
function screenReview(g, f) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, SW, SH);
  txt(g, '9:41', 30, 26, 15, 700);
  g.fillStyle = O; circle(g, SW / 2, 130, 44); g.fill();
  txt(g, 'SL', SW / 2, 131, 30, 800, '#fff', 'center');
  txt(g, 'Sua Loja', SW / 2, 206, 26, 800, K, 'center');
  txt(g, 'Avalie sua experiência', SW / 2, 240, 17, 500, '#6B7686', 'center');
  for (let i = 0; i < 5; i++) {
    const p = prog(f, 1146 + i * 11, 1158 + i * 11, E.out5), bump = 1 + .25 * Math.sin(Math.PI * p);
    g.save(); g.translate(64 + i * 51, 310); g.scale(bump, bump); star(g, 0, 0, 21, p); g.restore();
  }
  rr(g, 24, 362, SW - 48, 150, 18); g.strokeStyle = 'rgba(14,21,37,.14)'; g.lineWidth = 2; g.stroke();
  txt(g, 'Conte como foi a sua visita', 44, 394, 16, 500, '#8A94A3');
  const pb = prog(f, 1190, 1210);
  rr(g, 24, 540, SW - 48, 62, 31); g.fillStyle = pb > 0 ? O : 'rgba(31,111,229,.35)'; g.fill();
  txt(g, 'Publicar', SW / 2, 572, 20, 700, '#fff', 'center');
}
function drawScreen(f) {
  const g = scr.getContext('2d');
  g.setTransform(SR, 0, 0, SR, 0, 0); g.clearRect(0, 0, SW, SH);
  if (f < 612) return screenSearch(g, f);
  if (f < 640) {   // busca desliza para a esquerda, conversa entra
    const p = E.inOutC(prog(f, 612, 640));
    g.save(); g.translate(-p * SW, 0); screenSearch(g, f); g.restore();
    g.save(); g.translate((1 - p) * SW, 0); screenChat(g, f); g.restore(); return;
  }
  if (f < 800) return screenChat(g, f);
  if (f < 975) return screenTap(g, f);
  const p = E.smooth(prog(f, 975, 1010));   // página de avaliação sobe por cima
  screenTap(g, f);
  g.save(); g.translate(0, (1 - p) * SH); screenReview(g, f); g.restore();
}
function phoneAt(ctx, f, x, y, s, rot) {
  drawScreen(f);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * PS, s * PS);
  ctx.save(); ctx.filter = blur(40); ctx.fillStyle = 'rgba(14,21,37,.28)'; rr(ctx, -PW / 2 + 20, -PH / 2 + 50, PW - 40, PH, 64); ctx.fill(); ctx.restore();
  rr(ctx, -PW / 2, -PH / 2, PW, PH, 62); ctx.fillStyle = '#11151C'; ctx.fill();
  ctx.save(); rr(ctx, -SW / 2, -SH / 2, SW, SH, 48); ctx.clip(); ctx.drawImage(scr, -SW / 2, -SH / 2, SW, SH); ctx.restore();
  rr(ctx, -46, -SH / 2 + 12, 92, 26, 13); ctx.fillStyle = '#11151C'; ctx.fill();
  ctx.restore();
}

// ---------- cartão NFC (desenho próprio, sem logo do Google) ----------
const CW = 620, CH = 390, card = mk(CW * 2, CH * 2);
let cardReady = false;
function buildCard() {   // desenhado só depois das fontes carregarem
  cardReady = true;
  const g = card.getContext('2d'); g.scale(2, 2);
  rr(g, 0, 0, CW, CH, 34); g.save(); g.clip();
  g.fillStyle = '#fff'; g.fillRect(0, 0, CW, CH);
  g.fillStyle = '#1F6FE5'; g.beginPath(); g.moveTo(230, 0); g.lineTo(CW, 0); g.lineTo(CW, CH); g.lineTo(300, CH);
  g.bezierCurveTo(200, 260, 200, 120, 230, 0); g.fill();
  // lado branco: selo NFC
  rr(g, 46, 214, 120, 120, 26); g.fillStyle = '#11151C'; g.fill();
  nfcWaves(g, 112, 274, 1.25, '#fff');
  txt(g, 'Aproxime', 106, 120, 24, 800, K, 'center');
  txt(g, 'seu celular', 106, 150, 20, 600, '#5F6B7A', 'center');
  // lado azul
  txt(g, 'Avalie a gente', 430, 120, 30, 600, '#fff', 'center');
  txt(g, 'no Google', 430, 168, 46, 800, '#fff', 'center');
  stars(g, 340, 238, 17, 5, 2.6, GOLD, 'rgba(255,255,255,.3)');
  g.restore();
}
function nfcCard(ctx, x, y, s, rot, a = 1) {
  if (a <= 0 || s <= 0) return;
  if (!cardReady) buildCard();
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.filter = blur(36); ctx.fillStyle = 'rgba(14,21,37,.25)'; rr(ctx, -CW / 2 + 30, -CH / 2 + 40, CW - 60, CH, 34); ctx.fill(); ctx.restore();
  ctx.drawImage(card, -CW / 2, -CH / 2, CW, CH);
  ctx.restore();
}

// ---------- botão do WhatsApp ----------
function waGlyph(g, x, y, r) {
  g.save(); g.translate(x, y); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = r * .16; g.lineJoin = 'round';
  g.beginPath(); g.arc(0, 0, r, Math.PI * .72, Math.PI * .62 + TAU); g.lineTo(-r * 1.02, r * 1.02); g.closePath(); g.stroke();
  // fone
  g.save(); g.rotate(-.75); rr(g, -r * .42, -r * .16, r * .84, r * .32, r * .16); g.fill(); g.restore();
  g.restore();
}
function waButton(ctx, f, { y, start }) {
  const pw = prog(f, start, start + 20, E.smooth), ph = spring(f, start + 6, { k: 120, c: 14 });
  if (pw <= 0) return;
  const press = 1 - .06 * Math.sin(Math.PI * prog(f, 1690, 1706));
  const w = lerp(150, 780, pw), h = lerp(150, 150, ph), s = press * (1 + .03 * prog(f, 1706, 1800, E.lin));
  ctx.save(); ctx.translate(CX, y); ctx.scale(s, s);
  for (let k = 0; k < 2; k++) {   // anéis de pulso depois do toque
    const p = prog(f, 1700 + k * 30, 1760 + k * 30, E.outC);
    if (p > 0 && p < 1) { ctx.save(); ctx.globalAlpha = (1 - p) * .5; ctx.strokeStyle = GREEN; ctx.lineWidth = 6; rr(ctx, -w / 2 - p * 40, -h / 2 - p * 40, w + p * 80, h + p * 80, h / 2 + p * 40); ctx.stroke(); ctx.restore(); }
  }
  ctx.save(); ctx.shadowColor = 'rgba(37,211,102,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 14;
  rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = GREEN; ctx.fill(); ctx.restore();
  const ta = prog(f, start + 16, start + 34, E.out5);
  ctx.globalAlpha = ta; ctx.filter = blur((1 - ta) * 10);
  waGlyph(ctx, -w / 2 + 92, 0, 34);
  ctx.font = font(800, 52); ctx.letterSpacing = '-1.5px'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Chamar no WhatsApp', -w / 2 + 154 + (1 - ta) * 20, 2);
  ctx.restore();
}

// ---------- pílulas "mais avaliações → mais clientes → mais vendas" ----------
const PILLS = [['Mais avaliações', 1232], ['Mais clientes', 1319], ['Mais vendas', 1444]];
function pills(ctx, f, ex) {
  PILLS.forEach(([t, st], i) => {
    const y = 940 + i * 112, s = spring(f, st, { k: 120, c: 14 });
    if (s <= .01) return;
    const last = i === 2, w = lerp(90, last ? 560 : 520, clamp(s)), h = 92;
    ctx.save(); ctx.globalAlpha = clamp(s * 2) * (1 - ex); ctx.filter = blur(ex * 20); ctx.translate(CX, y - ex * 40);
    if (i > 0) { ctx.fillStyle = 'rgba(14,21,37,.15)'; ctx.fillRect(-2, -h / 2 - 26 * clamp(s), 4, 26 * clamp(s)); }
    ctx.shadowColor = 'rgba(14,21,37,.12)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = last ? O : '#fff'; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    const ta = prog(f, st + 8, st + 26, E.out5);
    ctx.globalAlpha *= ta;
    ctx.font = font(800, 44); ctx.letterSpacing = '-1px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = last ? '#fff' : K; ctx.fillText(t, last ? -22 : 0, 2);
    if (last) {   // seta de crescimento
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const k = prog(f, st + 20, st + 44, E.smooth); ctx.setLineDash([120 * k, 300]);
      ctx.beginPath(); ctx.moveTo(180, 20); ctx.lineTo(205, -2); ctx.lineTo(222, 10); ctx.lineTo(250, -18); ctx.stroke();
      ctx.setLineDash([]); if (k > .9) { ctx.beginPath(); ctx.moveTo(234, -18); ctx.lineTo(250, -18); ctx.lineTo(250, -2); ctx.stroke(); }
    }
    ctx.restore();
  });
}

// ============================================================
// PLANO ÚNICO
// ============================================================
function scene(ctx, f) {
  ctx.save(); bg(ctx, f, false);
  applyCamPath(ctx, camW, f / FPS, { cx: CX, cy: H / 2, drift: .0012 });

  // --- celular: busca → conversa → toque no cartão → avaliação (20–1250) ---
  if (f < 1260) {
    const enter = spring(f, 14, { k: 70, c: 14 });
    let x = CX, y = lerp(1500, 610, enter) - prog(f, 40, 800, E.lin) * 20, s = 1, rot = Math.sin(f / 80) * .015;
    // vai para cima à direita, desce no cartão (toque em 960), volta ao centro
    const up = prog(f, 806, 860, E.smooth), dn = prog(f, 926, 962, E.inOutC), back = prog(f, 1000, 1052, E.smooth);
    x = lerp(x, 760, up); y = lerp(y, 420, up); s = lerp(1, .7, up); rot = lerp(rot, .32, up);
    x = lerp(x, 640, dn); y = lerp(y, 610, dn); rot = lerp(rot, .12, dn);
    x = lerp(x, CX, back); y = lerp(y, 610, back); s = lerp(s, 1, back); rot = lerp(rot, Math.sin(f / 80) * .015, back);
    const out = prog(f, 1212, 1250, E.inC);
    y -= out * 1300; rot -= out * .15;
    // cartão NFC (embaixo do celular durante o toque)
    const ci = spring(f, 812, { k: 90, c: 14 }), co = prog(f, 1006, 1046, E.inC);
    nfcCard(ctx, CX - 30 + co * 200, lerp(1250, 830, ci) + co * 600, .95 + .03 * prog(f, 812, 1000, E.lin), lerp(-.25, -.06, ci) + co * .3, clamp(ci * 2) * (1 - co));
    // ondas NFC no ponto de contato
    for (let k = 0; k < 3; k++) {
      const p = prog(f, 958 + k * 14, 1010 + k * 14, E.outC);
      if (p > 0 && p < 1) { ctx.save(); ctx.globalAlpha = (1 - p) * .7; ctx.strokeStyle = O; ctx.lineWidth = 8; circle(ctx, 610, 760, 60 + p * 300); ctx.stroke(); ctx.restore(); }
    }
    layer(ctx, 1, out * 24, L => phoneAt(L, f, x, y, s, rot));
  }

  // --- textos (pequeno em YS, grande em YB) ---
  const T = [
    [12, 140, [['Você que tem um negócio']], [['aqui em'], ['Belém', O]], 56],
    [150, 330, [['quando alguém procura no Google,']], [['a sua loja'], ['aparece?', O]], 250],
    [341, 612, [['Quanto mais avaliações,']], [['mais'], ['destaque', O]], 455],
    [624, 794, [['Mas pedir avaliação']], [['dá'], ['trabalho…', O]], 705],
    [804, 1056, [['Com o cartão NFC,']], [['é só'], ['aproximar', O]], 935],
    [1066, 1212, [['a página de avaliação']], [['abre'], ['na hora.', O]], 1132],
  ];
  T.forEach(([a, b2, sm, bg2, bs]) => {
    if (f < a - 2 || f > b2 + 24) return;
    const ex = prog(f, b2, b2 + 18, E.inC), dr = prog(f, a, b2 + 18, E.lin);
    line(ctx, f, sm, { y: YS - dr * 10, size: 52, start: a, exit: ex, color: 'rgba(14,21,37,.72)', drift: dr * 3 });
    line(ctx, f, bg2, { y: YB - dr * 12, size: 100, weight: 800, start: bs, exit: ex, drift: dr * 5 });
  });

  // --- foto do cartão real + pílulas (1215–1530) e chamada final ---
  const IMGF = IMG('cartao-foto.jpg');
  if (f >= 1214 && IMGF) {
    const ins = spring(f, 1216, { k: 80, c: 14 }), fin = prog(f, 1512, 1560, E.smooth);
    const w = lerp(470, 330, fin), h = w * IMGF.height / IMGF.width;
    const x = lerp(CX + 700, CX, ins), y = lerp(560, 480, fin) - prog(f, 1216, 1800, E.lin) * 14;
    const rot = lerp(.18, -.035, ins) + Math.sin(f / 70) * .012;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.save(); ctx.filter = blur(40); ctx.fillStyle = 'rgba(14,21,37,.3)'; rr(ctx, -w / 2 + 20, -h / 2 + 40, w - 40, h, 36); ctx.fill(); ctx.restore();
    rr(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 40); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 32); ctx.clip(); ctx.drawImage(IMGF, -w / 2, -h / 2, w, h); ctx.restore();
    // selo "o cartão de verdade"
    const tg = spring(f, 1246, { k: 140, c: 14 });
    ctx.save(); ctx.translate(-w / 2 + 30, h / 2 - 10); ctx.scale(tg, tg); ctx.rotate(-.04);
    rr(ctx, 0, -30, 300, 60, 30); ctx.fillStyle = K; ctx.fill();
    txt(ctx, 'Cartão NFC real', 150, 1, 28, 700, '#fff', 'center'); ctx.restore();
    ctx.restore();
    pills(ctx, f, prog(f, 1508, 1532, E.inC));
  }
  if (f >= 1520) {
    const dr = prog(f, 1526, 1800, E.lin);
    line(ctx, f, [['Quer o seu']], { y: 800 - dr * 10, size: 64, start: 1526, color: 'rgba(14,21,37,.75)', drift: dr * 3 });
    line(ctx, f, [['cartão?', O]], { y: 905 - dr * 12, size: 130, weight: 800, start: 1556, drift: dr * 5 });
    line(ctx, f, [['Fale com a gente:']], { y: 1018 - dr * 10, size: 44, start: 1604, color: 'rgba(14,21,37,.6)', drift: dr * 3 });
    waButton(ctx, f, { y: 1150 - dr * 8, start: 1608 });
  }
  ctx.restore();
}

// ============================================================
// MONTAGEM
// ============================================================
const SC = [{ a: 0, fn: scene }];
const TR = [];
const BOARD = [
  [120, 'Belém', 'celular entra com o mapa'], [300, 'A sua loja aparece?', 'Sua Loja lá embaixo'],
  [430, '+ avaliações', '12 → 148, nota sobe'], [590, '1º lugar', 'Sua Loja sobe na lista'],
  [770, 'Pedir dá trabalho', 'mensagem sem resposta'], [900, 'Cartão NFC', 'celular vai até o cartão'],
  [985, 'Toque', 'ondas NFC'], [1205, 'Abre na hora', 'estrelas preenchidas'],
  [1330, 'Cartão real', 'foto + mais clientes'], [1490, 'Mais vendas', ''],
  [1640, 'Quer o seu?', 'botão WhatsApp nasce'], [1790, 'Final', 'botão pulsando'],
];
