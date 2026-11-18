import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { CellMark, StrokeMode } from '../../../game/types';
import { Cell } from '../../atoms/Cell/Cell';
import { HOLD_MS, NO_TAP, release, strokeMode } from './touch';
import './Board.css';

interface BoardProps {
  size: number;
  zones: number[];
  marks: CellMark[];
  /** Draws a cat for a cell, given the sprite pixel size that fits it. */
  renderCat: (index: number, pixelSize: number) => ReactNode;
  cellLabel: (row: number, col: number, mark: CellMark) => string;
  label: string;
  onCellTap: (index: number) => void;
  onPlaceCat: (index: number) => void;
  onStroke: (mode: StrokeMode, indices: number[]) => void;
  /**
   * Shows large boards with comfortable cells inside a window that pans with
   * two fingers (see "Board input" in docs/ARCHITECTURE.md).
   */
  zoomed?: boolean;
  /** The cell of the last mistake; a new `id` shakes it again. */
  shake?: { index: number; id: number };
  /** Makes every cat hop: the level is won. */
  celebrate?: boolean;
}

const MAX_BOARD_PX = 480;
const PAGE_PADDING_PX = 24;
const PANEL_PADDING_PX = 6;
const CAT_GRID = 12;
// Zoomed cells: a comfortable touch target that holds the cat at 3x.
const ZOOMED_CELL_PX = 44;

interface Touch {
  pointerId: number;
  start: number;
  mode: StrokeMode;
  cells: number[];
  held: boolean;
  holdTimer: number;
}

function cellAt(x: number, y: number): number | undefined {
  const el = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>('[data-index]');
  return el ? Number(el.dataset.index) : undefined;
}

function useViewportWidth(): number {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

/**
 * The puzzle grid. Turns pointer input into taps, cat placements and
 * strokes; the reducer decides what they mean. Presentational otherwise.
 */
export function Board({
  size,
  zones,
  marks,
  renderCat,
  cellLabel,
  label,
  onCellTap,
  onPlaceCat,
  onStroke,
  zoomed = false,
  shake,
  celebrate = false,
}: BoardProps) {
  const touch = useRef<Touch | undefined>(undefined);
  // Every finger on the board, and the midpoint of the last two while panning.
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const pan = useRef<{ x: number; y: number } | undefined>(undefined);
  const viewport = useRef<HTMLDivElement>(null);
  const lastTap = useRef(NO_TAP);
  const [preview, setPreview] = useState<{
    mode: StrokeMode;
    cells: number[];
  }>();

  const gap = size <= 9 ? 6 : 4;
  const width =
    Math.min(useViewportWidth(), MAX_BOARD_PX) - 2 * PAGE_PADDING_PX;
  const cellPx = zoomed
    ? ZOOMED_CELL_PX
    : Math.floor((width - 2 * PANEL_PADDING_PX - gap * (size - 1)) / size);
  // Whole multiples only, so pixels stay square and crisp.
  const pixelSize = Math.max(1, Math.floor(cellPx / CAT_GRID));

  function end() {
    if (touch.current) window.clearTimeout(touch.current.holdTimer);
    touch.current = undefined;
    setPreview(undefined);
  }

  function midpoint() {
    const [a, b] = [...fingers.current.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function handleDown(event: PointerEvent<HTMLDivElement>) {
    // Capture every finger, so its release always reaches the board, even
    // off it; otherwise a finger lifted outside stays counted and later turns
    // one-finger strokes into pans.
    event.currentTarget.setPointerCapture(event.pointerId);
    fingers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    // A second finger turns the touch into a pan and drops the stroke.
    if (zoomed && fingers.current.size === 2) {
      end();
      pan.current = midpoint();
      return;
    }
    const start = cellAt(event.clientX, event.clientY);
    if (start === undefined || !event.isPrimary) return;
    const current: Touch = {
      pointerId: event.pointerId,
      start,
      mode: strokeMode(marks[start]),
      cells: [start],
      held: false,
      holdTimer: window.setTimeout(() => {
        current.held = true;
        onPlaceCat(start);
      }, HOLD_MS),
    };
    touch.current = current;
  }

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (fingers.current.has(event.pointerId)) {
      fingers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }
    if (pan.current && fingers.current.size >= 2) {
      const next = midpoint();
      viewport.current?.scrollBy(
        pan.current.x - next.x,
        pan.current.y - next.y,
      );
      pan.current = next;
      return;
    }
    const current = touch.current;
    // Only the finger that started the touch counts; a second one is ignored.
    if (!current || current.held || event.pointerId !== current.pointerId)
      return;
    const index = cellAt(event.clientX, event.clientY);
    if (index === undefined || current.cells.includes(index)) return;
    // Leaving the first cell cancels the hold and makes this a stroke.
    window.clearTimeout(current.holdTimer);
    current.cells.push(index);
    setPreview({ mode: current.mode, cells: [...current.cells] });
  }

  function lift(event: PointerEvent<HTMLDivElement>) {
    fingers.current.delete(event.pointerId);
    if (fingers.current.size < 2) pan.current = undefined;
  }

  function handleUp(event: PointerEvent<HTMLDivElement>) {
    lift(event);
    const current = touch.current;
    if (current && event.pointerId !== current.pointerId) return;
    end();
    if (!current) return;
    const result = release(current, lastTap.current, performance.now());
    lastTap.current = result.last;
    const outcome = result.release;
    if (outcome.kind === 'stroke') onStroke(outcome.mode, outcome.cells);
    if (outcome.kind === 'tap') {
      // A tap acts at once; a second tap soon after also places a cat.
      onCellTap(outcome.index);
      if (outcome.double) onPlaceCat(outcome.index);
    }
  }

  // What a cell shows, including the live preview of a stroke in progress.
  function shownMark(index: number): CellMark {
    const mark = marks[index];
    if (!preview?.cells.includes(index)) return mark;
    if (preview.mode === 'mark' && mark === 'empty') return 'marked';
    if (preview.mode === 'erase' && mark === 'marked') return 'empty';
    return mark;
  }

  return (
    <div
      ref={viewport}
      className={
        zoomed ? 'board-viewport board-viewport-zoomed' : 'board-viewport'
      }
      style={zoomed ? { width, height: width } : undefined}
    >
      <div
        className={celebrate ? 'board board-celebrate' : 'board'}
        role="group"
        aria-label={label}
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
          gap,
          padding: PANEL_PADDING_PX,
          fontSize: cellPx,
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={(event) => {
          lift(event);
          if (event.pointerId === touch.current?.pointerId) end();
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        {zones.map((zone, index) => {
          const mark = shownMark(index);
          return (
            <Cell
              // A new key remounts the cell, which replays the shake.
              key={shake?.index === index ? `${index}-${shake.id}` : index}
              shaking={shake?.index === index}
              index={index}
              mark={mark}
              color={`var(--zone-${zone})`}
              size={cellPx}
              cat={renderCat(index, pixelSize)}
              label={cellLabel(
                Math.floor(index / size) + 1,
                (index % size) + 1,
                mark,
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
