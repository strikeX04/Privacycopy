// Mercado Livre: caixa abre, produtos viram pacotes, galpão se monta e vira o logo.
// Tudo depende só do tempo t. Nada de Math.random() ou relógio dentro das cenas.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ===================== CONFIGURAÇÃO =====================
const CONFIG = { largura: 1080, altura: 1920, fps: 30, duracao: 11, bpm: 112, semente: 7 };
const STORYBOARD = [0.3, 1.0, 2.2, 3.3, 3.95, 4.6, 5.3, 6.9, 7.95, 8.6, 9.3, 10.5];
const L = CONFIG.largura, A = CONFIG.altura;

const COR = {
  fundo: '#f2b900', kraft: '#c99459', kraftDentro: '#a8784a', navy: '#2d3277', navyEsc: '#1f255e',
  marca: '#ffe600', asfalto: '#56524e', concreto: '#9a968f', parede: '#f3b800', saco: '#f5c000',
};

// ===================== AJUDANTES =====================
function rng(semente) { let a = semente >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const limita = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mistura = (a, b, p) => a + (b - a) * p;
const progresso = (t, ini, dur) => limita((t - ini) / dur);
const suave = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const saida = (p) => 1 - Math.pow(1 - p, 3);
const entrada = (p) => p * p * p;
const salto = (p) => { const c = 1.70158; return p <= 0 ? 0 : p >= 1 ? 1 : 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const elastico = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI) / 3) + 1);
const sino = (t, centro, larg) => Math.exp(-Math.pow((t - centro) / larg, 2));

// trilho suave entre chaves [tempo, valor], sem passar do ponto (Hermite monotônico)
function trilho(chaves) {
  const n = chaves.length;
  const tan = (j) => {
    if (j <= 0 || j >= n - 1) return 0;
    const d0 = (chaves[j][1] - chaves[j - 1][1]) / (chaves[j][0] - chaves[j - 1][0]);
    const d1 = (chaves[j + 1][1] - chaves[j][1]) / (chaves[j + 1][0] - chaves[j][0]);
    if (d0 * d1 <= 0) return 0;
    const m = (d0 + d1) / 2, lim = 3 * Math.min(Math.abs(d0), Math.abs(d1));
    return Math.sign(m) * Math.min(Math.abs(m), lim);
  };
  return (t) => {
    if (t <= chaves[0][0]) return chaves[0][1];
    if (t >= chaves[n - 1][0]) return chaves[n - 1][1];
    let i = 0; while (t > chaves[i + 1][0]) i++;
    const [t0, v0] = chaves[i], [t1, v1] = chaves[i + 1], h = t1 - t0, u = (t - t0) / h;
    const m0 = tan(i) * h, m1 = tan(i + 1) * h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
  };
}

