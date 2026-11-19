import type { CSSProperties } from 'react';
import { PixelRects } from '../PixelRects/PixelRects';

interface PixelIconProps {
  /** The pixel map: one character per pixel. */
  rows: string[];
  /** Size of one sprite pixel in CSS pixels. */
  pixelSize: number;
  /** The characters drawn, in the current text color; the rest is left clear. */
  drawn?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A one-color pixel icon in the current text color, drawn crisp and hidden
 * from screen readers (whatever uses it says what it means).
 */
export function PixelIcon({
  rows,
  pixelSize,
  drawn = 'o',
  className,
  style,
}: PixelIconProps) {
  const columns = rows[0].length;
  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${columns} ${rows.length}`}
      width={columns * pixelSize}
      height={rows.length * pixelSize}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <PixelRects
        rows={rows}
        colorOf={(char) => (drawn.includes(char) ? 'currentColor' : undefined)}
      />
    </svg>
  );
}
