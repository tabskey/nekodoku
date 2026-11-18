// Everything a level does with sound: one effect per change of the level,
// the help sparkle, the music, and the restoration's sweep and chime. Kept out
// of GamePage so the page only wires the game (see Sound in
// docs/ARCHITECTURE.md).
import { useEffect, useRef, useState } from 'react';
import { play, startMusic, stopMusic } from '../../audio/audio';
import type { LevelState } from '../../state/levelReducer';
import { levelSound } from './levelSounds';

interface LevelAudioOptions {
  /** The music option. */
  music: boolean;
  /** A Boss level plays a tenser song. */
  boss: boolean;
  /** The restoration is on screen: play its sweep and chime. */
  restoring: boolean;
}

export function useLevelAudio(
  state: LevelState,
  { music, boss, restoring }: LevelAudioOptions,
) {
  const playing = state.status === 'playing';

  // Music plays only while the level is being played: a chill loop, or a
  // tenser one on a Boss. It stops on the win or loss and when leaving.
  useEffect(() => {
    if (!playing || !music) return;
    startMusic(boss ? 'boss' : 'level');
    return stopMusic;
  }, [playing, music, boss]);

  // One sound per change of the level, decided by levelSound.
  const before = useRef(state);
  const afterHelp = useRef(false);
  useEffect(() => {
    const effect = levelSound(before.current, state, afterHelp.current);
    before.current = state;
    afterHelp.current = false;
    if (effect) play(effect);
  }, [state]);

  // The restoration's sweep during the silhouette and its chime when the cat
  // appears, at the animation's 50% and 86% of 3.6 s.
  const [restorationRun, setRestorationRun] = useState(0);
  useEffect(() => {
    if (!restoring) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      play('chime');
      return;
    }
    const sweep = window.setTimeout(() => play('sweep'), 1800);
    const chime = window.setTimeout(() => play('chime'), 3100);
    return () => {
      window.clearTimeout(sweep);
      window.clearTimeout(chime);
    };
  }, [restoring, restorationRun]);

  return {
    /**
     * Plays the help sparkle. `changesBoard` is false for a help that does
     * nothing (Eraser with nothing to erase), so the next move is not muted.
     */
    playHelp(changesBoard: boolean) {
      play('help');
      afterHelp.current = changesBoard;
    },
    /** The restoration plays again: replay its sounds. */
    replayRestoration: () => setRestorationRun((run) => run + 1),
  };
}
