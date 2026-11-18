import { useEffect, useState } from 'react';
import {
  CAT_POSES,
  ROLE_BY_CHAR,
  type CatPalette,
  type CatPose,
  type PixelRole,
} from './catSprites';

interface CatSpriteProps {
  palette: CatPalette;
  /** 'head' is the icon (default); 'full' is the whole sitting cat; 'walk' is the side view on the map. */
  pose?: CatPose;
  /** Size of one sprite pixel in CSS pixels. The head is 12x12 sprite pixels, the full cat 16x18. */
  pixelSize?: number;
  /** Set to false for a static sprite (shop cards, silhouettes). */
  blink?: boolean;
  /** Accessible name. Leave out when the cat is decorative. */
  label?: string;
  /** Shows the happy frame for a moment when the sprite appears (a correct move). */
  happy?: boolean;
  /** Plays the walk cycle. Only the 'walk' pose has a second frame. */
  walking?: boolean;
}

const HAPPY_MS = 700;
const WALK_FRAME_MS = 150;

interface PixelRun {
  x: number;
  width: number;
  role: PixelRole;
}

// Turns one row of the map into horizontal runs of the same role,
// so "bbbb" becomes a single 4-pixel-wide rectangle.
function toRuns(row: string): PixelRun[] {
  const runs: PixelRun[] = [];
  let x = 0;
  while (x < row.length) {
    const char = row[x];
    let end = x + 1;
    while (end < row.length && row[end] === char) end++;
    const role = ROLE_BY_CHAR[char];
    if (role) runs.push({ x, width: end - x, role });
    x = end;
  }
  return runs;
}

// Blink timing from docs/DESIGN.md: a 3.4 s cycle, eyes closed for its last
// 8%. Each cat starts at a random point of the cycle, so cats on the board
// keep their own rhythm instead of blinking in unison.
const BLINK_CYCLE_MS = 3400;
const BLINK_CLOSED_MS = Math.round(BLINK_CYCLE_MS * 0.08);

function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: number;
    const open = (wait = BLINK_CYCLE_MS - BLINK_CLOSED_MS) => {
      setClosed(false);
      timer = window.setTimeout(close, wait);
    };
    const close = () => {
      setClosed(true);
      timer = window.setTimeout(() => open(), BLINK_CLOSED_MS);
    };
    // The first wait sets this cat's offset in the cycle.
    open(Math.random() * BLINK_CYCLE_MS);

    return () => window.clearTimeout(timer);
  }, [enabled]);

  return enabled && closed;
}

// True for HAPPY_MS after mount when `happy` is set, then false.
function useHappy(happy: boolean): boolean {
  const [showing, setShowing] = useState(happy);

  useEffect(() => {
    if (!showing) return;
    const timer = window.setTimeout(() => setShowing(false), HAPPY_MS);
    return () => window.clearTimeout(timer);
  }, [showing]);

  return showing;
}

// Alternates between the two walk frames while `enabled` is true.
function useStep(enabled: boolean): boolean {
  const [step, setStep] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setStep((s) => !s), WALK_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return enabled && step;
}

export function CatSprite({
  palette,
  pose = 'head',
  pixelSize = 4,
  blink = true,
  label,
  happy = false,
  walking = false,
}: CatSpriteProps) {
  const closed = useBlink(blink);
  const showHappy = useHappy(happy);
  const stepping = useStep(walking);
  const frames = CAT_POSES[pose];
  const rows =
    stepping && frames.step
      ? frames.step
      : showHappy
        ? frames.happy
        : closed
          ? frames.closed
          : frames.open;
  // Heads are drawn in columns 0-10; column 11 is always empty.
  // Shift right by half a sprite pixel, rounded to whole CSS px so it stays crisp.
  const offsetX = Math.round(pixelSize / 2);

  return (
    <svg
      viewBox={`0 0 ${frames.width} ${frames.height}`}
      width={frames.width * pixelSize}
      height={frames.height * pixelSize}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      {rows.flatMap((row, y) =>
        toRuns(row).map((run) => (
          <rect
            key={`${run.x}-${y}`}
            x={run.x}
            y={y}
            width={run.width}
            height={1}
            fill={palette[run.role]}
          />
        )),
      )}
    </svg>
  );
}
