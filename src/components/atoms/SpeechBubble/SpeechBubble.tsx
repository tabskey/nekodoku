import type { HTMLAttributes } from 'react';
import { PixelIcon } from '../PixelIcon/PixelIcon';
import './SpeechBubble.css';

// The tails, in sprite pixels drawn at 4x: 'left' is a wedge pointing down
// and to the left, 'down' a small arrow pointing straight down.
const TAILS = {
  left: ['ooo', 'oo.', 'o..'],
  down: ['ooo', '.o.'],
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
  return (
    <div
      className={`speech-bubble speech-bubble-${tail} ${className}`}
      {...rest}
    >
      <p>{children}</p>
      <PixelIcon
        className="speech-bubble-tail"
        rows={TAILS[tail]}
        pixelSize={4}
      />
    </div>
  );
}