const mat = (color, roughness = 0.6, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
function malha(geo, m, sombra = true) { const o = new THREE.Mesh(geo, m); o.castShadow = sombra; o.receiveShadow = true; return o; }
function textura(w, h, desenho, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); desenho(g, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function ruido(g, w, h, n, cores, semente, tam = 2) {
  const r = rng(semente);
  for (let i = 0; i < n; i++) { g.fillStyle = cores[Math.floor(r() * cores.length)]; g.fillRect(r() * w, r() * h, tam * (0.5 + r()), tam * (0.5 + r())); }
}

// ===================== LOGO (desenhado em código, trocável pela imagem do usuário) =====================
// Se existir window.LOGO_EMBLEMA (imagem do símbolo) ou window.LOGO_COMPLETO, eles entram no lugar do desenho.
function maoAperto(g, cx, cy, rx, ry, cor, linha, lw) {
  const P = (x, y) => [cx + x * rx, cy + y * ry];
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = linha; g.fillStyle = cor;
  // mão da esquerda (vem de baixo à esquerda)
  g.beginPath();
  g.moveTo(...P(-0.98, 0.05)); g.lineTo(...P(-0.62, -0.28));
  g.bezierCurveTo(...P(-0.45, -0.42), ...P(-0.22, -0.40), ...P(-0.05, -0.30));
  g.lineTo(...P(0.42, -0.02));
  g.bezierCurveTo(...P(0.52, 0.05), ...P(0.46, 0.17), ...P(0.34, 0.14));
  g.lineTo(...P(0.05, 0.02));
  g.lineTo(...P(-0.22, 0.30));
  g.bezierCurveTo(...P(-0.38, 0.42), ...P(-0.58, 0.42), ...P(-0.70, 0.36));
  g.lineTo(...P(-0.98, 0.42));
  g.closePath(); if (cor) g.fill(); g.stroke();
  // mão da direita (vem de cima à direita, dedos por cima)
  g.beginPath();
  g.moveTo(...P(0.98, -0.12)); g.lineTo(...P(0.66, -0.34));
  g.bezierCurveTo(...P(0.48, -0.46), ...P(0.26, -0.44), ...P(0.10, -0.36));
  g.lineTo(...P(-0.32, -0.12));
  g.bezierCurveTo(...P(-0.44, -0.05), ...P(-0.38, 0.08), ...P(-0.26, 0.06));
  g.lineTo(...P(-0.02, -0.06));
  g.lineTo(...P(-0.16, 0.12));
  g.bezierCurveTo(...P(-0.22, 0.22), ...P(-0.10, 0.30), ...P(0.00, 0.22));
  g.lineTo(...P(0.14, 0.10));
  g.lineTo(...P(0.02, 0.28));
  g.bezierCurveTo(...P(-0.02, 0.38), ...P(0.12, 0.42), ...P(0.20, 0.33));
  g.lineTo(...P(0.34, 0.17));
  g.bezierCurveTo(...P(0.44, 0.30), ...P(0.62, 0.22), ...P(0.66, 0.12));
  g.lineTo(...P(0.98, 0.30));
  g.closePath(); if (cor) g.fill(); g.stroke();
  g.restore();
}
// estilo 'cor' = logo colorido; 'linha' = impresso numa cor só (caixa, saquinho)
function emblema(g, cx, cy, w, h, estilo = 'cor', tinta = COR.navy) {
  const rx = w / 2, ry = h / 2;
  if (estilo === 'cor' && window.LOGO_EMBLEMA) { g.drawImage(window.LOGO_EMBLEMA, cx - rx, cy - ry, w, h); return; }
  if (estilo === 'linha' && window.LOGO_LINHA) { g.drawImage(tingir(window.LOGO_LINHA, tinta), cx - rx, cy - ry, w, h); return; }
  g.save();
  if (estilo === 'cor') {
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = COR.navy; g.fill();
    g.beginPath(); g.ellipse(cx, cy, rx * 0.93, ry * 0.9, 0, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
    g.beginPath(); g.ellipse(cx, cy, rx * 0.88, ry * 0.82, 0, 0, Math.PI * 2); g.fillStyle = COR.marca; g.fill();
    maoAperto(g, cx, cy, rx * 0.88, ry * 0.82, '#ffffff', COR.navy, h * 0.045);
  } else {
    g.beginPath(); g.ellipse(cx, cy, rx * 0.96, ry * 0.94, 0, 0, Math.PI * 2); g.lineWidth = h * 0.07; g.strokeStyle = tinta; g.stroke();
    maoAperto(g, cx, cy, rx * 0.86, ry * 0.8, null, tinta, h * 0.05);
  }
  g.restore();
}
const _tintas = new Map();
function tingir(img, cor) {
  const k = img.src.length + cor; if (_tintas.has(k)) return _tintas.get(k);
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d');
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = cor; g.fillRect(0, 0, c.width, c.height);
  _tintas.set(k, c); return c;
}
const NOME_ASPECTO = window.LOGO_NOME ? window.LOGO_NOME.width / window.LOGO_NOME.height : 2.53;
function marcaTexto(g, x, y, tam, cor, sombra = false) {
  if (window.LOGO_NOME) {
    const h = tam * 1.58, w = h * NOME_ASPECTO;
    g.save(); if (sombra) { g.shadowColor = 'rgba(80,50,0,0.35)'; g.shadowBlur = tam * 0.05; g.shadowOffsetY = tam * 0.03; }
    g.drawImage(tingir(window.LOGO_NOME, cor), x, y - tam * 0.74, w, h); g.restore(); return;
  }
  g.save(); g.fillStyle = cor; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.font = '800 ' + tam + 'px Inter, "Inter Display", sans-serif';
  try { g.letterSpacing = (-tam * 0.035) + 'px'; } catch (e) {}
  if (sombra) { g.shadowColor = 'rgba(80,50,0,0.35)'; g.shadowBlur = tam * 0.05; g.shadowOffsetY = tam * 0.03; }
  g.fillText('mercado', x, y); g.fillText('livre', x, y + tam * 0.86);
  g.restore();
}

// ===================== PALCO =====================
const tela = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(L, A, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;
renderer.localClippingEnabled = true;
const cena = new THREE.Scene();
cena.background = new THREE.Color(COR.fundo);
const camera = new THREE.PerspectiveCamera(28, L / A, 0.1, 300);
const pm = new THREE.PMREMGenerator(renderer);
cena.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
const LUZ = Object.assign({ ceu: 0.45, sol: 3.3, fill: 0.12, env: 0.3, persiana: 0.62, ang: -0.55 }, window.LUZ_TESTE || {});

// luz: céu quente, chão amarelo, e um refletor com a sombra da janela (persiana)
cena.add(new THREE.HemisphereLight(0xfff3dc, 0xd29a00, LUZ.ceu));
const listras = textura(1024, 1024, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  g.filter = 'blur(11px)'; g.fillStyle = 'rgba(0,0,0,' + LUZ.persiana + ')';
  g.translate(w / 2, h / 2); g.rotate(LUZ.ang);
  for (let i = -24; i < 24; i++) g.fillRect(-w, i * 60, w * 2, 24 + (Math.abs(i) % 3) * 7);
}, false);
const refletor = new THREE.SpotLight(0xfff0d0, LUZ.sol, 0, 0.5, 0.75, 0);
refletor.position.set(9, 20, 15); refletor.target.position.set(0, 0.6, -3);
refletor.map = listras; refletor.castShadow = true;
refletor.shadow.mapSize.set(2048, 2048); refletor.shadow.bias = -0.0003; refletor.shadow.normalBias = 0.02;
refletor.shadow.camera.near = 10; refletor.shadow.camera.far = 60;
cena.add(refletor, refletor.target);
const preenche = new THREE.DirectionalLight(0xfff6e6, LUZ.fill); preenche.position.set(-8, 6, 10); cena.add(preenche);

// fundo infinito: chão que curva e vira parede
(function ciclorama() {
  const perfil = [];
  for (let z = 60; z > -7; z -= 3) perfil.push([z, 0]);
  const R = 7; for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI / 2; perfil.push([-7 - Math.sin(a) * R, R - Math.cos(a) * R]); }
  for (let y = R + 3; y <= 80; y += 6) perfil.push([-7 - R, y]);
  const pos = [], idx = [];
  perfil.forEach(([z, y]) => { pos.push(-80, y, z, 80, y, z); });
  for (let j = 0; j < perfil.length - 1; j++) { const a = j * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = malha(geo, mat(COR.fundo, 0.9, 0, { envMapIntensity: 0.35 }), false);
  cena.add(m);
})();

const mundo = new THREE.Group(); cena.add(mundo);
const ST = 0.25, PT = 0.33; // topo da base do galpão e topo do palete

// ===================== CAIXA =====================
const CX = { W: 1.0, H: 0.7, D: 0.75, e: 0.02 };
function kraftBase(g, w, h, semente) {
  g.fillStyle = COR.kraft; g.fillRect(0, 0, w, h);
  ruido(g, w, h, 2500, ['rgba(120,80,40,0.10)', 'rgba(255,230,190,0.10)'], semente, 3);
  g.fillStyle = 'rgba(110,70,30,0.12)'; for (let x = 0; x < w; x += 9) g.fillRect(x, 0, 2, h);
}
const texFrente = textura(1000, 700, (g, w, h) => {
  kraftBase(g, w, h, 11);
  g.fillStyle = '#1c1a19'; g.fillRect(0, 210, 135, 330);
  g.save(); g.translate(68, 375); g.rotate(-Math.PI / 2); g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = '600 26px Inter'; g.textAlign = 'center'; g.fillText('OK, frágil', 0, 8); g.restore();
  g.fillStyle = 'rgba(235,215,180,0.85)'; g.fillRect(455, 0, 90, 110);
  emblema(g, 455, 385, 190, 130, 'linha', '#2b2c48');
  marcaTexto(g, 575, 375, 84, '#2b2c48');
  g.fillStyle = '#2b2c48'; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) g.fillRect(925 + j * 14, 300 + i * 22, 6, 6);
});
const texLado = textura(750, 700, (g, w, h) => {
  kraftBase(g, w, h, 12);
  g.fillStyle = '#1c1a19'; g.fillRect(w - 110, 210, 110, 330);
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.font = '600 24px Inter'; g.fillText('↑ ↑', w - 92, 260);
});
const texLiso = textura(750, 700, (g, w, h) => { kraftBase(g, w, h, 13); emblema(g, w * 0.36, h * 0.5, 150, 104, 'linha', '#2b2c48'); marcaTexto(g, w * 0.36 + 95, h * 0.5 - 5, 62, '#2b2c48'); });
const texAba = (fita) => textura(512, 768, (g, w, h) => {
  kraftBase(g, w, h, 14 + fita);
  if (fita) { g.fillStyle = 'rgba(238,220,188,0.9)'; const x = fita > 0 ? w - 70 : 0; g.fillRect(x, 0, 70, h); }
});
const mKraft = mat(COR.kraft, 0.85), mDentro = mat(COR.kraftDentro, 0.9);
const mf = (tex) => mat(0xffffff, 0.82, 0, { map: tex });

const caixa = new THREE.Group(); mundo.add(caixa);
const caixaCorpo = new THREE.Group(); caixa.add(caixaCorpo);
function painel(w, h, d, mats, x, y, z) { const m = malha(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); caixaCorpo.add(m); return m; }
{
  const { W, H, D, e } = CX;
  const arr = (i, m) => { const a = [mDentro, mDentro, mDentro, mDentro, mDentro, mDentro]; a[i] = m; return a; };
  painel(W, H, e, arr(4, mf(texFrente)), 0, H / 2, D / 2 - e / 2);
  painel(W, H, e, arr(5, mf(texLiso)), 0, H / 2, -D / 2 + e / 2);
  painel(e, H, D, arr(1, mf(texLado)), -W / 2 + e / 2, H / 2, 0);
  painel(e, H, D, arr(0, mf(texLiso)), W / 2 - e / 2, H / 2, 0);
  painel(W, e, D, mKraft, 0, e / 2, 0);
}
// abas: as compridas giram nas bordas esquerda/direita (a fita fica na emenda do meio)
const abas = [];
function aba(px, py, pz, eixo, sinal, w, d, offx, offz, mTopo, abre) {
  const piv = new THREE.Group(); piv.position.set(px, py, pz); caixaCorpo.add(piv);
  const mats = [mKraft, mKraft, mTopo, mDentro, mKraft, mKraft];
  const m = malha(new THREE.BoxGeometry(w, CX.e, d), mats); m.position.set(offx, 0, offz); piv.add(m);
  abas.push({ piv, eixo, sinal, abre });
}
{
  const { W, H, D } = CX;
  aba(-W / 2, H + 0.012, 0, 'z', 1, W / 2, D, W / 4, 0, mf(texAba(1)), 2.1);
  aba(W / 2, H + 0.012, 0, 'z', -1, W / 2, D, -W / 4, 0, mf(texAba(-1)), 2.1);
  aba(0, H - 0.005, D / 2, 'x', 1, W * 0.96, D * 0.42, 0, -D * 0.21, mKraft, 1.95);
  aba(0, H - 0.005, -D / 2, 'x', -1, W * 0.96, D * 0.42, 0, D * 0.21, mKraft, 1.95);
}

// ===================== PRODUTOS =====================
function tenis() {
  const g = new THREE.Group();
  const branco = mat('#f6f6f4', 0.5), sola = mat('#e6e3dc', 0.75), navy = mat(COR.navy, 0.5), cinza = mat('#d9d9d9', 0.8);
  const s = malha(new RoundedBoxGeometry(0.62, 0.075, 0.23, 3, 0.03), sola); s.position.y = 0.035; g.add(s);
  const corpo = malha(new THREE.SphereGeometry(0.5, 40, 20), branco); corpo.scale.set(0.58, 0.2, 0.205); corpo.position.set(0.0, 0.075, 0); g.add(corpo);
  const calc = malha(new THREE.SphereGeometry(0.5, 32, 20), branco); calc.scale.set(0.26, 0.3, 0.2); calc.position.set(-0.16, 0.12, 0); g.add(calc);
  const lingua = malha(new THREE.SphereGeometry(0.5, 24, 16), branco); lingua.scale.set(0.2, 0.12, 0.13); lingua.position.set(-0.02, 0.16, 0); lingua.rotation.z = 0.5; g.add(lingua);
  const tab = malha(new RoundedBoxGeometry(0.05, 0.14, 0.17, 2, 0.02), navy); tab.position.set(-0.28, 0.13, 0); g.add(tab);
  const faixa = malha(new RoundedBoxGeometry(0.2, 0.035, 0.212, 2, 0.015), navy); faixa.position.set(-0.08, 0.09, 0); faixa.rotation.z = 0.45; g.add(faixa);
  const boca = malha(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24), cinza); boca.scale.set(1.3, 1, 0.9); boca.position.set(-0.15, 0.265, 0); g.add(boca);
  for (let i = 0; i < 3; i++) { const c = malha(new THREE.BoxGeometry(0.012, 0.008, 0.11), branco); c.position.set(0.02 + i * 0.04, 0.17 - i * 0.012, 0); c.rotation.z = 0.35; g.add(c); }
  g.scale.setScalar(0.78);
  return g;
}
function halter() {
  const g = new THREE.Group();
  const cromo = mat('#d6d9dc', 0.22, 1), preto = mat('#1d1d1f', 0.42, 0.1);
  const cil = (r, h, m, x) => { const c = malha(new THREE.CylinderGeometry(r, r, h, 36), m); c.rotation.z = Math.PI / 2; c.position.x = x; g.add(c); };
  cil(0.022, 0.46, cromo, 0);
  [-1, 1].forEach((s) => { cil(0.1, 0.045, preto, s * 0.125); cil(0.088, 0.04, preto, s * 0.168); cil(0.034, 0.03, cromo, s * 0.205); });
  return g;
}
function celular() {
  const g = new THREE.Group();
  g.add(malha(new RoundedBoxGeometry(0.17, 0.34, 0.022, 4, 0.02), mat('#141416', 0.25, 0.4)));
  const tela = textura(256, 512, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b3442'); gr.addColorStop(0.45, '#0b0d12'); gr.addColorStop(1, '#1a2230');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); c.moveTo(0, h * 0.15); c.lineTo(w, h * 0.0); c.lineTo(w, h * 0.22); c.lineTo(0, h * 0.42); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.roundRect(w * 0.38, 14, w * 0.24, 16, 8); c.fill();
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.158, 0.326), mat(0xffffff, 0.08, 0.2, { map: tela })); p.position.z = 0.0115; g.add(p);
  return g;
}
function bola() {
  const geo = new THREE.SphereGeometry(0.16, 72, 48); const pos = geo.attributes.position, cores = [];
  const f = (1 + Math.sqrt(5)) / 2;
  const ico = [[0, 1, f], [0, 1, -f], [0, -1, f], [0, -1, -f], [1, f, 0], [1, -f, 0], [-1, f, 0], [-1, -f, 0], [f, 0, 1], [f, 0, -1], [-f, 0, 1], [-f, 0, -1]].map((v) => new THREE.Vector3(...v).normalize());
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let melhor = -1; ico.forEach((c) => { melhor = Math.max(melhor, v.dot(c)); });
    const ang = Math.acos(Math.min(1, melhor));
    const k = ang < 0.33 ? 0.05 : (ang < 0.36 ? 0.5 : 0.96);
    cores.push(k, k, k * 0.99);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
  const g = new THREE.Group(); g.add(malha(geo, mat(0xffffff, 0.38, 0, { vertexColors: true }))); return g;
}
function garrafa() {
  const g = new THREE.Group();
  const corpo = malha(new THREE.CylinderGeometry(0.066, 0.066, 0.3, 40), mat('#86c3e3', 0.12, 0, { transparent: true, opacity: 0.88, envMapIntensity: 1.4 })); corpo.position.y = 0; g.add(corpo);
  const fundo = malha(new THREE.CylinderGeometry(0.067, 0.067, 0.03, 40), mat('#5f9fc4', 0.3)); fundo.position.y = -0.14; g.add(fundo);
  const ombro = malha(new THREE.CylinderGeometry(0.05, 0.066, 0.04, 40), mat('#86c3e3', 0.12, 0, { transparent: true, opacity: 0.88 })); ombro.position.y = 0.17; g.add(ombro);
  const tampa = malha(new THREE.CylinderGeometry(0.052, 0.052, 0.07, 40), mat('#21445e', 0.35)); tampa.position.y = 0.22; g.add(tampa);
  const alca = malha(new THREE.TorusGeometry(0.035, 0.009, 12, 32), mat('#21445e', 0.35)); alca.position.set(0, 0.27, 0); g.add(alca);
  g.scale.setScalar(1.05);
  return g;
}

