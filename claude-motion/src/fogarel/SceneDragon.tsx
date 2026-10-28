import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeIn, easeInOut, easeOut, prog, rand} from '../lib';
import {blob, CanvasLayer, fireColor} from './Canvas';
import {Dragon, mouthOf, Pose} from './Dragon';
import {pt} from './geom';
import {C, H, spT, TL, W} from './theme';

const S = TL.s1;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** The dragon's pose at time t, shared by the drawing and the fire emitter. */
export const poseS1 = (t: number): Pose => {
  const inh = prog(t, S.inhale, S.strike - 0.05, easeInOut);
  const strike = spT(t, S.strike, {damping: 13, stiffness: 210, mass: 0.7});
  const settle = prog(t, S.fireEnd, S.fireEnd + 0.8, easeInOut);
  const breath = Math.sin(t * 2.4) * (1 - inh);
  const shake = strike * (1 - settle) * (Math.sin(t * 37) * 4 + Math.sin(t * 23) * 3);
  const hx = lerp(lerp(168, 128, inh), 292, strike) + shake;
  const hy = lerp(lerp(-268, -330, inh), -226, strike) + breath * 5 + shake * 0.6;
  return {
    x: 286,
    y: 1112,
    scale: 1.0,
    head: pt(hx, hy),
    headAng: lerp(lerp(-0.12, -0.6, inh), 0.3, strike) + 0.01 * breath,
    jaw: lerp(lerp(0.06, 0.25, inh), 0.82, strike) * (1 - 0.4 * settle),
    wing: lerp(0.86, 1, Math.max(inh, strike)),
    flap: Math.sin(t * 3.1) * 0.05 + inh * (1 - strike) * -0.22 + strike * 0.12 * Math.sin(t * 5),
    tailSway: Math.sin(t * 1.7) * 26 + strike * 30,
    lying: false,
    eye: 1,
    throat: inh * (1 - strike * 0.6) + 0.25 * strike,
    rim: 0.15 + 0.85 * strike,
  };
};

/** Fire particles, born along the stream; each particle remembers the head pose of its birth. */
const drawFire = (ctx: CanvasRenderingContext2D, t: number) => {
  const start = S.strike + 0.1;
  const rate = 300;
  const total = Math.floor((S.fireEnd - start) * rate);
  const smokeOn: number[] = [];
  const draws: [number, number, number, number, number][] = [];
  for (let i = 0; i < total; i++) {
    const tb = start + i / rate;
    const a = t - tb;
    if (a < 0) break;
    const r1 = rand(i * 3.17 + 1);
    const r2 = rand(i * 5.71 + 2);
    const r3 = rand(i * 7.33 + 3);
    const r4 = rand(i * 1.93 + 4);
    const life = 0.7 + 0.5 * r3;
    if (a > life * 2.6) continue;
    const m = mouthOf(poseS1(tb));
    const ang = m.ang + (r1 - 0.5) * 0.38;
    const v = 1500 + 800 * r2;
    const k = 1.8;
    const dist = (v * (1 - Math.exp(-k * a))) / k;
    const wob = Math.sin(a * 8 + r4 * 6.3) * 46 * a + (r4 - 0.5) * 90 * a;
    const x = m.p.x + Math.cos(ang) * dist - Math.sin(ang) * wob;
    const y = m.p.y + Math.sin(ang) * dist + Math.cos(ang) * wob - 110 * a * a;
    const r = 14 + 360 * a * (0.55 + 0.8 * r4);
    if (a > life * 0.55) smokeOn.push(draws.length);
    draws.push([x, y, r, a / life, i]);
  }
  // smoke first, under the flames
  ctx.globalCompositeOperation = 'source-over';
  for (const j of smokeOn) {
    const [x, y, r, u] = draws[j];
    const k = Math.min(1, (u - 0.55) / 0.6);
    const fade = u > 1.6 ? Math.max(0, 1 - (u - 1.6) / 1) : 1;
    blob(ctx, x, y - 40 * k, r * 1.25, [34, 14, 20], 0.16 * k * fade, 0.3);
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, r, u] of draws) {
    if (u > 1) continue;
    blob(ctx, x, y, r, fireColor(u), 0.5 * Math.pow(1 - u, 1.1), 0.18);
  }
};

