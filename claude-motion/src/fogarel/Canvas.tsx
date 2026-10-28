import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {W, H, FPS} from './theme';

/** Full-frame canvas redrawn from scratch every frame; draw() must be pure in t. */
export const CanvasLayer: React.FC<{
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  style?: React.CSSProperties;
}> = ({draw, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    draw(ctx, frame / FPS);
  });
  return (
    <AbsoluteFill style={style}>
      <canvas ref={ref} width={W} height={H} style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

type RGB = [number, number, number];
const FIRE_STOPS: [number, RGB][] = [
  [0, [255, 250, 228]],
  [0.14, [255, 216, 122]],
  [0.38, [255, 142, 52]],
  [0.68, [206, 62, 24]],
  [1, [70, 16, 10]],
];

export const fireColor = (u: number): RGB => {
  for (let i = 1; i < FIRE_STOPS.length; i++) {
    const [b, cb] = FIRE_STOPS[i];
    const [a, ca] = FIRE_STOPS[i - 1];
    if (u <= b) {
      const k = (u - a) / (b - a);
      return [0, 1, 2].map((j) => ca[j] + (cb[j] - ca[j]) * k) as RGB;
    }
  }
  return FIRE_STOPS[FIRE_STOPS.length - 1][1];
};

export const blob = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rgb: RGB,
  alpha: number,
  hard = 0.15,
) => {
  if (alpha <= 0.003 || r <= 0.5) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  const c = `${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0}`;
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(hard, `rgba(${c},${alpha * 0.85})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