// ===================== SAQUINHOS AMARELOS =====================
function travesseiro(w, h, d) {
  const g = new THREE.BoxGeometry(1, 1, 1, 28, 28, 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const fx = Math.max(0, 1 - Math.pow(Math.abs(2 * x), 3)), fy = Math.max(0, 1 - Math.pow(Math.abs(2 * y), 4));
    const inf = Math.pow(fx * fy, 0.6);
    z = z * (0.06 + 0.94 * inf);
    x *= 1 - 0.05 * (1 - fy) * (z === 0 ? 0 : 1);
    p.setXYZ(i, x * w, y * h, z * d);
  }
  g.computeVertexNormals(); return g;
}
const texSaco = (fita, semente) => textura(512, 640, (g, w, h) => {
  g.fillStyle = COR.saco; g.fillRect(0, 0, w, h);
  const r = rng(semente);
  for (let i = 0; i < 14; i++) { g.strokeStyle = r() < 0.5 ? 'rgba(255,240,170,0.35)' : 'rgba(170,110,0,0.18)'; g.lineWidth = 3 + r() * 8; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.bezierCurveTo(x + r() * 80 - 40, h * 0.3, x + r() * 80 - 40, h * 0.6, x + r() * 60 - 30, h); g.stroke(); }
  g.fillStyle = 'rgba(150,100,0,0.25)'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26);
  if (fita) { g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(0, h * 0.55, w, 56); }
  emblema(g, w * 0.3, h * 0.3, 120, 84, 'linha', COR.navy);
  marcaTexto(g, w * 0.3 + 72, h * 0.3 - 4, 52, COR.navy);
});
const saquinhos = [];
function saquinho(w, h, d, fita, semente) {
  const m = mat(0xffffff, 0.32, 0, { map: texSaco(fita, semente), envMapIntensity: 1.1 });
  const lat = mat(COR.saco, 0.32, 0, { envMapIntensity: 1.1 });
  const o = malha(travesseiro(w, h, d), [lat, lat, lat, lat, m, m]);
  const g = new THREE.Group(); g.add(o); mundo.add(g); return g;
}

