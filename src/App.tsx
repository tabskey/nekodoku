import { useEffect, useRef, useState } from 'react';
import { levelConfig } from './game/progression';
import { usePuzzle } from './state/usePuzzle';

// Phase 3 placeholder: times the 11x11 and 12x12 levels through the Web
// Worker, to measure generation on a real phone. GamePage replaces it in
// Phase 4. Shows only numbers, so there is no text to translate.
const LEVELS = [34, 43, 53, 44, 56, 68, 81, 94, 108, 122, 137, 152, 168, 184];

export function App() {
  const [times, setTimes] = useState<number[]>([]);
  const startedAt = useRef(0);
  const level = LEVELS[times.length];
  const puzzle = usePuzzle(level ?? LEVELS[0]);

  useEffect(() => {
    if (!puzzle || level === undefined) {
      startedAt.current = performance.now();
      return;
    }
    // The next level starts generating once this one lands.
    const now = performance.now();
    setTimes((t) => [...t, now - startedAt.current]);
    startedAt.current = now;
  }, [puzzle, level]);

  return (
    <main>
      <h1>Nekodoku</h1>
      <ol>
        {LEVELS.map((lv, i) => {
          const { size } = levelConfig(lv);
          return (
            <li key={lv}>
              {lv} · {size}×{size} ·{' '}
              {times[i] === undefined ? '…' : `${Math.round(times[i])} ms`}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
