import { PixelRects } from '../PixelRects/PixelRects';
import './StreakBadge.css';

// A flame, 7x9 sprite pixels drawn at 2x. Placeholder art.
const FLAME = [
  '...o...',
  '..oo...',
  '..ooo..',
  '.oooo.o',
  '.ooooo.',
  'ooooooo',
  'ooooooo',
  '.ooooo.',
  '..ooo..',
];

interface StreakBadgeProps {
  /** Wins in a row. */
  count: number;
  /** The reward multiplier it pays, e.g. "x1.10", once there is a bonus. */
  bonus?: string;
  /** Spoken form, e.g. "4 wins in a row, rewards x1.10". */
  label: string;
}

/** A flame with the win streak and, once it pays, its reward multiplier. */
export function StreakBadge({ count, bonus, label }: StreakBadgeProps) {
  return (
    <span className="streak-badge" role="img" aria-label={label}>
      <svg
        viewBox="0 0 7 9"
        width={14}
        height={18}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <PixelRects
          rows={FLAME}
          colorOf={(char) => (char === 'o' ? 'currentColor' : undefined)}
        />
      </svg>
      <span aria-hidden="true">{count}</span>
      {bonus && (
        <span className="streak-badge-bonus" aria-hidden="true">
          {bonus}
        </span>
      )}
    </span>
  );
}
