import { useEffect, useMemo, useState } from 'react';
import { generatePuzzle } from '../game/generator';
import { levelConfig } from '../game/progression';
import type { SolvedPuzzle } from '../game/types';

// Boards from this size up can take seconds on a phone; see "Puzzle
// generation" in docs/ARCHITECTURE.md.
const WORKER_MIN_SIZE = 11;

/**
 * The puzzle for `level`, or undefined while it is still being generated.
 * Small boards are generated directly; large ones in a Web Worker, which is
 * stopped if the level changes or the component unmounts.
 */
export function usePuzzle(level: number): SolvedPuzzle | undefined {
  const inWorker = levelConfig(level).size >= WORKER_MIN_SIZE;
  const direct = useMemo(
    () => (inWorker ? undefined : generatePuzzle(level)),
    [level, inWorker],
  );
  const [loaded, setLoaded] = useState<{
    level: number;
    puzzle: SolvedPuzzle;
  }>();

  useEffect(() => {
    if (!inWorker) return;
    const worker = new Worker(new URL('./puzzle.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event: MessageEvent<SolvedPuzzle>) =>
      setLoaded({ level, puzzle: event.data });
    worker.postMessage(level);
    return () => worker.terminate();
  }, [level, inWorker]);

  return direct ?? (loaded?.level === level ? loaded.puzzle : undefined);
}
