import { toRuns } from './pixelRuns';

interface PixelRectsProps {
  /** The pixel map: one character per pixel. */
  rows: string[];
  /** The color of a character, or nothing to leave that pixel transparent. */
  colorOf: (char: string) => string | undefined;
}

/**
 * Draws a pixel map as SVG rectangles, one per run of the same color. For
 * the sprites, the scenery and the icons, inside an <svg> whose viewBox is
 * the map's size in sprite pixels.
 */
export function PixelRects({ rows, colorOf }: PixelRectsProps) {
  return rows.flatMap((row, y) =>
    toRuns(row).flatMap((run) => {
      const fill = colorOf(run.char);
      return fill
        ? [
            <rect
              key={`${run.x}-${y}`}
              x={run.x}
              y={y}
              width={run.width}
              height={1}
              fill={fill}
            />,
          ]
        : [];
    }),
  );
}
