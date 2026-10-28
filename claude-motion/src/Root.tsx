import React from 'react';
import {Composition, Still} from 'remotion';
import {ArticleCover} from './ArticleCover';
import {EffortVideo} from './EffortVideo';
import {FPS, H, TL, W} from './lib';
import {Fogarel} from './fogarel/Fogarel';
import * as FG from './fogarel/theme';

export const Root: React.FC = () => (
  <>
    <Composition
      id="EffortVideo"
      component={EffortVideo}
      durationInFrames={Math.round(TL.duration * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="Fogarel"
      component={Fogarel}
      durationInFrames={Math.round(FG.TL.duration * FG.FPS)}
      fps={FG.FPS}
      width={FG.W}
      height={FG.H}
    />
    <Still id="ArticleCover" component={ArticleCover} width={2000} height={800} />
  </>
);