// ===================== PRODUTOS NO AR =====================
const PRODUTOS = [
  // objeto, posição no ar, rotação no ar, tempo em que vira saquinho, saquinho [w,h,d,fita], posição deitado no palete, giro deitado
  { obj: tenis(), ar: [-0.6, 1.78, 0.12], rot: [0.1, -0.5, -0.45], vira: 2.72, saco: [0.42, 0.34, 0.15, false], chao: [-0.78, 0.30], giro: 0.35 },
  { obj: halter(), ar: [-0.12, 2.2, -0.1], rot: [0.2, -0.3, 0.12], vira: 3.02, saco: [0.44, 0.26, 0.14, false], chao: [-0.66, -0.46], giro: 0.95 },
  { obj: celular(), ar: [0.44, 2.0, -0.02], rot: [0.05, -0.55, -0.22], vira: 3.12, saco: [0.26, 0.4, 0.1, false], chao: [0.72, -0.44], giro: -0.25 },
  { obj: bola(), ar: [-0.08, 1.42, 0.2], rot: [0.4, 0.3, 0.1], vira: 2.9, saco: [0.4, 0.44, 0.2, true], chao: [0.02, 'topo'], giro: 0.2 },
  { obj: garrafa(), ar: [0.46, 1.08, 0.22], rot: [0.0, 0.0, -0.28], vira: 3.28, saco: [0.3, 0.46, 0.12, false], chao: [0.76, 0.34], giro: -0.45 },
];
const EXTRA = { ar: [0.5, 1.55, -0.32], rot: [0.1, -0.4, 0.25], vira: 3.05, saco: [0.36, 0.3, 0.13, false], chao: [0.0, -0.68], giro: 0.1 };
PRODUTOS.forEach((p, i) => { mundo.add(p.obj); p.bag = saquinho(...p.saco, 100 + i); });
EXTRA.bag = saquinho(...EXTRA.saco, 200);

