import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeIn, easeInOut, easeOut, prog, rand} from '../lib';
import {blob, CanvasLayer} from './Canvas';
import {Dragon, noseOf, Pose} from './Dragon';
import {pt} from './geom';
import {Candle, exitK, FlameDefs, Line} from './parts';
import {C, F, H, spT, TL, W} from './theme';

const S2 = TL.s2;
const S3 = TL.s3;
const S4 = TL.s4;
const S5 = TL.s5;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** How restless the candle is: rises with each stress word, settles on "Aqui". */
export const agitation = (t: number) => {
  const up =
    0.12 +
    0.2 * prog(t, S2.fogo, S2.fogo + 0.6, easeOut) +
    0.25 * prog(t, S2.w1, S2.w1 + 0.4, easeOut) +
    0.22 * prog(t, S2.w2, S2.w2 + 0.4, easeOut) +
    0.25 * prog(t, S2.w3, S2.w3 + 0.4, easeOut);
  return lerp(up, 0.05, prog(t, S2.calm, S2.calm + 1.4, easeInOut));
};

/** The candle travels from the centre of scene 2 to the corner of the spa. */
const candlePlace = (t: number) => {
  const k = prog(t, S2.glow, S3.enter + 0.9, easeInOut);
  return {x: lerp(540, 150, k), y: lerp(1150, 1478, k), s: lerp(1, 0.6, k)};
};

const TABLE_Y = 1120;
const BACK = (x: number) => (x < 720 ? lerp(1040, 1058, (x - 620) / 100) : lerp(1058, 1030, (x - 720) / 130));
const STONES = [704, 744, 784, 822, 858].map((x, i) => ({x, y: BACK(x) - 12, r: 29 - (i % 2) * 4}));

const PERSON =
  'M134,1120L144,1090C170,1080 222,1068 288,1074C328,1080 372,1084 420,1076C470,1050 540,1028 620,1040C664,1048 692,1060 722,1058C770,1046 806,1026 852,1030C882,1034 902,1050 910,1066C920,1076 934,1074 950,1068C982,1060 1008,1082 1006,1106L1000,1120Z';
const TOWEL =
  'M404,1078C456,1046 540,1022 626,1036C664,1044 694,1056 716,1056L720,1100C722,1124 712,1146 700,1152C640,1160 520,1160 430,1150C420,1130 410,1104 404,1080Z';

export const DRAGON_SPA = (t: number): Pose => ({
  x: 590,
  y: 1036,
  scale: 0.8,
  head: pt(262, 34),
  headAng: 0.1 + Math.sin(t * 1.3) * 0.015,
  jaw: 0.02,
  wing: 0,
  flap: Math.sin(t * 1.1) * 0.02,
  tailSway: Math.sin(t * 2.1) * 34,
  lying: true,
  eye: 0,
  throat: 0,
  rim: 0.35,
});
const DRAGON_STONES = [-190, -140, -90, -40].map((x, i) => ({x: 590 + x * 0.8, y: 1036 - 64 - (i % 2) * 2 + (i === 0 ? 6 : 0), r: 27 - (i % 2) * 4}));

const Stone: React.FC<{x: number; y: number; r: number; k: number; heat: number}> = ({x, y, r, k, heat}) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x} ${y - (1 - k) * 60}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <ellipse cx={0} cy={2} rx={r + 6} ry={r * 0.5 + 4} fill="#FF7A30" opacity={0.35 * heat} style={{filter: 'blur(8px)'}} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.5} fill={C.stone} />
      <ellipse cx={-r * 0.25} cy={-r * 0.2} rx={r * 0.55} ry={r * 0.18} fill="#5A4A40" opacity={0.6} />
      <path
        d={`M${-r},0A${r},${r * 0.5} 0 0,0 ${r},0`}
        stroke="#FF9A4A"
        strokeWidth={2.5}
        fill="none"
        opacity={0.75 * heat}
      />
    </g>
  );

