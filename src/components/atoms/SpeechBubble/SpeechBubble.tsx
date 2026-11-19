import type { HTMLAttributes } from 'react';
import { PixelRects } from '../PixelRects/PixelRects';
import './SpeechBubble.css';

// The tails, in sprite pixels drawn at 4x: 'left' is a wedge pointing down
// and to the left, 'down' a small arrow pointing straight down.
const TAILS = {
  left: { rows: ['ooo', 'oo.', 'o..'], width: 12, height: 12 },
  down: { rows: ['ooo', '.o.'], width: 12, height: 8 },
};

interface SpeechBubbleProps extends HTMLAttributes<HTMLDivElement> {
  tail?: keyof typeof TAILS;
}

/**
 * A pixel speech bubble: a light card with stepped corners and a pixel tail,
 * its depth a darker shade of its own color (never black). It is absolutely
 * positioned: the parent decides where, with `className` or `style`. For the
 * 'down' tail, `--shift` moves it sideways from the bubble's center.
 */
export function SpeechBubble({
  tail = 'left',
  className = '',
  children,
  ...rest
}: SpeechBubbleProps) {
  const { rows, width, height } = TAILS[tail];
  return (
    <div
      className={`speech-bubble speech-bubble-${tail} ${className}`}
      {...rest}
    >
      <p>{children}</p>
      <svg
        className="speech-bubble-tail"
        viewBox={`0 0 3 ${rows.length}`}
        width={width}
        height={height}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <PixelRects
          rows={rows}
          colorOf={(char) => (char === 'o' ? 'currentColor' : undefined)}
        />
      </svg>
    </div>
  );
}