// ===================== CONFETE =====================
const NCONF = 420;
const confete = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.03, 0.017), mat(0xffffff, 0.35, 0.35, { side: THREE.DoubleSide }), NCONF);
confete.castShadow = true; mundo.add(confete);
const DADOS_CONF = [];
{
  const r = rng(77); const paleta = ['#ffffff', '#f2f2f2', '#c9ccd2', COR.navy, '#3a4290', '#ffd84a', '#1b1b1b', '#e9e4d6'];
  for (let i = 0; i < NCONF; i++) {
    const a = r() * Math.PI * 2, hor = 0.25 + r() * 1.5, vy = 2.2 + r() * 3.6;
    DADOS_CONF.push({ t0: 1.2 + r() * 0.14, p0: [(r() - 0.5) * 0.5, 0.6, (r() - 0.5) * 0.4], v: [Math.cos(a) * hor, vy, Math.sin(a) * hor * 0.6], giro: [(r() - 0.5) * 14, (r() - 0.5) * 14, (r() - 0.5) * 14], fase: r() * 6.28, esc: 0.7 + r() * 0.6 });
    confete.setColorAt(i, new THREE.Color(paleta[Math.floor(r() * paleta.length)]));
  }
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

// ===================== GALPÃO =====================
const galpao = new THREE.Group(); mundo.add(galpao);
const B = { x0: -3.4, x1: 3.4, z0: -3.2, z1: 2.4, H: 2.3 };
// base: asfalto com cantos arredondados, faixa amarela tracejada, pátio de concreto e esteiras
const texBase = textura(2048, 2048, (g, w, h) => {
  const k = w / 10, X = (x) => (x + 5) * k, Z = (z) => (z + 4.6) * k;
  g.fillStyle = COR.asfalto; g.fillRect(0, 0, w, h);
  ruido(g, w, h, 30000, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.06)'], 5, 3);
  g.strokeStyle = '#f2c200'; g.lineWidth = 12; g.setLineDash([60, 44]);
  g.beginPath(); g.roundRect(X(-4.55), Z(-4.15), 9.1 * k, 9.1 * k, 0.5 * k); g.stroke(); g.setLineDash([]);
  g.fillStyle = COR.concreto; g.beginPath(); g.roundRect(X(-3.9), Z(-3.7), 7.8 * k, 7.8 * k, 0.25 * k); g.fill();
  ruido(g, w, h, 9000, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)'], 6, 4);
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 6; for (let x = -3.6; x < 3.8; x += 1.0) { g.beginPath(); g.moveTo(X(x), Z(2.5)); g.lineTo(X(x), Z(3.9)); g.stroke(); }
  // chão de dentro e esteiras
  g.fillStyle = '#7d7a75'; g.fillRect(X(B.x0), Z(B.z0), (B.x1 - B.x0) * k, (B.z1 - B.z0) * k);
  g.fillStyle = '#2f343d';
  g.fillRect(X(-0.35), Z(B.z0), 0.7 * k, (0 - B.z0) * k); g.fillRect(X(0), Z(-0.3), (B.x1 - 0) * k, 0.6 * k); g.fillRect(X(B.x0), Z(0.6), 3.4 * k, 0.6 * k);
  g.fillStyle = '#ffffff'; for (let z = B.z0; z < 0; z += 0.3) { g.fillRect(X(-0.37), Z(z), 6, 0.15 * k); g.fillRect(X(0.33), Z(z), 6, 0.15 * k); }
  // listras de atenção na frente das docas
  [0.2, 1.3, 2.4].forEach((dx) => {
    g.save(); g.beginPath(); g.rect(X(dx - 0.4), Z(2.5), 0.8 * k, 0.55 * k); g.clip();
    g.fillStyle = '#f2c200'; g.fillRect(X(dx - 0.4), Z(2.5), 0.8 * k, 0.55 * k); g.fillStyle = '#222';
    for (let i = -6; i < 10; i++) { g.beginPath(); g.moveTo(X(dx - 0.4) + i * 40, Z(2.5)); g.lineTo(X(dx - 0.4) + i * 40 + 20, Z(2.5)); g.lineTo(X(dx - 0.4) + i * 40 + 20 + 112, Z(3.05)); g.lineTo(X(dx - 0.4) + i * 40 + 112, Z(3.05)); g.fill(); }
    g.restore();
  });
});
texBase.repeat.set(0.1, 0.1); texBase.offset.set(0.5, 0.5); texBase.wrapS = texBase.wrapT = THREE.ClampToEdgeWrapping;
const base = new THREE.Group(); galpao.add(base);
{
  const sh = new THREE.Shape(); const r = 0.6, s = 5;
  sh.moveTo(-s + r, -s); sh.lineTo(s - r, -s); sh.quadraticCurveTo(s, -s, s, -s + r); sh.lineTo(s, s - r); sh.quadraticCurveTo(s, s, s - r, s);
  sh.lineTo(-s + r, s); sh.quadraticCurveTo(-s, s, -s, s - r); sh.lineTo(-s, -s + r); sh.quadraticCurveTo(-s, -s, -s + r, -s);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: ST, bevelEnabled: false, curveSegments: 10 });
  geo.rotateX(-Math.PI / 2); geo.translate(0, 0, 0.4);
  base.add(malha(geo, [mat(0xffffff, 0.85, 0, { map: texBase }), mat('#3c3936', 0.9)]));
}
const palete = malha(new RoundedBoxGeometry(1.9, PT - ST, 1.7, 2, 0.02), mat('#3a3f4a', 0.6, 0.2)); palete.position.y = (PT + ST) / 2; galpao.add(palete);
{
  const roloMat = mat('#9aa0a8', 0.3, 0.8);
  for (let i = 0; i < 9; i++) { const c = malha(new THREE.CylinderGeometry(0.018, 0.018, 1.6, 10), roloMat); c.rotation.x = Math.PI / 2; c.position.set(-0.85 + i * 0.21, PT - 0.005, 0); palete.add(c); c.position.y -= palete.position.y; }
}
// paredes com gomos horizontais
const texGomo = (rx, ry) => { const t = textura(256, 256, (g, w, h) => {
  g.fillStyle = COR.parede; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(160,100,0,0.32)'; g.fillRect(0, y, w, 4); g.fillStyle = 'rgba(255,235,150,0.4)'; g.fillRect(0, y + 4, w, 3); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
const paredes = [];
const mNavy = mat(COR.navy, 0.45, 0.1);
function parede(comp, eixo, x, z) {
  const piv = new THREE.Group(); piv.position.set(x, ST, z); galpao.add(piv);
  const geo = eixo === 'x' ? new THREE.BoxGeometry(comp, B.H, 0.12) : new THREE.BoxGeometry(0.12, B.H, comp);
  const mp = mat(0xffffff, 0.55, 0.05, { map: texGomo(comp / 2, B.H * 3.2 / 2) });
  const m = malha(geo, mp); m.position.y = B.H / 2; piv.add(m);
  const faixa = malha(eixo === 'x' ? new THREE.BoxGeometry(comp + 0.02, 0.16, 0.14) : new THREE.BoxGeometry(0.14, 0.16, comp + 0.02), mNavy); faixa.position.y = 0.08; piv.add(faixa);
  paredes.push(piv); return piv;
}
const pFundo = parede(B.x1 - B.x0, 'x', 0, B.z0);
const pDir = parede(B.z1 - B.z0, 'z', B.x1, (B.z0 + B.z1) / 2);
const pEsq = parede(B.z1 - B.z0, 'z', B.x0, (B.z0 + B.z1) / 2);
const pFrente = parede(B.x1 - B.x0, 'x', 0, B.z1);
// docas na frente: portas de enrolar, molduras azuis, niveladoras
const texPorta = textura(128, 256, (g, w, h) => { g.fillStyle = '#d9dcdf'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 14) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(0, y, w, 3); } });
[0.2, 1.3, 2.4].forEach((dx, i) => {
  const xl = dx;
  const porta = malha(new THREE.BoxGeometry(0.66, i === 1 ? 0.5 : 0.95, 0.02), mat(0xffffff, 0.5, 0.3, { map: texPorta }));
  porta.position.set(xl, i === 1 ? 0.72 : 0.55, 0.075); pFrente.add(porta);
  if (i === 1) { const vao = malha(new THREE.BoxGeometry(0.66, 0.45, 0.02), mat('#6f6c66', 0.9)); vao.position.set(xl, 0.27, 0.07); pFrente.add(vao); }
  const fr = (w, h, x, y) => { const m = malha(new THREE.BoxGeometry(w, h, 0.06), mNavy); m.position.set(x, y, 0.08); pFrente.add(m); };
  fr(0.07, 1.12, xl - 0.37, 0.56); fr(0.07, 1.12, xl + 0.37, 0.56); fr(0.81, 0.08, xl, 1.1);
  const niv = malha(new THREE.BoxGeometry(0.62, 0.05, 0.42), mat('#8e8b86', 0.6, 0.4)); niv.position.set(xl, 0.025, 0.27); pFrente.add(niv);
});
// placa com o logo na quina da frente
const texPlaca = textura(800, 300, (g, w, h) => { g.fillStyle = COR.parede; g.fillRect(0, 0, w, h); emblema(g, 150, 150, 230, 160, 'cor'); marcaTexto(g, 290, 140, 108, COR.navy); });
const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.41), mat(0xffffff, 0.5, 0, { map: texPlaca })); placa.position.set(2.62, 1.82, 0.064); pFrente.add(placa);
// pilares azuis na lateral esquerda
const pilares = [];
for (let i = 0; i < 10; i++) {
  const piv = new THREE.Group(); piv.position.set(B.x0 - 0.1, ST, B.z0 + 0.1 + i * 0.6); galpao.add(piv);
  const m = malha(new THREE.BoxGeometry(0.14, B.H + 0.28, 0.16), mNavy); m.position.y = (B.H + 0.28) / 2; piv.add(m); pilares.push(piv);
}
for (let i = 0; i < 6; i++) {
  const piv = new THREE.Group(); piv.position.set(B.x0 + 0.1 + i * 0.6, ST, B.z1 + 0.1); galpao.add(piv);
  const m = malha(new THREE.BoxGeometry(0.16, B.H + 0.28, 0.14), mNavy); m.position.y = (B.H + 0.28) / 2; piv.add(m); pilares.push(piv);
}
// telhado: tampa que fecha articulada na borda de trás, com o logo pintado
const telhadoPiv = new THREE.Group(); telhadoPiv.position.set(0, ST + B.H, B.z0 - 0.06); galpao.add(telhadoPiv);
const telhado = malha(new THREE.BoxGeometry(B.x1 - B.x0 + 0.24, 0.12, B.z1 - B.z0 + 0.24), mat('#f6c000', 0.5, 0.05)); telhado.position.set(0, 0.06, (B.z1 - B.z0 + 0.24) / 2); telhadoPiv.add(telhado);
const EMB_ASP = window.LOGO_EMBLEMA ? window.LOGO_EMBLEMA.height / window.LOGO_EMBLEMA.width : 0.69;
const texEmb = textura(1024, Math.round(1024 * EMB_ASP), (g, w, h) => emblema(g, w / 2, h / 2, w, h, 'cor'));
const DEC = { w: 2.9, h: 2.9 * EMB_ASP };
const decal = new THREE.Mesh(new THREE.PlaneGeometry(DEC.w, DEC.h), mat(0xffffff, 0.45, 0, { map: texEmb, transparent: true }));
decal.rotation.x = -Math.PI / 2; decal.position.set(0, 0.125, (B.z1 - B.z0 + 0.24) / 2); decal.receiveShadow = true; telhadoPiv.add(decal);

