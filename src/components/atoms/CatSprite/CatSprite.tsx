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
  /** 'head' is the icon (default); 'full' is the whole sitting cat. */
  pose?: CatPose;
  /** Size of one sprite pixel in CSS pixels. The head is 12x12 sprite pixels, the full cat 16x18. */
  pixelSize?: number;
  /** Set to false for a static sprite (shop cards, silhouettes). */
  blink?: boolean;
  /** Accessible name. Leave out when the cat is decorative. */
  label?: string;
}

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

// Closes the eyes for a moment every few seconds, at a slightly random pace
// so several cats on screen do not blink together.
function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: number;
    const open = () => {
      setClosed(false);
      timer = window.setTimeout(close, 2500 + Math.random() * 2500);
    };
    const close = () => {
      setClosed(true);
      timer = window.setTimeout(open, 160);
    };
    open();

    return () => window.clearTimeout(timer);
  }, [enabled]);

  return enabled && closed;
}

export function CatSprite({
  palette,
  pose = 'head',
  pixelSize = 4,
  blink = true,
  label,
}: CatSpriteProps) {
  const closed = useBlink(blink);
  const frames = CAT_POSES[pose];
  const rows = closed ? frames.closed : frames.open;

  return (
    <svg
      viewBox={`0 0 ${frames.width} ${frames.height}`}
      width={frames.width * pixelSize}
      height={frames.height * pixelSize}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
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
