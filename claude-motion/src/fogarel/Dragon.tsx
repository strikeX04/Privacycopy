import React from 'react';
import {add, lerpP, mul, P, poly, polar, pt, ribbon, rot, spikes} from './geom';

export type Pose = {
  x: number;
  y: number;
  scale: number;
  /** Head position relative to the dragon's shoulder, in local px. */
  head: P;
  headAng: number;
  /** 0 closed .. 1 wide open. */
  jaw: number;
  /** 0 folded .. 1 fully spread. */
  wing: number;
  flap: number;
  /** Tail tip sway in local px. */
  tailSway: number;
  lying: boolean;
  /** 1 = glowing slit, 0 = closed happy curve. */
  eye: number;
  /** Throat glow before the fire, 0..1. */
  throat: number;
  /** Orange rim light from the fire, 0..1. */
  rim: number;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const NECK_BASE = pt(14, -38);
const MOUTH = pt(150, 14);
const NOSE = pt(150, -4);

const toWorld = (pose: Pose, p: P): P => ({x: pose.x + p.x * pose.scale, y: pose.y + p.y * pose.scale});
const headToLocal = (pose: Pose, p: P): P => add(pose.head, rot(p, pose.headAng));

/** Where the fire comes out, in frame px, and which way it goes. */
export const mouthOf = (pose: Pose) => {
  const jawA = pose.jaw * 0.62;
  const tip = lerpP(MOUTH, rot(pt(132, 20), jawA), 0.5);
  return {
    p: toWorld(pose, headToLocal(pose, tip)),
    ang: pose.headAng + jawA * 0.45,
  };
};
export const noseOf = (pose: Pose) => toWorld(pose, headToLocal(pose, NOSE));

const wingPath = (anchor: P, spread: number, flap: number, attach: P, scale = 1) => {
  const hum = lerp(-2.6, -2.05, spread) + flap * 0.45;
  const fore = lerp(0.2, -1.15, spread) + flap * 0.75;
  const fingersOpen = [-2.55, -2.95, 2.95, 2.55];
  const fingersShut = [3.05, 2.95, 2.85, 2.72];
  const lens = [300, 330, 300, 240];
  const elbow = add(anchor, polar(hum, 150 * scale));
  const wrist = add(elbow, polar(fore, 190 * scale));
  const tips = fingersOpen.map((a, i) =>
    add(wrist, polar(lerp(fingersShut[i], a, spread) + flap * 0.55, lens[i] * scale * lerp(0.72, 1, spread))),
  );
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(anchor.x)},${f(anchor.y)}L${f(elbow.x)},${f(elbow.y)}L${f(wrist.x)},${f(wrist.y)}L${f(tips[0].x)},${f(tips[0].y)}`;
  const chain = [...tips, attach];
  for (let i = 1; i < chain.length; i++) {
    const a = chain[i - 1];
    const b = chain[i];
    const c = lerpP(lerpP(a, b, 0.5), wrist, 0.28);
    d += `Q${f(c.x)},${f(c.y)} ${f(b.x)},${f(b.y)}`;
  }
  d += 'Z';
  const bones =
    `M${f(anchor.x)},${f(anchor.y)}L${f(elbow.x)},${f(elbow.y)}L${f(wrist.x)},${f(wrist.y)}` +
    tips.map((t) => `M${f(wrist.x)},${f(wrist.y)}L${f(t.x)},${f(t.y)}`).join('');
  // Thumb claw at the wrist.
  const claw = poly([add(wrist, polar(fore - 0.6, 10)), add(wrist, polar(fore + 0.25, 34)), add(wrist, polar(fore + 1.2, 10))]);
  return {d, bones, claw};
};

const SKULL =
  'M-16,-24C6,-44 50,-42 80,-28C100,-19 124,-15 150,-11C161,-9 166,0 159,7L150,9C120,11 82,12 52,15C30,20 2,26 -16,20Z';
const JAW = 'M4,10C40,18 92,16 140,15C147,17 145,25 135,27C100,31 52,37 22,39C4,39 -8,28 4,10Z';
const HORN_A = 'M-4,-28C-34,-58 -74,-74 -118,-80C-84,-60 -50,-42 -22,-14Z';
const HORN_B = 'M22,-35C4,-64 -22,-86 -54,-100C-28,-74 -6,-52 8,-28Z';
const FRILL = 'M-12,6L-48,30L-10,26ZM-14,-6L-56,-4L-16,8Z';
const TEETH = 'M70,13L74,22L78,13ZM96,12L100,21L104,12ZM120,11L123,19L126,11Z';

export const Dragon: React.FC<{pose: Pose; id: string; color?: string; membrane?: string}> = ({
  pose,
  id,
  color = '#07040A',
  membrane = '#140A12',
}) => {
  const dirH = polar(pose.headAng, 1);
  const neck = ribbon(
    NECK_BASE,
    add(NECK_BASE, pt(34, -96)),
    add(pose.head, mul(dirH, -90)),
    pose.head,
    (s) => 92 - 48 * s,
  );
  const torso = ribbon(pt(-262, 2), pt(-180, 34), pt(-60, 44), pt(34, -8), (s) => 104 + 50 * Math.sin(Math.PI * s));
  const tailTip = pose.lying ? pt(-470 + pose.tailSway, 210) : pt(-640 + pose.tailSway * 0.3, 150 + pose.tailSway);
  const tailC1 = pose.lying ? pt(-420, 40) : pt(-470, 150);
  const tailC2 = pose.lying ? pt(-330, 40) : pt(-380, 40);
  const tail = ribbon(tailTip, tailC1, tailC2, pt(-250, 10), (s) => 4 + 92 * s * s * (1.6 - 0.6 * s));
  const tailDir = Math.atan2(tailC1.y - tailTip.y, tailC1.x - tailTip.x) + Math.PI;
  const spade = poly([
    add(tailTip, polar(tailDir + 1.6, 22)),
    add(tailTip, polar(tailDir, 46)),
    add(tailTip, polar(tailDir - 1.6, 22)),
    add(tailTip, polar(tailDir + Math.PI, 10)),
  ]);

  const back = spikes(torso.left, torso.normals, 0.05, 0.8, 3, (s) => 16 + 10 * Math.sin(Math.PI * s));
  const neckSpikes = spikes(neck.left, neck.normals, 0.05, 0.9, 3, (s) => 18 - 8 * s);
  const tailSpikes = spikes(tail.left, tail.normals, 0.2, 0.98, 3, (s) => 6 + 12 * s);

  const nearWing = wingPath(pt(-46, -56), pose.wing, pose.flap, pt(-205, -46));
  const farWing = wingPath(pt(-10, -64), Math.min(1, pose.wing * 1.02), pose.flap * 0.9 + 0.22 * pose.wing, pt(-170, -60), 0.92);

  const legs = pose.lying
    ? 'M-10,40C10,62 50,70 70,62C62,48 30,40 -10,40ZM-230,50C-210,70 -170,80 -140,72C-150,52 -190,44 -230,50Z'
    : [
        ribbon(pt(2, 24), pt(48, 86), pt(10, 128), pt(48, 162), (s) => 76 - 44 * s).d,
        poly([pt(40, 150), pt(84, 166), pt(48, 172), pt(76, 180), pt(36, 180), pt(30, 160)]),
        `M-196,46m-84,0a84,96 0 1,0 168,0a84,96 0 1,0 -168,0`,
        ribbon(pt(-196, 70), pt(-140, 130), pt(-214, 150), pt(-184, 182), (s) => 66 - 36 * s).d,
        poly([pt(-190, 170), pt(-140, 184), pt(-178, 190), pt(-150, 198), pt(-198, 198), pt(-204, 178)]),
      ].join('');
  const farLeg = pose.lying ? '' : ribbon(pt(-30, 24), pt(-2, 86), pt(-34, 126), pt(0, 160), (s) => 62 - 36 * s).d;

  const jawA = pose.jaw * 0.62;
  const headT = `translate(${pose.head.x} ${pose.head.y}) rotate(${(pose.headAng * 180) / Math.PI})`;
  const rimA = pose.rim;

  return (
    <g
      transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale})`}
      style={{
        filter:
          rimA > 0.01
            ? `drop-shadow(0 0 ${6 + 10 * rimA}px rgba(255,128,48,${0.75 * rimA})) drop-shadow(0 0 2px rgba(255,190,110,${0.6 * rimA}))`
            : undefined,
      }}
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={neck.d} />
          <path d={torso.d} />
        </clipPath>
        <radialGradient id={`${id}-throat`}>
          <stop offset="0%" stopColor="#FFE3A6" stopOpacity={1} />
          <stop offset="35%" stopColor="#FF9A3C" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#E8521E" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* far side, slightly lighter so the overlap reads */}
      <g fill={membrane}>
        <path d={farWing.d} opacity={0.95} />
        <path d={farLeg} fill={color} />
      </g>
      <path d={farWing.bones} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none" />
      <g fill={color}>
        <path d={tail.d} />
        <path d={tailSpikes} />
        <path d={spade} />
        <path d={legs} />
        <path d={torso.d} />
        <path d={back} />
        <path d={neck.d} />
        <path d={neckSpikes} />
      </g>
      {pose.throat > 0.01 ? (
        <g clipPath={`url(#${id}-body)`} style={{mixBlendMode: 'screen'}}>
          <ellipse
            cx={lerp(NECK_BASE.x, pose.head.x, 0.35)}
            cy={lerp(NECK_BASE.y, pose.head.y, 0.45)}
            rx={90}
            ry={170}
            fill={`url(#${id}-throat)`}
            opacity={pose.throat}
          />
        </g>
      ) : null}
      <g transform={headT}>
        {pose.jaw > 0.02 ? (
          <path
            d={`M4,8L150,4L${(Math.cos(jawA) * 140 - Math.sin(jawA) * 20).toFixed(1)},${(Math.sin(jawA) * 140 + Math.cos(jawA) * 20).toFixed(1)}Z`}
            fill="#FF8A3D"
            opacity={0.85}
          />
        ) : null}
        <g fill={color}>
          <path d={HORN_B} />
          <path d={HORN_A} />
          <path d={FRILL} />
          <g transform={`rotate(${(jawA * 180) / Math.PI} 8 12)`}>
            <path d={JAW} />
          </g>
          <path d={SKULL} />
          {pose.jaw > 0.05 ? <path d={TEETH} /> : null}
        </g>
        {pose.eye > 0.02 ? (
          <ellipse cx={62} cy={-21} rx={11} ry={3.6 * pose.eye + 0.4} fill="#FFC560" style={{filter: 'drop-shadow(0 0 6px rgba(255,180,80,0.9))'}} />
        ) : (
          <path d="M50,-24Q62,-15 74,-24" stroke="#FFC560" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />
        )}
      </g>
      <path d={nearWing.d} fill={membrane} />
      <g stroke={color} strokeLinecap="round" fill="none">
        <path d={nearWing.bones} strokeWidth={8} />
      </g>
      <path d={nearWing.claw} fill={color} />
    </g>
  );
};