// van amarela
function van() {
  const g = new THREE.Group(); const amar = mat('#f6c100', 0.35, 0.1), vidro = mat('#1d2430', 0.08, 0.6), pneu = mat('#1a1a1a', 0.8);
  const bau = malha(new RoundedBoxGeometry(0.78, 0.5, 0.46, 3, 0.05), amar); bau.position.set(-0.12, 0.36, 0); g.add(bau);
  const cab = malha(new RoundedBoxGeometry(0.34, 0.36, 0.45, 3, 0.07), amar); cab.position.set(0.38, 0.29, 0); g.add(cab);
  const capo = malha(new RoundedBoxGeometry(0.16, 0.2, 0.44, 3, 0.05), amar); capo.position.set(0.52, 0.2, 0); g.add(capo);
  const pb = malha(new THREE.BoxGeometry(0.02, 0.15, 0.4), vidro); pb.position.set(0.53, 0.41, 0); pb.rotation.z = -0.5; g.add(pb);
  const jan = malha(new THREE.BoxGeometry(0.2, 0.13, 0.455), vidro); jan.position.set(0.37, 0.4, 0); g.add(jan);
  const luz = mat('#ffffff', 0.2, 0, { emissive: '#fff6d0', emissiveIntensity: 1.5 });
  [-0.15, 0.15].forEach((z) => { const f = malha(new THREE.BoxGeometry(0.02, 0.04, 0.07), luz); f.position.set(0.605, 0.22, z); g.add(f); });
  const tras = mat('#ff2a2a', 0.3, 0, { emissive: '#ff0000', emissiveIntensity: 1.2 });
  [-0.19, 0.19].forEach((z) => { const f = malha(new THREE.BoxGeometry(0.02, 0.1, 0.04), tras); f.position.set(-0.515, 0.3, z); g.add(f); });
  const logoVan = textura(400, 200, (c, w, h) => { c.fillStyle = '#f6c100'; c.fillRect(0, 0, w, h); emblema(c, 80, 100, 110, 76, 'cor'); marcaTexto(c, 150, 92, 58, COR.navy); });
  const lv = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), mat(0xffffff, 0.4, 0, { map: logoVan })); lv.position.set(-0.12, 0.38, 0.232); g.add(lv);
  const rodas = [];
  [[0.42, 0.2], [0.42, -0.2], [-0.3, 0.2], [-0.3, -0.2]].forEach(([x, z]) => { const r = malha(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 24), pneu); r.rotation.x = Math.PI / 2; r.position.set(x, 0.09, z); g.add(r); rodas.push(r); });
  g.userData.rodas = rodas; g.scale.setScalar(1.15); return g;
}
const vanA = van(); mundo.add(vanA);

// ===================== LOGO FINAL =====================
const logo = new THREE.Group(); cena.add(logo);
const disco = new THREE.Group(); logo.add(disco);
{
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 96); geo.scale(1, 1, EMB_ASP); geo.rotateX(Math.PI / 2);
  disco.add(malha(geo, mat(COR.navy, 0.4, 0.1), false));
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(1, EMB_ASP), mat(0xffffff, 0.35, 0, { map: texEmb, transparent: true }));
  frente.position.z = 0.0305; disco.add(frente);
}
const corte = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -10);
const NOME_W = 1.43, NOME_H = NOME_W / NOME_ASPECTO;
const texMarca = textura(1600, Math.round(1600 / NOME_ASPECTO) + 24, (g, w, h) => { g.save(); g.shadowColor = 'rgba(80,50,0,0.3)'; g.shadowBlur = 6; g.shadowOffsetY = 6; g.drawImage(window.LOGO_NOME ? tingir(window.LOGO_NOME, COR.navy) : g.canvas, 0, 6, w, w / NOME_ASPECTO); g.restore(); });
const palavra = new THREE.Mesh(new THREE.PlaneGeometry(NOME_W, NOME_W * (Math.round(1600 / NOME_ASPECTO) + 24) / 1600), mat(0xffffff, 0.4, 0, { map: texMarca, transparent: true, clippingPlanes: [corte] }));
logo.add(palavra);
const LOGO_Y = 1.05, DISCO_W = 0.9;

// ===================== CÂMERA =====================
const CAM = {
  az: trilho([[0, -28], [3.3, -24], [3.8, -24], [4.9, -36], [5.7, -46], [7.5, -40], [8.45, 0], [11, 0]]),
  el: trilho([[0, 9], [3.3, 10], [3.8, 10], [4.25, 16], [4.9, 26], [5.7, 30], [7.5, 29], [8.45, 3.5], [11, 3.5]]),
  R: trilho([[0, 10.6], [1.1, 10.2], [1.7, 10.7], [3.3, 10.4], [4.25, 10.6], [7.5, 10.4], [8.45, 10.6], [11, 10.6]]),
  ty: trilho([[0, 0.92], [1.1, 0.92], [1.7, 1.3], [3.3, 1.3], [3.8, 1.2], [4.25, 0.62], [4.9, 0.45], [5.7, 0.34], [7.5, 0.33], [8.45, LOGO_Y], [11, LOGO_Y]]),
  tz: trilho([[0, 0], [4.25, 0], [5.7, 0.06], [7.5, 0.06], [8.45, 0]]),
  s: trilho([[0, 1], [3.85, 1], [4.25, 0.8], [4.6, 0.52], [4.95, 0.37], [5.5, 0.27], [5.9, 0.25], [7.5, 0.24]]),
};