const drawRoom = (ctx: CanvasRenderingContext2D, t: number) => {
  const c = candlePlace(t);
  // sparks converging from the flood into the wick
  const conv = prog(t, S2.reveal - 0.05, S2.candle + 0.35, easeIn);
  if (conv > 0 && conv < 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 150; i++) {
      const a0 = rand(i + 0.4) * Math.PI * 2;
      const r0 = 380 + 700 * rand(i + 1.7);
      const k = Math.min(1, conv * (0.8 + 0.4 * rand(i + 3)));
      const ang = a0 + k * 2.2;
      const rr = r0 * (1 - k);
      const x = c.x + Math.cos(ang) * rr;
      const y = c.y - 60 + Math.sin(ang) * rr * 1.2;
      blob(ctx, x, y, 7 + 10 * (1 - k), [255, 190, 110], 0.9 * (1 - k * 0.6), 0.3);
    }
  }
  // stress words burning away into embers
  const burn = prog(t, S2.calm, S2.calm + 1.6);
  if (burn > 0 && burn < 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 120; i++) {
      const line = i % 3;
      const tb = S2.calm + line * 0.12 + rand(i + 2) * 0.3;
      const a = t - tb;
      if (a < 0 || a > 1.3) continue;
      const x = 160 + rand(i + 0.5) * 760 + Math.sin(a * 4 + i) * 20;
      const y = 430 + line * 135 + 30 - a * (160 + 140 * rand(i + 7));
      blob(ctx, x, y, 3 + 5 * rand(i), [255, 160, 70], 0.8 * (1 - a / 1.3), 0.3);
    }
  }
  // sparks off the restless flame
  const ag = agitation(t);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const period = 0.9 + 0.6 * rand(i + 4);
    const ph = ((t + rand(i) * period) % period) / period;
    const x = c.x + (rand(i + 9) - 0.5) * 40 * c.s + Math.sin(ph * 6 + i) * 30 * ph * c.s;
    const y = c.y - 150 * c.s - ph * 320 * c.s;
    blob(ctx, x, y, 3 * c.s, [255, 180, 90], (1 - ph) * Math.max(0, ag - 0.3) * 1.2, 0.3);
  }
  // steam off the hot stones
  const steamOn = prog(t, S3.stones, S3.stones + 1.2);
  if (steamOn > 0) {
    ctx.globalCompositeOperation = 'source-over';
    const dragon = prog(t, S4.enter, S4.enter + 0.6);
    const src = dragon > 0.5 ? DRAGON_STONES : STONES;
    src.forEach((s, j) => {
      for (let w = 0; w < 5; w++) {
        const period = 2.6;
        const ph = ((t + w * 0.52 + j * 0.31) % period) / period;
        const x = s.x + Math.sin(ph * 5 + j + w) * 18 * ph;
        const y = s.y - 14 - ph * 230;
        blob(ctx, x, y, 18 + 40 * ph, [250, 228, 205], 0.07 * Math.sin(ph * Math.PI) * steamOn, 0.2);
      }
    });
    // the steam puff that swaps the guest for the dragon
    const puff = prog(t, S4.enter - 0.3, S4.enter + 0.9);
    if (puff > 0 && puff < 1) {
      for (let i = 0; i < 40; i++) {
        const x = 300 + rand(i + 3) * 700;
        const y = 1080 - rand(i + 8) * 120 - puff * 120;
        blob(ctx, x, y, 60 + 90 * puff, [252, 236, 220], 0.12 * Math.sin(puff * Math.PI), 0.2);
      }
    }
  }
  // the dragon's contented little smoke puffs
  if (t > S4.puff - 0.2 && t < S5.enter + 1.2) {
    const n = noseOf(DRAGON_SPA(t));
    for (let i = 0; i < 3; i++) {
      const a = t - (S4.puff + i * 0.18);
      if (a < 0 || a > 1.4) continue;
      blob(ctx, n.x + 30 * a + i * 6, n.y - 60 * a - i * 4, 10 + 26 * a, [240, 226, 214], 0.28 * (1 - a / 1.4), 0.3);
    }
  }
};

const Bokeh: React.FC<{k: number}> = ({k}) => (
  <g opacity={k} style={{filter: 'blur(14px)'}}>
    {[
      [880, 330, 70, 0.22],
      [960, 520, 44, 0.16],
      [120, 260, 56, 0.14],
      [760, 860, 34, 0.12],
      [230, 820, 46, 0.1],
      [990, 1330, 60, 0.12],
      [60, 1180, 40, 0.1],
    ].map(([x, y, r, a], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#FFB265" opacity={a} />
    ))}
  </g>
);

