import { PixelRects } from '../PixelRects/PixelRects';
import { ROLE_BY_CHAR, type SceneryPalette } from './sceneries';

interface SceneryProps {
  rows: string[];
  palette: SceneryPalette;
  /** Size of one sprite pixel in CSS pixels. */
  pixelSize?: number;
}

/** A Boss scenery strip, drawn from its pixel map in the world's colors. */
export function Scenery({ rows, palette, pixelSize = 4 }: SceneryProps) {
  const width = rows[0].length;
  return (
    <svg
      viewBox={`0 0 ${width} ${rows.length}`}
      width={width * pixelSize}
      height={rows.length * pixelSize}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <PixelRects rows={rows} colorOf={(char) => palette[ROLE_BY_CHAR[char]]} />
    </svg>
  );
}
