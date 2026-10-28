import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, easeOut, prog} from '../lib';
import {CanvasLayer} from './Canvas';
import {noseOf} from './Dragon';
import {Flame, FlameDefs, Line} from './parts';
import {drawEmbers} from './SceneDragon';
import {DRAGON_SPA} from './SceneRoom';
import {C, F, H, spT, TL, W} from './theme';

const S4 = TL.s4;
const S5 = TL.s5;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const MARK = {x: 540, y: 700};

export const SceneLogo: React.FC<{t: number}> = ({t}) => {
  if (t < S5.enter - 0.4) return null;
  const bg = prog(t, S5.enter, S5.enter + 0.6, easeInOut);
  // the dragon's puff rises and becomes the brand flame
  const nose = noseOf(DRAGON_SPA(S4.puff));
  const travel = prog(t, S5.enter - 0.2, S5.name + 0.15, easeInOut);
  const bloom = spT(t, S5.name, {damping: 12, stiffness: 150, mass: 0.8});
  const ex = lerp(nose.x, MARK.x, travel);
  const ey = lerp(nose.y, MARK.y - 40, travel) - Math.sin(travel * Math.PI) * 120;
  const ring = prog(t, S5.name + 0.1, S5.name + 1.1, easeOut);
  const tag = spT(t, S5.tag);
  const cta = spT(t, S5.cta, {damping: 11, stiffness: 200, mass: 0.7});
  const breathe = 1 + 0.025 * Math.sin((t - S5.cta) * 2.6) * prog(t, S5.cta + 0.6, S5.cta + 1.4);
  const R = 128;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{opacity: bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 50% at 50% 40%, #4A1A1C 0%, ${C.plum} 45%, ${C.night} 100%)`,
        }}
      />
      <CanvasLayer draw={(ctx, tt) => drawEmbers(ctx, tt, 0.35)} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <FlameDefs />
        {travel < 1 ? (
          <g>
            <circle cx={ex} cy={ey} r={30} fill="url(#flameHalo)" />
            <circle cx={ex} cy={ey} r={7} fill="#FFE7B0" style={{filter: 'drop-shadow(0 0 10px #FF9A3C)'}} />
          </g>
        ) : null}
        <circle
          cx={MARK.x}
          cy={MARK.y - 60}
          r={R}
          fill="none"
          stroke={C.gold}
          strokeWidth={2}
          opacity={0.7}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ring)}
          transform={`rotate(-90 ${MARK.x} ${MARK.y - 60})`}
        />
        <g transform={`translate(${MARK.x} ${MARK.y}) scale(${0.95 * bloom})`}>
          <Flame t={t} ag={0.06} glow={0.9} />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Line t={t} start={S5.name - 0.05} text="Fogarel" size={230} stagger={0} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1112,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: F.sans,
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: '0.42em',
          paddingLeft: '0.42em',
          color: C.gold,
          opacity: Math.min(1, tag * 1.3),
          transform: `translateY(${(1 - tag) * 20}px)`,
        }}
      >
        CASA DE MASSAGEM
      </div>
      <div style={{position: 'absolute', top: 1290, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Line t={t} start={S5.relax} text="Venha *relaxar.*" size={96} />
      </div>
      <div style={{position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 40,
            fontWeight: 600,
            color: C.cream,
            background: C.ember,
            padding: '30px 60px',
            borderRadius: 999,
            boxShadow: '0 0 60px rgba(232,98,44,0.45)',
            opacity: Math.min(1, cta * 1.4),
            transform: `translateY(${(1 - cta) * 30}px) scale(${(0.9 + 0.1 * cta) * breathe})`,
          }}
        >
          Agende seu horário
        </div>
      </div>
    </AbsoluteFill>
  );
};