// ===================== DESENHO DE UM QUADRO =====================
const quat = (x, y, z, ordem = 'XYZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, ordem));
function bezier(p0, p1, p2, p3, u) { const a = 1 - u; return [0, 1].map((k) => a * a * a * p0[k] + 3 * a * a * u * p1[k] + 3 * a * u * u * p2[k] + u * u * u * p3[k]); }

function atualiza(t) {
  // câmera e escala do mundo (o mundo encolhe enquanto a câmera "se afasta")
  const s = CAM.s(t); mundo.scale.setScalar(s);
  const az = THREE.MathUtils.degToRad(CAM.az(t)), el = THREE.MathUtils.degToRad(CAM.el(t)), R = CAM.R(t);
  const alvo = new THREE.Vector3(0, CAM.ty(t), CAM.tz(t));
  camera.position.set(alvo.x + R * Math.cos(el) * Math.sin(az), alvo.y + R * Math.sin(el), alvo.z + R * Math.cos(el) * Math.cos(az));
  camera.lookAt(alvo);

  // ---- caixa ----
  const { W, H } = CX;
  let cx = 0, cy = 0, rz = 0, rx = 0, ry = -0.05, sy = 1;
  const pe = progresso(t, 0, 0.55);
  cx = mistura(3.6, 0, saida(pe));
  rz = 0.16 * Math.sin(Math.PI * progresso(t, 0.3, 0.45)) * (t < 0.75 ? 1 : 0) + 0.025 * Math.sin((t - 0.75) * 14) * Math.exp(-(t - 0.75) * 5) * (t > 0.75 ? 1 : 0);
  ry = mistura(-0.35, -0.05, saida(pe));
  sy = 1 - 0.09 * sino(t, 1.12, 0.06) + 0.06 * sino(t, 1.28, 0.07);
  // sobe flutuando, depois cai no palete
  const sobe = suave(progresso(t, 3.3, 0.45)), cai = entrada(progresso(t, 3.82, 0.3));
  cy = mistura(0, 0.55, sobe); cy = mistura(cy, PT, cai);
  rx = 0.07 * Math.sin(Math.PI * progresso(t, 3.3, 0.55)); rz += -0.05 * Math.sin(Math.PI * progresso(t, 3.35, 0.6));
  sy *= 1 - 0.07 * sino(t, 4.15, 0.05);
  caixa.position.set(cx, cy + Math.abs(Math.sin(rz)) * W / 2, 0);
  caixa.rotation.set(rx, ry, rz); caixaCorpo.scale.set(1 + (1 - sy) * 0.5, sy, 1 + (1 - sy) * 0.5);
  caixa.visible = t < 6.2;
  // abas: abrem com estouro, ficam balançando, fecham antes da queda
  const abre = salto(progresso(t, 1.18, 0.3)), fecha = suave(progresso(t, 3.28, 0.32));
  abas.forEach((a, i) => {
    const ang = a.abre * abre * (1 - fecha) + 0.06 * Math.sin(t * 7 + i) * Math.exp(-Math.max(0, t - 1.5) * 2) * abre * (1 - fecha);
    if (a.eixo === 'z') a.piv.rotation.z = a.sinal * ang; else a.piv.rotation.x = a.sinal * ang;
  });

  // ---- produtos e saquinhos ----
  const todos = [...PRODUTOS, EXTRA];
  todos.forEach((p, i) => {
    const tl = 1.22 + 0.035 * i, voo = salto(progresso(t, tl, 0.5)), bob = 0.035 * Math.sin(t * 1.8 + i * 1.3);
    const ar = [mistura(0, p.ar[0], voo), mistura(0.45, p.ar[1], voo) + bob * voo, mistura(0, p.ar[2], voo)];
    const giro = (1 - saida(progresso(t, tl, 0.7))) * 4.0;
    const deriva = 0.12 * Math.sin(t * 0.9 + i);
    if (p.obj) {
      const some = progresso(t, p.vira, 0.12);
      p.obj.visible = t > tl && some < 1;
      p.obj.position.set(ar[0], ar[1], ar[2]);
      p.obj.rotation.set(p.rot[0] + giro * 0.6, p.rot[1] + giro + deriva, p.rot[2] + giro * 0.3);
      p.obj.scale.setScalar(mistura(0.5, 1, voo) * (1 - entrada(some)) * (p === PRODUTOS[0] ? 0.78 : p === PRODUTOS[4] ? 1.05 : 1));
    }
    // saquinho: cresce no lugar do produto, depois cai no palete
    const nasce = elastico(progresso(t, p.vira, 0.45)), td = 3.78 + 0.045 * i, q = progresso(t, td, 0.36);
    const chaoY = p.chao[1] === 'topo' ? null : null;
    const destino = p.chao[1] === 'topo' ? [p.chao[0], PT + H + p.saco[2] / 2, 0.02] : [p.chao[0], PT + p.saco[2] / 2, p.chao[1]];
    const pos = [mistura(ar[0], destino[0], suave(q)), mistura(ar[1], destino[1], entrada(q)), mistura(ar[2], destino[2], suave(q))];
    const qa = quat(0.1 + 0.15 * Math.sin(i), -0.42 + 0.25 * Math.sin(i * 2.1) + deriva * 0.5, 0.18 * Math.cos(i * 1.7), 'YXZ');
    const qd = quat(-Math.PI / 2, p.giro, 0, 'YXZ');
    p.bag.position.set(...pos); p.bag.quaternion.copy(qa).slerp(qd, suave(q));
    p.bag.scale.setScalar(Math.max(0.001, nasce)); p.bag.visible = t > p.vira && t < 6.2;
    if (q >= 1) p.bag.scale.y *= 1 - 0.08 * sino(t, td + 0.38, 0.05);
  });

  // ---- confete ----
  const someConf = 1 - suave(progresso(t, 3.4, 0.7));
  DADOS_CONF.forEach((c, i) => {
    const tau = t - c.t0;
    if (tau <= 0 || someConf <= 0) { _m.makeScale(0, 0, 0); confete.setMatrixAt(i, _m); return; }
    const k = 2.4, g = 1.3, e = 1 - Math.exp(-k * tau);
    _v.set(c.p0[0] + c.v[0] * e / k + 0.06 * Math.sin(tau * 3 + c.fase), c.p0[1] + c.v[1] * e / k - g * (tau / k - e / (k * k)), c.p0[2] + c.v[2] * e / k);
    _e.set(c.giro[0] * tau + c.fase, c.giro[1] * tau, c.giro[2] * tau + c.fase); _q.setFromEuler(_e);
    const sc = c.esc * someConf * Math.min(1, tau * 8); _s.set(sc, sc, sc);
    _m.compose(_v, _q, _s); confete.setMatrixAt(i, _m);
  });
  confete.instanceMatrix.needsUpdate = true; confete.visible = t > 1.15 && t < 4.2;

  // ---- galpão se montando ----
  const aparece = progresso(t, 3.8, 0.22), abreBase = suave(progresso(t, 3.86, 1.1));
  galpao.visible = t > 3.8 && t < 8.35;
  base.scale.set(mistura(0.2, 1, abreBase), Math.max(0.001, salto(aparece)), mistura(0.2, 1, abreBase));
  palete.scale.setScalar(Math.max(0.001, salto(progresso(t, 3.8, 0.25))));
  paredes.forEach((p, i) => { p.scale.y = Math.max(0.001, salto(progresso(t, 4.55 + 0.1 * i, 0.5))); p.visible = t > 4.55 + 0.1 * i; });
  pilares.forEach((p, i) => { p.scale.y = Math.max(0.001, salto(progresso(t, 5.35 + 0.035 * i, 0.4))); p.visible = t > 5.35 + 0.035 * i; });
  const tTampa = progresso(t, 4.95, 0.3), fechaT = progresso(t, 5.45, 0.5);
  telhadoPiv.visible = t > 4.95; telhadoPiv.scale.setScalar(Math.max(0.001, saida(tTampa)));
  telhadoPiv.rotation.x = -1.75 * (1 - entrada(fechaT)) + (fechaT >= 1 ? -0.035 * Math.sin((t - 5.95) * 18) * Math.exp(-(t - 5.95) * 7) : 0);
  // vira logo: o galpão encolhe girando e afunda
  const vira = progresso(t, 7.55, 0.7), vp = entrada(vira);
  galpao.scale.setScalar(Math.max(0.001, 1 - vp)); galpao.rotation.y = 0.9 * vp; galpao.position.y = -0.3 * vp;
  decal.visible = t < 7.55;

  // ---- van ----
  const pv = suave(progresso(t, 6.4, 1.5));
  const [vx, vz] = bezier([1.3, 3.15], [1.3, 5.2], [-0.6, 6.2], [-3.4, 8.2], pv);
  const [dx, dz] = (() => { const a = bezier([1.3, 3.15], [1.3, 5.2], [-0.6, 6.2], [-3.4, 8.2], Math.min(1, pv + 0.01)); const b = bezier([1.3, 3.15], [1.3, 5.2], [-0.6, 6.2], [-3.4, 8.2], Math.max(0, pv - 0.01)); return [a[0] - b[0], a[1] - b[1]]; })();
  vanA.position.set(vx, ST, vz); vanA.rotation.y = -Math.atan2(dz, dx);
  vanA.scale.setScalar(1.15 * Math.max(0.001, salto(progresso(t, 5.75, 0.35))) * (1 - suave(progresso(t, 7.75, 0.3))));
  vanA.visible = t > 5.75 && t < 8.05;
  vanA.userData.rodas.forEach((r) => { r.rotation.y = pv * 40; });

  // ---- logo: o desenho do telhado sobe, vira de frente e ganha o nome ----
  const lp = progresso(t, 7.55, 0.95), le = suave(lp);
  logo.visible = t >= 7.55;
  const roofY = (ST + B.H + 0.125) * s, roofZ = ((B.z0 - 0.06) + (B.z1 - B.z0 + 0.24) / 2) * s;
  const desliza = suave(progresso(t, 8.95, 0.55));
  const larguraFinal = DISCO_W;
  const xFinal = mistura(0, -0.78, desliza);
  disco.position.set(mistura(0, xFinal, 1) * (lp >= 1 ? 1 : 0) + (lp < 1 ? 0 : 0), mistura(roofY, LOGO_Y, le) + 0.35 * Math.sin(Math.PI * lp) + (lp >= 1 ? 0.02 * Math.sin((t - 8.5) * 2.2) : 0), mistura(roofZ, 0, le));
  if (lp >= 1) disco.position.x = xFinal;
  const w0 = DEC.w * s;
  const esc = mistura(w0, larguraFinal, le);
  disco.scale.set(esc, esc, esc * mistura(0.15, 1, le));
  disco.quaternion.copy(quat(-Math.PI / 2, 0, 0)).slerp(quat(0, 0, 0), le);
  disco.rotateY(mistura(0, Math.PI * 2, suave(progresso(t, 7.7, 0.8))));
  const rv = suave(progresso(t, 9.1, 0.6));
  palavra.position.set(mistura(0.2, 0.52, rv), LOGO_Y + 0.02 * Math.sin((t - 8.5) * 2.2) - 0.01, -0.05);
  corte.constant = mistura(-0.3, 1.4, rv);
  palavra.visible = t > 9.0;
}

{ const vistos = new Set(); cena.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { if (!vistos.has(m)) { vistos.add(m); m.envMapIntensity = (m.envMapIntensity ?? 1) * LUZ.env; } }); }); }
function desenha(t) { atualiza(t); renderer.render(cena, camera); }

