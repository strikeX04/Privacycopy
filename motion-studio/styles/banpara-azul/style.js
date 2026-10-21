// Estilo: banpara-azul — campanha Novembro Azul do Banpará. Gramática = motion-apple (objetos que crescem
// um eixo de cada vez, câmera em onda, sem pausas), vertical 9:16. Base azul-marinho; vermelho só na marca.
window.STYLE = {
  name: 'banpara-azul',
  colors: { dark: '#061A40', light: '#EEF3FA', accent: '#5AB0FF', contrast: '#E20613', card: '#0C2A5E', deep: '#1F6FE5' },
  fonts: {
    display: 'Inter Tight', mono: 'JetBrains Mono',
    css: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;800&family=JetBrains+Mono:wght@500;700&display=swap',
    preload: ['600 80px "Inter Tight"', '800 80px "Inter Tight"', '500 40px "Inter Tight"', '700 30px "JetBrains Mono"'],
  },
  // blobs periódicos em N frames (loop perfeito); coordenadas para 1080x1920
  bg: {
    dark: { blobs: [
      { x: 540, y: 1900, ax: 180, ay: 80, fx: 1, fy: 2, py: 1.5708, rx: 1000, ry: 620, rgb: '30,107,255', a: .55 },
      { x: 120, y: 120, ax: 140, ay: 90, fx: 1, fy: 2, px: 1.5708, rx: 760, ry: 520, rgb: '90,176,255', a: .22 },
      { x: 980, y: 900, ax: 160, ay: 200, fx: 2, fy: 1, px: 1, rx: 620, ry: 520, rgb: '31,111,229', a: .18 },
    ] },
    light: { blobs: [
      { x: 540, y: 1950, ax: 160, ay: 60, fx: 1, fy: 2, px: 1.5708, rx: 1000, ry: 560, rgb: '90,176,255', a: .30 },
      { x: 100, y: 80, ax: 120, ay: 60, fx: 1, fy: 2, py: 1.5708, rx: 700, ry: 420, rgb: '31,111,229', a: .10 },
    ] },
  },
  vignette: { amt: .16, rgb: '2,8,26', inner: .68, breathe: .03, cycles: 1 },
  transition: 'circle',
  grain: .03,
  sfx: { transition: { name: 'whoosh', gain: .16, opts: { dur: .45, f0: 500, f1: 4200, peak: .3 } } },
};
