// Where the tiles and path dots of one world sit on its map. The path snakes
// upward from the bottom left, COLUMNS tiles per row, so any world length
// fits the same width. The last tile, the Boss, sits alone in a top row,
// centered, with room beside it for its ghost. Every value is a whole pixel
// so sprites stay crisp.

export const COLUMNS = 4;
export const COLUMN_PX = 72;
export const ROW_PX = 108;
// Distance between two dots; the cat moves one dot per step.
export const DOT_PX = 12;
// Room above the top row for the standing cat, and below the bottom row for
// the best-score note.
const TOP_PX = 60;
const BOTTOM_PX = 48;

export interface Point {
  x: number;
  y: number;
}

export interface PathLayout {
  width: number;
  height: number;
  /** Every dot along the path, from the first tile to the last. */
  points: Point[];
  /** For each tile, the index of its center in `points`. */
  tilePoints: number[];
}

export function pathLayout(tileCount: number): PathLayout {
  const width = COLUMNS * COLUMN_PX;
  const levels = tileCount - 1;
  const rows = Math.ceil(levels / COLUMNS) + 1;
  const height = TOP_PX + (rows - 1) * ROW_PX + BOTTOM_PX;
  const centers = Array.from({ length: tileCount }, (_, i) => {
    if (i === levels) return { x: width / 2, y: TOP_PX };
    const row = Math.floor(i / COLUMNS);
    const step = i % COLUMNS;
    // Even rows go right, odd rows come back left.
    const column = row % 2 === 0 ? step : COLUMNS - 1 - step;
    return {
      x: COLUMN_PX / 2 + column * COLUMN_PX,
      y: height - BOTTOM_PX - row * ROW_PX,
    };
  });

  const points: Point[] = [centers[0]];
  const tilePoints = [0];
  for (let i = 1; i < tileCount; i++) {
    const to = centers[i];
    // Up first, then across: only the climb to the Boss needs both.
    walk(points, { x: points[points.length - 1].x, y: to.y });
    walk(points, to);
    tilePoints.push(points.length - 1);
  }

  return { width, height, points, tilePoints };
}

// Adds the dots of a straight line from the last point to `to`.
function walk(points: Point[], to: Point) {
  const from = points[points.length - 1];
  const steps = (Math.abs(to.x - from.x) + Math.abs(to.y - from.y)) / DOT_PX;
  for (let s = 1; s <= steps; s++) {
    points.push({
      x: from.x + ((to.x - from.x) / steps) * s,
      y: from.y + ((to.y - from.y) / steps) * s,
    });
  }
}