export const SceneRoom: React.FC<{t: number}> = ({t}) => {
  if (t < S2.reveal || t > S5.enter + 1.4) return null;
  const ag = agitation(t);
  const c = candlePlace(t);
  const flood = 1 - prog(t, S2.reveal, S2.reveal + 0.9, easeOut);
  const flameIn = spT(t, S2.candle, {damping: 12, stiffness: 160, mass: 0.8});
  const room = prog(t, S2.glow - 0.3, S3.enter + 0.8, easeInOut);
  const warm = lerp(0.35 + 0.4 * ag, 0.85, prog(t, S2.calm, S2.glow, easeInOut));
  const push = lerp(1, 1.05, prog(t, S3.enter, S4.exit, easeInOut));
  const zoom =
    1 + 0.2 * prog(t, S3.title + 0.2, S3.stones + 0.3, easeInOut) * (1 - prog(t, S4.enter - 0.35, S4.enter + 0.7, easeInOut));
  const swap = prog(t, S4.enter - 0.05, S4.enter + 0.45, easeInOut);
  const stonesK = (i: number) => spT(t, S3.stones + i * 0.16, {damping: 10, stiffness: 210, mass: 0.7});
  const oil = prog(t, S3.oil, S3.oil + 0.45, easeIn);
  const splash = prog(t, S3.oil + 0.45, S3.oil + 1.4, easeOut);
  const sheen = prog(t, S3.oil + 0.45, S3.oil + 1.6, easeInOut);
  const fadeOut = prog(t, S5.enter, S5.enter + 0.6, easeInOut);

  return (
    <AbsoluteFill style={{opacity: 1 - fadeOut}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '52% 58%'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '620px 1080px'}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <FlameDefs />
          <defs>
            <radialGradient id="roomGlow" cx={c.x / W} cy={(c.y - 80) / H} r="0.9" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#FF9A4A" stopOpacity={0.55 * warm} />
              <stop offset="35%" stopColor="#7A3415" stopOpacity={0.35 * warm} />
              <stop offset="100%" stopColor={C.room} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A0D09" />
              <stop offset="60%" stopColor="#2E170D" />
              <stop offset="100%" stopColor="#140A06" />
            </linearGradient>
            <radialGradient id="spaLight" cx="0.62" cy="0.55" r="0.7">
              <stop offset="0%" stopColor="#E0823E" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#E0823E" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset={Math.max(0, sheen - 0.25)} stopColor="#FFD58A" stopOpacity={0} />
              <stop offset={sheen} stopColor="#FFE2A6" stopOpacity={0.95} />
              <stop offset={Math.min(1, sheen + 0.25)} stopColor="#FFD58A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="#0C0605" />
          <g opacity={room}>
            <rect width={W} height={H} fill="url(#wall)" />
            <rect width={W} height={H} fill="url(#spaLight)" />
            <rect x={0} y={1500} width={W} height={420} fill="#0E0705" />
            <rect x={0} y={1498} width={W} height={3} fill="#5A3520" opacity={0.5} />
          </g>
          <rect width={W} height={H} fill="url(#roomGlow)" />
          <Bokeh k={room} />
          <g opacity={room}>
            {/* massage table */}
            <rect x={150} y={1138} width={26} height={364} fill={C.wood} />
            <rect x={926} y={1138} width={26} height={364} fill={C.wood} />
            <rect x={176} y={1320} width={750} height={14} fill={C.wood} />
            <rect x={96} y={TABLE_Y} width={910} height={26} rx={12} fill="#2A160D" />
            <rect x={96} y={TABLE_Y} width={910} height={4} rx={2} fill="#B0653A" opacity={0.5} />
            {/* the guest, then the dragon */}
            <g opacity={1 - swap}>
              <path d={PERSON} fill={C.skin} style={{filter: 'drop-shadow(0 -2px 3px rgba(255,140,70,0.35))'}} />
              <circle cx={974} cy={1052} r={19} fill={C.skin} />
              <path d={TOWEL} fill={C.towel} />
              <path d="M470,1068C520,1050 580,1042 640,1048M520,1150C540,1120 560,1100 600,1090" stroke="#6A4230" strokeWidth={3} fill="none" opacity={0.6} />
              <path
                d="M716,1056C770,1044 806,1024 852,1028C882,1032 902,1048 910,1064"
                stroke="url(#sheen)"
                strokeWidth={5}
                fill="none"
                opacity={sheen > 0 && sheen < 1 ? 1 : 0}
              />
              {STONES.map((s, i) => (
                <Stone key={i} {...s} k={stonesK(i)} heat={0.8 + 0.2 * Math.sin(t * 3 + i)} />
              ))}
            </g>
            <g opacity={swap}>
              <Dragon pose={DRAGON_SPA(t)} id="d2" color="#120806" membrane="#24120C" />
              {DRAGON_STONES.map((s, i) => (
                <Stone key={i} {...s} k={1} heat={0.8 + 0.2 * Math.sin(t * 3 + i)} />
              ))}
            </g>
          </g>
          {/* oil drop */}
          {oil > 0 && oil < 1 ? (
            <path
              d="M0,-26C10,-8 16,2 16,10A16,16 0 0,1 -16,10C-16,2 -10,-8 0,-26Z"
              transform={`translate(790 ${lerp(880, BACK(790) - 18, oil)})`}
              fill="#F2B24E"
              style={{filter: 'drop-shadow(0 0 8px rgba(255,190,90,0.8))'}}
            />
          ) : null}
          {splash > 0 && splash < 1 ? (
            <ellipse
              cx={790}
              cy={BACK(790) - 6}
              rx={10 + 80 * splash}
              ry={4 + 14 * splash}
              stroke="#FFD58A"
              strokeWidth={3}
              fill="none"
              opacity={1 - splash}
            />
          ) : null}
          <g transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
            <Candle t={t} ag={ag} flame={flameIn} lit={0.25 + 0.75 * Math.min(1, flameIn)} />
          </g>
        </svg>
        <CanvasLayer draw={drawRoom} />
      </AbsoluteFill>
      </AbsoluteFill>
      <Texts t={t} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 60% at 70% 62%, #FFE9B8 0%, #FFB054 35%, #E8622C 75%, #B63A1A 100%)`,
          opacity: flood,
        }}
      />
    </AbsoluteFill>
  );
};

