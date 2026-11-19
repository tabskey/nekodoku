import { useState, type CSSProperties } from 'react';
import ghostUrl from '../../../assets/ghost-cat.svg';
import { Button } from '../../atoms/Button/Button';
import { CatSprite } from '../../atoms/CatSprite/CatSprite';
import type { CatPalette } from '../../atoms/CatSprite/catSprites';
import { PixelRects } from '../../atoms/PixelRects/PixelRects';
import './Restoration.css';

// The party that starts when the cat appears (3.1 s into the animation):
// confetti falling and sparkles twinkling, placed by formulas so the screen
// is the same every time.
const CONFETTI_COLORS = [
  'var(--zone-0)',
  'var(--zone-1)',
  'var(--zone-2)',
  'var(--zone-3)',
  'var(--zone-4)',
  'var(--zone-5)',
  'var(--primary)',
  'var(--gold)',
];

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 29) % 97) + 1,
  size: 6 + (i % 3) * 2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  fall: 3 + ((i * 7) % 5) * 0.5,
  delay: 3.1 + ((i * 13) % 17) * 0.2,
}));

// A little plus sign, 3x3 sprite pixels, drawn at 4x around the cat's spot.
const SPARKLE = ['.o.', 'ooo', '.o.'];
const SPARKLES = [
  { x: -36, y: 8 },
  { x: 144, y: 24 },
  { x: -28, y: 104 },
  { x: 148, y: 116 },
  { x: 28, y: -32 },
  { x: 100, y: 160 },
];

interface RestorationProps {
  /** The restored cat's colors. */
  palette: CatPalette;
  name: string;
  title: string;
  message: string;
  /** The big cheer over the cat, e.g. "YAY!". */
  yay: string;
  /** Spoken name of the revealed cat. */
  catLabel: string;
  backLabel: string;
  replayLabel: string;
  onBack: () => void;
  /** Called when the sequence plays again, e.g. to replay its sounds. */
  onReplay?: () => void;
}

/**
 * The ghost turning back into a cat after a Boss is beaten: about 3.6 s in
 * hard steps (see Restoration sequence in docs/DESIGN.md).
 */
export function Restoration({
  palette,
  name,
  title,
  message,
  yay,
  catLabel,
  backLabel,
  replayLabel,
  onBack,
  onReplay,
}: RestorationProps) {
  // Changing the key remounts the animated parts, which plays them again.
  const [run, setRun] = useState(0);

  return (
    <section
      key={run}
      className="restoration"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="restoration-confetti" aria-hidden="true">
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            style={
              {
                '--x': `${piece.x}%`,
                '--size': `${piece.size}px`,
                '--color': piece.color,
                '--fall': `${piece.fall}s`,
                '--delay': `${piece.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <p className="restoration-yay" aria-hidden="true">
        {yay}
      </p>
      <div className="restoration-spot">
        <div className="restoration-rays" aria-hidden="true" />
        {SPARKLES.map((spot, i) => (
          <span
            key={i}
            className="restoration-appear restoration-sparkle"
            style={{ left: spot.x, top: spot.y }}
            aria-hidden="true"
          >
            <svg
              className="restoration-twinkle"
              style={{
                animationDelay: `${i * 0.15}s`,
                color: i % 2 ? 'var(--gold)' : 'var(--primary)',
              }}
              viewBox="0 0 3 3"
              width={12}
              height={12}
              shapeRendering="crispEdges"
            >
              <PixelRects
                rows={SPARKLE}
                colorOf={(char) => (char === 'o' ? 'currentColor' : undefined)}
              />
            </svg>
          </span>
        ))}
        <div className="restoration-stage restoration-move">
          {/* 12x14 ghost at 8x, centered on the 16x18 cat. */}
          <img
            className="restoration-ghost"
            src={ghostUrl}
            width={96}
            height={112}
            alt=""
            draggable={false}
          />
          <span className="restoration-silhouette" aria-hidden="true">
            <CatSprite
              palette={palette}
              pose="full"
              pixelSize={8}
              blink={false}
            />
          </span>
          <span className="restoration-show">
            <CatSprite
              palette={palette}
              pose="full"
              pixelSize={8}
              label={catLabel}
            />
          </span>
        </div>
      </div>
      <div className="restoration-show restoration-text">
        <h2>{title}</h2>
        <p className="restoration-name">{name}</p>
        <p>{message}</p>
      </div>
      <div className="restoration-show restoration-actions">
        <Button onClick={onBack}>{backLabel}</Button>
        <button
          type="button"
          className="restoration-replay"
          onClick={() => {
            setRun((r) => r + 1);
            onReplay?.();
          }}
        >
          {replayLabel}
        </button>
      </div>
    </section>
  );
}
