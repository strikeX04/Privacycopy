import timeline from '../../fogarel.timeline.json';

export const TL = timeline;
export const FPS = TL.fps;
export const W = 1080;
export const H = 1920;

export const C = {
  night: '#0B0710',
  plum: '#24101F',
  dusk: '#5A1E22',
  ridgeFar: '#2A1220',
  ridgeNear: '#140812',
  sil: '#07040A',
  moon: '#F4DDB4',
  ember: '#E8622C',
  emberHi: '#FF8A3D',
  gold: '#F5B04A',
  flame: '#FFE7B0',
  cream: '#F6EADB',
  creamDim: 'rgba(246,234,219,0.72)',
  muted: 'rgba(246,234,219,0.46)',
  faint: 'rgba(246,234,219,0.16)',
  room: '#1C0F0A',
  roomHi: '#3A1F12',
  wax: '#EAD7BF',
  wood: '#120906',
  towel: '#4A2C1C',
  skin: '#160B07',
  stone: '#1E1714',
};

export const F = {
  serif: '"Instrument Serif", Georgia, serif',
  sans: '"Inter Variable", Inter, system-ui, sans-serif',
};

import {SpringConfig} from 'remotion';
import {sp} from '../lib';
/** Spring from a start time in seconds, at this video's fps. */
export const spT = (t: number, startSec: number, config: Partial<SpringConfig> = {}) =>
  sp(t * FPS, startSec, config, FPS);
