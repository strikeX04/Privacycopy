import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain} from '../components/primitives';
import {useFonts} from '../components/useFonts';
import {SceneDragon} from './SceneDragon';
import {SceneLogo} from './SceneLogo';
import {SceneRoom} from './SceneRoom';
import {C, FPS} from './theme';

export const Fogarel: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <SceneDragon t={t} />
      <SceneRoom t={t} />
      <SceneLogo t={t} />
      <Grain frame={frame} opacity={0.07} />
    </AbsoluteFill>
  );
};
