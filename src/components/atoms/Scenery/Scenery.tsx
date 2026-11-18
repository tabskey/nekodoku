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
      {rows.flatMap((row, y) => {
        // One rectangle per run of the same role, so "ssss" is a single rect.
        const rects = [];
        for (let x = 0; x < row.length;) {
          let end = x + 1;
          while (end < row.length && row[end] === row[x]) end++;
          rects.push(
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={end - x}
              height={1}
              fill={palette[ROLE_BY_CHAR[row[x]]]}
            />,
          );
          x = end;
        }
        return rects;
      })}
    </svg>
  );
}