export const drawEmbers = (ctx: CanvasRenderingContext2D, t: number, amount: number) => {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const speed = 50 + 120 * rand(i + 0.3);
    const y = H + 40 - ((rand(i + 0.7) * (H + 80) + t * speed) % (H + 80));
    const x = rand(i + 0.1) * W + Math.sin(t * (0.6 + rand(i)) + i) * 30;
    const flick = 0.5 + 0.5 * Math.sin(t * (5 + 6 * rand(i + 9)) + i * 3);
    const r = 1.5 + 3 * rand(i + 0.9);
    blob(ctx, x, y, r * 3, [255, 170, 80], 0.5 * flick * amount, 0.25);
  }
};

const Sky: React.FC<{t: number; heat: number}> = ({t, heat}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.night} />
        <stop offset="45%" stopColor={C.plum} />
        <stop offset="78%" stopColor={C.dusk} />
        <stop offset="100%" stopColor="#7A2E1E" />
      </linearGradient>
      <radialGradient id="moonGlow">
        <stop offset="0%" stopColor={C.moon} stopOpacity={0.35} />
        <stop offset="100%" stopColor={C.moon} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="moon" cx="42%" cy="40%">
        <stop offset="0%" stopColor="#FFF1D2" />
        <stop offset="100%" stopColor="#E9C48E" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    {Array.from({length: 60}).map((_, i) => (
      <circle
        key={i}
        cx={rand(i + 11) * W}
        cy={rand(i + 23) * 900}
        r={0.8 + 1.4 * rand(i + 5)}
        fill={C.cream}
        opacity={(0.25 + 0.5 * rand(i + 8)) * (0.6 + 0.4 * Math.sin(t * 2 + i))}
      />
    ))}
    <circle cx={650} cy={760} r={560} fill="url(#moonGlow)" />
    <circle cx={650} cy={760} r={285} fill="url(#moon)" />
    <circle cx={560} cy={700} r={38} fill="#D9B17A" opacity={0.35} />
    <circle cx={735} cy={860} r={24} fill="#D9B17A" opacity={0.3} />
    <path
      d="M0,1480L120,1400L210,1440L330,1330L450,1420L560,1360L700,1450L820,1380L960,1460L1080,1400L1080,1920L0,1920Z"
      fill={C.ridgeFar}
    />
    <path
      d="M0,1640L160,1560L300,1620L470,1520L640,1600L780,1540L940,1620L1080,1570L1080,1920L0,1920Z"
      fill="#1F0D18"
    />
    <rect width={W} height={H} fill="#FF7A30" opacity={0.18 * heat} style={{mixBlendMode: 'screen'}} />
  </svg>
);

const CLIFF =
  'M0,1920L0,1420C50,1396 110,1350 168,1326L190,1306L226,1314C262,1300 300,1298 330,1306L372,1300L392,1322C430,1350 470,1420 500,1510L540,1560C570,1650 630,1790 700,1920Z';

export const SceneDragon: React.FC<{t: number}> = ({t}) => {
  if (t > S.white + 0.6) return null;
  const pose = poseS1(t);
  const fire = prog(t, S.strike, S.strike + 0.35, easeOut) * (1 - prog(t, S.fireEnd, S.fireEnd + 0.6));
  const shake = fire * (Math.sin(t * 61) * 7 + Math.sin(t * 43) * 5);
  const shakeY = fire * (Math.cos(t * 53) * 6 + Math.sin(t * 29) * 4);
  const push = lerp(1.0, 1.07, prog(t, 0, S.white, easeInOut));
  const flood = prog(t, S.flood, S.white, easeIn);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${shake}px, ${shakeY}px) scale(${push})`,
          transformOrigin: '50% 52%',
        }}
      >
        <Sky t={t} heat={fire} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <Dragon pose={pose} id="d1" />
          <path d={CLIFF} fill={C.sil} />
        </svg>
        <CanvasLayer draw={drawFire} />
        <CanvasLayer draw={(ctx, tt) => drawEmbers(ctx, tt, 0.3 + 0.7 * fire)} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 60% at 70% 62%, #FFE9B8 0%, #FFB054 35%, #E8622C 75%, #B63A1A 100%)`,
          opacity: flood,
        }}
      />
    </AbsoluteFill>
  );
};
