import type { ReactNode } from 'react';
import './WorldPath.css';

export type TileState = 'cleared' | 'current' | 'locked';

export interface PathTile {
  state: TileState;
  isBoss: boolean;
  /** Spoken form, e.g. "Fase 3: concluída, recorde 480". */
  label: string;
  /** Shown on the tile: the level number, or a drawing for the Boss. */
  content: ReactNode;
  /** Shown under the tile, e.g. the best score. */
  note?: string;
}

interface WorldPathProps {
  tiles: PathTile[];
  label: string;
  /** Called with the tile's index when an open tile is tapped. */
  onSelect: (index: number) => void;
  /** Dims the whole path, for a world not yet unlocked. */
  dimmed?: boolean;
}

/** The levels of one world in order, ending at its Boss. Open tiles can be tapped. */
export function WorldPath({
  tiles,
  label,
  onSelect,
  dimmed = false,
}: WorldPathProps) {
  return (
    <ol
      className={`world-path${dimmed ? ' world-path-dimmed' : ''}`}
      aria-label={label}
    >
      {tiles.map((tile, i) => (
        <li key={i} className="world-path-stop">
          <button
            type="button"
            className={`world-path-tile world-path-${tile.state}${tile.isBoss ? ' world-path-boss' : ''}`}
            aria-label={tile.label}
            disabled={tile.state === 'locked'}
            onClick={() => onSelect(i)}
          >
            <span aria-hidden="true">{tile.content}</span>
          </button>
          {tile.note && (
            <span className="world-path-note" aria-hidden="true">
              {tile.note}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
