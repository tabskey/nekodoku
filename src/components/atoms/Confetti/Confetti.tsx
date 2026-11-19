import type { CSSProperties } from 'react';
import './Confetti.css';

const COLORS = [
  'var(--zone-0)',
  'var(--zone-1)',
  'var(--zone-2)',
  'var(--zone-3)',
  'var(--zone-4)',
  'var(--zone-5)',
  'var(--primary)',
  'var(--gold)',
];

// 36 squares, placed by formulas so the screen is the same every time.
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 29) % 97) + 1,
  size: 6 + (i % 3) * 2,
  color: COLORS[i % COLORS.length],
  fall: 3 + ((i * 7) % 5) * 0.5,
  stagger: ((i * 13) % 17) * 0.2,
}));

interface ConfettiProps {
  /** Seconds before the first piece starts to fall. */
  startSeconds?: number;
}

/**
 * Confetti falling over the whole screen, in hard steps, forever. It fills
 * its parent (which must be positioned), takes no taps and is hidden with
 * reduced motion. Put it first in the parent, so the rest sits above it.
 */
export function Confetti({ startSeconds = 0 }: ConfettiProps) {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((piece, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${piece.x}%`,
              '--size': `${piece.size}px`,
              '--color': piece.color,
              '--fall': `${piece.fall}s`,
              '--delay': `${startSeconds + piece.stagger}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