// ===================== TRILHA EM CÓDIGO =====================
async function trilha() {
  const sr = 48000, dur = CONFIG.duracao, ac = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  const mestre = ac.createGain(); mestre.gain.value = 0.55;
  const comp = ac.createDynamicsCompressor(); mestre.connect(comp); comp.connect(ac.destination);
  const r = rng(99);
  const ruidoBuf = ac.createBuffer(1, sr * 2, sr); { const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
  const batida = 60 / CONFIG.bpm;
  const silencio = (t) => t > 7.95 && t < 8.45;
  // nota com envelope curto
  function nota(f, t, d, vol, tipo = 'triangle') {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + d);
    o.connect(g); g.connect(mestre); o.start(t); o.stop(t + d + 0.05);
  }
  function chiado(t, d, vol, f0, f1, q = 1.2) {
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + d);
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + d * 0.5); g.gain.linearRampToValueAtTime(0, t + d);
    s.connect(bp); bp.connect(g); g.connect(mestre); s.start(t, r() * 0.5); s.stop(t + d + 0.05);
  }
  function bumbo(t, vol = 0.9) {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.35);
  }
  // harmonia: Ré, Si menor, Sol, Lá, Ré
  const acordes = [[0, 2.4, [293.7, 370, 440]], [2.4, 4.3, [246.9, 293.7, 370]], [4.3, 6.4, [196, 246.9, 293.7]], [6.4, 7.95, [220, 277.2, 329.6]], [8.45, 11, [293.7, 370, 440, 587.3]]];
  acordes.forEach(([ini, fim, ns]) => {
    ns.forEach((f) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f / 2;
      g.gain.setValueAtTime(0, ini); g.gain.linearRampToValueAtTime(0.035, ini + 0.3); g.gain.linearRampToValueAtTime(0, fim); o.connect(g); g.connect(mestre); o.start(ini); o.stop(fim + 0.1); });
    for (let t = ini, k = 0; t < fim - 0.05; t += batida / 2, k++) if (!silencio(t) && t >= 1.2) nota(ns[k % ns.length] * 2, t, 0.22, 0.05);
  });
  for (let t = 1.2; t < 7.9; t += batida) bumbo(t, 0.8);
  for (let t = 1.2 + batida / 2; t < 7.9; t += batida) chiado(t, 0.06, 0.08, 8000, 9000, 0.8);
  // efeitos
  chiado(0.0, 0.5, 0.35, 400, 2400);                 // caixa desliza
  bumbo(0.52, 0.5);                                  // caixa para
  chiado(1.17, 0.25, 0.6, 3000, 600, 0.7); bumbo(1.18, 1.0); // estouro
  for (let i = 0; i < 22; i++) nota(2000 + r() * 3000, 1.25 + r() * 1.6, 0.18, 0.03, 'sine'); // brilho do confete
  [...PRODUTOS, EXTRA].forEach((p) => { chiado(p.vira, 0.12, 0.3, 900, 300, 2); nota(520 + r() * 200, p.vira + 0.02, 0.12, 0.08, 'sine'); }); // vira saquinho
  bumbo(4.12, 1.0); chiado(4.1, 0.2, 0.3, 300, 120);  // cai no palete
  chiado(4.5, 1.0, 0.25, 300, 3000);                 // paredes sobem
  bumbo(5.95, 0.9); chiado(5.92, 0.15, 0.35, 500, 200); // telhado fecha
  chiado(6.5, 1.2, 0.18, 200, 900);                  // van sai
  chiado(7.4, 0.55, 0.3, 800, 6000);                 // vira logo, sobe antes do silêncio
  bumbo(8.45, 1.1); [587.3, 740, 880, 1174.7].forEach((f, i) => nota(f, 8.45 + i * 0.05, 1.6, 0.09, 'sine')); // batida forte: logo
  chiado(9.0, 0.5, 0.25, 2500, 700);                 // nome entra
  const buf = await ac.startRendering();
  return wavBase64(buf);
}
function wavBase64(buf) {
  const canais = buf.numberOfChannels, n = buf.length, bytes = 44 + n * canais * 2;
  const v = new DataView(new ArrayBuffer(bytes));
  const s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, bytes - 8, true); s(8, 'WAVE'); s(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, canais, true); v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * canais * 2, true); v.setUint16(32, canais * 2, true); v.setUint16(34, 16, true);
  s(36, 'data'); v.setUint32(40, n * canais * 2, true);
  const dados = []; for (let c = 0; c < canais; c++) dados.push(buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < canais; c++) { v.setInt16(o, limita(dados[c][i], -1, 1) * 32767, true); o += 2; }
  const u8 = new Uint8Array(v.buffer); let bin = '';
  for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(bin);
}

// ===================== CONTROLE =====================
function definirEscala(e) { renderer.setSize(Math.round(L * e), Math.round(A * e), false); }
window.CONFIG = CONFIG; window.STORYBOARD = STORYBOARD; window.trilha = trilha; window.definirEscala = definirEscala;
window.seek = (t) => desenha(limita(t, 0, CONFIG.duracao - 1 / CONFIG.fps));
if (new URLSearchParams(location.search).has('render')) {
  desenha(0);
} else {
  let pausado = false, ultimo = 0, base0 = performance.now();
  tela.addEventListener('click', () => { pausado = !pausado; base0 = performance.now() - ultimo * 1000; });
  (function laco(agora) {
    if (!pausado) { ultimo = ((agora - base0) / 1000) % CONFIG.duracao; desenha(ultimo); }
    requestAnimationFrame(laco);
  })(performance.now());
}
