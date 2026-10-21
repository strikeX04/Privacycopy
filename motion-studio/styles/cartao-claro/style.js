// Estilo: cartao-claro — anúncio vertical (Reels/Meta) para negócio local. Fundo claro, azul do cartão,
// estrelas amarelas, verde só no botão do WhatsApp. Gramática = motion-apple (plano único, crescimento por eixo).
window.STYLE = {
  name: 'cartao-claro',
  colors: { dark: '#0E1525', light: '#F4F6FA', accent: '#1F6FE5', contrast: '#FBBC04', card: '#FFFFFF', green: '#25D366' },
  fonts: {
    display: 'Inter Tight', mono: 'JetBrains Mono',
    css: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap',
    preload: ['600 80px "Inter Tight"', '800 80px "Inter Tight"', '500 40px "Inter Tight"', '700 40px "Inter Tight"', '700 30px "JetBrains Mono"'],
  },
  bg: {
    light: { blobs: [
      { x: 540, y: 1950, ax: 160, ay: 60, fx: 1, fy: 2, px: 1.5708, rx: 1000, ry: 560, rgb: '31,111,229', a: .16 },
      { x: 80, y: 120, ax: 120, ay: 60, fx: 1, fy: 2, py: 1.5708, rx: 700, ry: 420, rgb: '251,188,4', a: .10 },
      { x: 1000, y: 700, ax: 120, ay: 160, fx: 2, fy: 1, px: 1, rx: 600, ry: 520, rgb: '31,111,229', a: .07 },
    ] },
    dark: { blobs: [] },
  },
  vignette: { amt: .06, rgb: '60,70,90', inner: .7, breathe: .02, cycles: 1 },
  transition: 'none',
  grain: .02,
  sfx: { transition: { name: 'whoosh', gain: .16, opts: { dur: .4, f0: 600, f1: 4500, peak: .3 } } },
};
