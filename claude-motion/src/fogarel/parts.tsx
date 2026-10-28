import React from 'react';
import {easeIn, easeOut, prog} from '../lib';
import {Mask} from '../components/primitives';
import {C, F} from './theme';

/** Teardrop flame; (0,0) is the wick, the flame grows up. */
export const flamePath = (h: number, w: number, sway: number) => {
  const f = (n: number) => n.toFixed(1);
  const tx = sway;
  const ty = -h;
  return (
    `M0,8C${f(-w * 0.78)},-2 ${f(-w * 0.6 + sway * 0.2)},${f(-h * 0.46)} ${f(tx)},${f(ty)}` +
    `C${f(w * 0.6 + sway * 0.2)},${f(-h * 0.46)} ${f(w * 0.78)},-2 0,8Z`
  );
};

/** Flicker for a flame: agitation 0 calm .. 1 wild. */
export const flicker = (t: number, ag: number, seed = 0) => {
  const a = 0.3 + 3.2 * ag;
  const sway = (Math.sin(t * 7.3 + seed) * 5 + Math.sin(t * 13.1 + seed * 2) * 3 + Math.sin(t * 23 + seed) * 2 * ag) * a;
  const h = 1 + (Math.sin(t * 9.7 + seed) * 0.05 + Math.sin(t * 17.3 + seed) * 0.04) * (0.6 + 4.2 * ag);
  return {sway, h};
};

export const Flame: React.FC<{t: number; ag: number; size?: number; seed?: number; glow?: number}> = ({
  t,
  ag,
  size = 1,
  seed = 0,
  glow = 1,
}) => {
  const {sway, h} = flicker(t, ag, seed);
  return (
    <g>
      <circle cx={0} cy={-60 * size} r={150 * size} fill="url(#flameHalo)" opacity={0.85 * glow} />
      <path d={flamePath(150 * size * h, 48 * size, sway * size)} fill="#FF8A3D" style={{filter: `blur(${2.5 * size}px)`}} />
      <path d={flamePath(118 * size * h, 34 * size, sway * size * 0.8)} fill="#FFC46B" />
      <path d={flamePath(78 * size * h, 20 * size, sway * size * 0.5)} fill="#FFF3D1" />
      <ellipse cx={0} cy={-6 * size} rx={9 * size} ry={14 * size} fill="#6C7CFF" opacity={0.45} />
    </g>
  );
};

export const FlameDefs: React.FC = () => (
  <defs>
    <radialGradient id="flameHalo">
      <stop offset="0%" stopColor="#FFD08A" stopOpacity={0.55} />
      <stop offset="40%" stopColor="#FF9A3C" stopOpacity={0.18} />
      <stop offset="100%" stopColor="#FF9A3C" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="wax" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#B99472" />
      <stop offset="45%" stopColor="#F3DFC4" />
      <stop offset="100%" stopColor="#8E6A4E" />
    </linearGradient>
    <linearGradient id="waxShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#000" stopOpacity={0} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.72} />
    </linearGradient>
  </defs>
);

/** Pillar candle with melted rim; (0,0) is the wick base. */
export const Candle: React.FC<{t: number; ag: number; flame?: number; lit?: number}> = ({t, ag, flame = 1, lit = 1}) => (
  <g>
    <g opacity={lit}>
    <ellipse cx={0} cy={548} rx={150} ry={26} fill="#0A0504" opacity={0.7} />
    <path
      d="M-90,30C-60,18 -30,26 0,22C30,18 62,26 90,30L90,540C60,552 -60,552 -90,540Z"
      fill="url(#wax)"
    />
    <path d="M-90,30L90,30L90,540C60,552 -60,552 -90,540Z" fill="url(#waxShade)" />
    <path
      d="M-90,30C-74,40 -70,70 -64,96C-60,110 -52,108 -50,92C-46,62 -40,40 -20,34C0,40 30,30 52,36C60,60 62,90 70,102C76,110 82,96 82,80C84,56 86,42 90,30C60,22 -60,22 -90,30Z"
      fill="#F7E8D2"
      opacity={0.9}
    />
    <ellipse cx={0} cy={28} rx={86} ry={12} fill="#E2C7A5" />
    </g>
    <path d="M0,24C-2,14 2,6 0,0" stroke="#1A0E08" strokeWidth={4} fill="none" strokeLinecap="round" />
    {flame > 0.001 ? (
      <g transform={`scale(${flame * (1 + 0.3 * ag)})`}>
        <Flame t={t} ag={ag} />
      </g>
    ) : null}
  </g>
);

/** One line of display type; words in *stars* get the italic ember accent. */
export const Line: React.FC<{
  t: number;
  start: number;
  text: string;
  size: number;
  out?: number;
  color?: string;
  italic?: boolean;
  stagger?: number;
}> = ({t, start, text, size, out = 0, color = C.cream, italic = false, stagger = 0.09}) => {
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: F.serif,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color,
        fontStyle: italic ? 'italic' : 'normal',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => {
        const accent = w.startsWith('*');
        const word = w.replace(/\*/g, '');
        const k = prog(t, start + i * stagger, start + i * stagger + 0.8, easeOut);
        return (
          <React.Fragment key={i}>
            <Mask k={k} out={out} style={accent ? {fontStyle: 'italic', color: C.emberHi} : undefined}>
              {word}
            </Mask>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Exit that leaves fast: 0..1 between t0 and t0 + dur. */
export const exitK = (t: number, t0: number, dur = 0.45) => prog(t, t0, t0 + dur, easeIn);
