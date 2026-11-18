import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { CellMark, StrokeMode } from '../../../game/types';
import { Cell } from '../../atoms/Cell/Cell';
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
}

// Proposed timings, see "Board input" in docs/ARCHITECTURE.md.
const DOUBLE_TAP_MS = 300;
const HOLD_MS = 450;
const MAX_BOARD_PX = 480;
const PAGE_PADDING_PX = 24;
const PANEL_PADDING_PX = 6;
const CAT_GRID = 12;

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
}: BoardProps) {
  const touch = useRef<Touch | undefined>(undefined);
  const lastTap = useRef({ index: -1, time: 0 });
  const [preview, setPreview] = useState<{
    mode: StrokeMode;
    cells: number[];
  }>();

  const gap = size <= 9 ? 6 : 4;
  const width =
    Math.min(useViewportWidth(), MAX_BOARD_PX) - 2 * PAGE_PADDING_PX;
  const cellPx = Math.floor(
    (width - 2 * PANEL_PADDING_PX - gap * (size - 1)) / size,
  );
  // Whole multiples only, so pixels stay square and crisp.
  const pixelSize = Math.max(1, Math.floor(cellPx / CAT_GRID));

  function end() {
    if (touch.current) window.clearTimeout(touch.current.holdTimer);
    touch.current = undefined;
    setPreview(undefined);
  }

  function handleDown(event: PointerEvent<HTMLDivElement>) {
    const start = cellAt(event.clientX, event.clientY);
    if (start === undefined || !event.isPrimary) return;
    // Keep receiving the pointer even if a mouse leaves the board.
    event.currentTarget.setPointerCapture(event.pointerId);
    const current: Touch = {
      pointerId: event.pointerId,
      start,
      mode: marks[start] === 'marked' ? 'erase' : 'mark',
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

  function handleUp(event: PointerEvent<HTMLDivElement>) {
    const current = touch.current;
    if (current && event.pointerId !== current.pointerId) return;
    end();
    if (!current || current.held) return;
    if (current.cells.length > 1) {
      onStroke(current.mode, current.cells);
      return;
    }
    // A tap acts at once; a second tap on the same cell soon after places a cat.
    const now = performance.now();
    const isDouble =
      lastTap.current.index === current.start &&
      now - lastTap.current.time < DOUBLE_TAP_MS;
    onCellTap(current.start);
    if (isDouble) onPlaceCat(current.start);
    lastTap.current = isDouble
      ? { index: -1, time: 0 }
      : { index: current.start, time: now };
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
      className="board"
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
        if (event.pointerId === touch.current?.pointerId) end();
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {zones.map((zone, index) => {
        const mark = shownMark(index);
        return (
          <Cell
            key={index}
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
  );
}
