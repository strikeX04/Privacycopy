// Estilo: plantao-verde — conteúdo educativo de contabilidade (Reels 9:16). Inspirado na referência
// "4 jeitos de perder dinheiro no plantão": verde-escuro + papel creme quadriculado, dourado de destaque,
// vermelho só no que dói. Títulos condensados (Anton), apartes em serifa itálica (Instrument Serif).
window.STYLE = {
  name: 'plantao-verde',
  colors: { dark: '#0D3326', light: '#F2EDE3', accent: '#C9A043', contrast: '#B3121B', card: '#FFFFFF', ink: '#10261E' },
  fonts: {
    display: 'Inter Tight', mono: 'JetBrains Mono', impact: 'Anton', serif: 'Instrument Serif',
    css: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap',
    files: [
      { family: 'Anton', file: 'Anton-Regular.ttf' },
      { family: 'Instrument Serif', file: 'InstrumentSerif-Italic.ttf', descriptors: { style: 'italic' } },
    ],
    preload: ['600 80px "Inter Tight"', '800 80px "Inter Tight"', '400 80px "Anton"', 'italic 400 80px "Instrument Serif"'],
  },
  bg: {
    dark: { blobs: [
      { x: 540, y: 300, ax: 140, ay: 80, fx: 1, fy: 2, py: 1.5708, rx: 900, ry: 700, rgb: '30,95,70', a: .55 },
      { x: 540, y: 1900, ax: 160, ay: 60, fx: 1, fy: 2, px: 1.5708, rx: 1000, ry: 600, rgb: '0,0,0', a: .45 },
    ] },
    light: { blobs: [
      { x: 540, y: 960, ax: 120, ay: 120, fx: 1, fy: 2, px: 1, rx: 900, ry: 900, rgb: '255,255,255', a: .5 },
      { x: 540, y: 1950, ax: 160, ay: 60, fx: 1, fy: 2, px: 1.5708, rx: 1000, ry: 500, rgb: '201,160,67', a: .10 },
    ] },
    grid: { light: 'rgba(16,38,30,.05)', dark: 'rgba(255,255,255,.035)', step: 54 },
  },
  vignette: { amt: .18, rgb: '10,25,18', inner: .62, breathe: .02, cycles: 1 },
  transition: 'circle',
  grain: .03,
  sfx: { transition: { name: 'whoosh', gain: .18, opts: { dur: .45, f0: 500, f1: 4000, peak: .35 } } },
};
