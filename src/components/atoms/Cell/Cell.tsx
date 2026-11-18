import type { ReactNode } from 'react';
import type { CellMark } from '../../../game/types';
import './Cell.css';

interface CellProps {
  index: number;
  mark: CellMark;
  /** Any CSS background, usually a zone variable (zones 9 to 11 are patterned). */
  color: string;
  /** Size of the square tile in CSS pixels. */
  size: number;
  /** Drawn when the mark is 'cat'. */
  cat: ReactNode;
  label: string;
}

/** One board tile. Presentational: the Board handles all input. */
export function Cell({ index, mark, color, size, cat, label }: CellProps) {
  return (
    <div
      className="cell"
      data-index={index}
      role="img"
      aria-label={label}
      style={{ background: color, width: size, height: size }}
    >
      {mark === 'cat' && cat}
      {mark === 'marked' && <span className="cell-x">×</span>}
    </div>
  );
}
