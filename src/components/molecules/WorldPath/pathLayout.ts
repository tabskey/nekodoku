// Where the tiles and path dots of one world sit on its map. The levels
// follow one of a few shapes (see worldRoute in game/biomes.ts), on a grid
// with row 0 at the bottom. The last tile, the Boss, sits alone in a top row,
// centered, with room beside it for its ghost. Every value is a whole pixel
// so sprites stay crisp, and every step between tiles is a multiple of the
// dot spacing, so the dots land exactly on the tiles.
import type { WorldRoute } from '../../../game/biomes';

// Distance between two dots; the cat moves one dot per step.
export const DOT_PX = 12;
const WIDTH = 288;
// Room above the top row for the Boss's cat, and below the bottom row for
// the best-score note.
const TOP_PX = 60;
const BOTTOM_PX = 48;

interface Cell {
  col: number;
  row: number;
}

interface Grid {
  columns: number;
  rowPx: number;
  /** The grid cell of each of the `levels` tiles before the Boss, in order. */
  cells: (levels: number) => Cell[];
}

// Rows of `columns` tiles, going right on one row and back left on the next.
function snakeCells(levels: number, columns: number): Cell[] {
  return Array.from({ length: levels }, (_, i) => {
    const row = Math.floor(i / columns);
    const step = i % columns;
    return { col: row % 2 === 0 ? step : columns - 1 - step, row };
  });
}

// A staircase: one step sideways, one up, and so on, turning back at the
// walls. Two tiles per row.
function stairsCells(levels: number, columns: number): Cell[] {
  const cells: Cell[] = [];
  let col = 0;
  let row = 0;
  let dir = 1;
  for (let i = 0; i < levels; i++) {
    cells.push({ col, row });
    if (i % 2 === 0) {
      if (col + dir < 0 || col + dir >= columns) dir = -dir;
      col += dir;
    } else {
      row++;
    }
  }
  return cells;
}

const GRIDS: Record<WorldRoute['shape'], Grid> = {
  snake: { columns: 4, rowPx: 108, cells: (n) => snakeCells(n, 4) },
  wide: { columns: 3, rowPx: 96, cells: (n) => snakeCells(n, 3) },
  stairs: { columns: 4, rowPx: 84, cells: (n) => stairsCells(n, 4) },
};

const DEFAULT_ROUTE: WorldRoute = { shape: 'snake', mirrored: false };

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

export function pathLayout(
  tileCount: number,
  route: WorldRoute = DEFAULT_ROUTE,
): PathLayout {
  const grid = GRIDS[route.shape];
  const columnPx = WIDTH / grid.columns;
  const cells = grid.cells(tileCount - 1);
  const bossRow = Math.max(-1, ...cells.map((cell) => cell.row)) + 1;
  const height = TOP_PX + bossRow * grid.rowPx + BOTTOM_PX;
  const centers: Point[] = cells.map(({ col, row }) => ({
    x:
      columnPx / 2 + (route.mirrored ? grid.columns - 1 - col : col) * columnPx,
    y: height - BOTTOM_PX - row * grid.rowPx,
  }));
  centers.push({ x: WIDTH / 2, y: TOP_PX });

  const points: Point[] = [centers[0]];
  const tilePoints = [0];
  for (let i = 1; i < tileCount; i++) {
    const to = centers[i];
    // Up first, then across: only the climb to the Boss needs both.
    walk(points, { x: points[points.length - 1].x, y: to.y });
    walk(points, to);
    tilePoints.push(points.length - 1);
  }

  return { width: WIDTH, height, points, tilePoints };
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