const at = (y: number, children: React.ReactNode, style?: React.CSSProperties) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', ...style}}>
    {children}
  </div>
);

const burnStyle = (t: number, i: number): React.CSSProperties => {
  const k = prog(t, S2.calm + i * 0.12, S2.calm + i * 0.12 + 0.6, easeIn);
  return {
    opacity: 1 - k,
    filter: `blur(${k * 10}px)`,
    transform: `translateY(${-k * 40}px)`,
    color: k > 0 ? C.emberHi : undefined,
  };
};

const Chip: React.FC<{t: number; start: number; label: string; out: number}> = ({t, start, label, out}) => {
  const k = spT(t, start, {damping: 11, stiffness: 220, mass: 0.7});
  return (
    <div
      style={{
        fontFamily: F.sans,
        fontSize: 30,
        fontWeight: 500,
        letterSpacing: '0.26em',
        color: C.gold,
        padding: '16px 30px 16px 38px',
        border: `1.5px solid rgba(245,176,74,0.55)`,
        borderRadius: 999,
        background: 'rgba(20,10,6,0.5)',
        opacity: Math.min(1, k * 1.4) * (1 - out),
        transform: `translateY(${(1 - k) * 24 - out * 20}px) scale(${0.9 + 0.1 * k})`,
      }}
    >
      {label}
    </div>
  );
};

const Texts: React.FC<{t: number}> = ({t}) => {
  const qOut = exitK(t, S2.w1 - 0.4);
  const s3Out = exitK(t, S3.exit);
  const s4Out = exitK(t, S4.exit, 0.35);
  return (
    <AbsoluteFill>
      {t < S2.w1 + 0.2 ? (
        <>
          {at(440, <Line t={t} start={S2.q + 0.1} text="Sabe aquele" size={78} italic color={C.creamDim} out={qOut} />)}
          {at(540, <Line t={t} start={S2.fogo - 0.1} text="*fogo* do dia a dia?" size={124} out={qOut} />)}
        </>
      ) : null}
      {t > S2.w1 - 0.1 && t < S2.calm + 1.2 ? (
        <>
          {at(400, <Line t={t} start={S2.w1} text="a pressa." size={116} />, burnStyle(t, 0))}
          {at(535, <Line t={t} start={S2.w2} text="o estresse." size={116} />, burnStyle(t, 1))}
          {at(670, <Line t={t} start={S2.w3} text="a tensão nos ombros." size={96} stagger={0.07} />, burnStyle(t, 2))}
        </>
      ) : null}
      {t > S3.title - 0.1 && t < S3.exit + 0.6 ? (
        <>
          {at(430, <Line t={t} start={S3.title} text="calor que *cuida.*" size={136} out={s3Out} />)}
          {at(640, <Chip t={t} start={S3.stones} label="PEDRAS QUENTES" out={s3Out} />)}
          {at(740, <Chip t={t} start={S3.oil} label="ÓLEOS AROMÁTICOS" out={s3Out} />)}
        </>
      ) : null}
      {t > S4.line - 0.1 && t < S4.exit + 0.7 ? (
        <>
          {at(420, <Line t={t} start={S4.line + 0.2} text="mãos que sabem acalmar" size={76} italic color={C.creamDim} out={s4Out} />)}
          {at(520, <Line t={t} start={S4.dragon - 0.65} text="até um *dragão.*" size={136} out={s4Out} />)}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
