import { useEffect, useState } from 'react';

/** A phrase other than `last`, picked with `random` (0 to 1). */
export function pickOther(
  phrases: string[],
  last: string | undefined,
  random: () => number = Math.random,
): string | undefined {
  const others = phrases.filter((phrase) => phrase !== last);
  const pool = others.length > 0 ? others : phrases;
  return pool[Math.floor(random() * pool.length)];
}

/**
 * What a cat says when it is tapped: a random phrase, never the same twice in
 * a row, that goes away by itself after `showMs`.
 */
export function useCatSays(phrases: string[], showMs = 2500) {
  const [said, setSaid] = useState<string>();

  useEffect(() => {
    if (said === undefined) return;
    const timer = window.setTimeout(() => setSaid(undefined), showMs);
    return () => window.clearTimeout(timer);
  }, [said, showMs]);

  return {
    said,
    say: () => setSaid(pickOther(phrases, said)),
    hush: () => setSaid(undefined),
  };
}
