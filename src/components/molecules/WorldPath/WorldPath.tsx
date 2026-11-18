import type { ReactNode } from 'react';
import './WorldPath.css';

export type TileState = 'cleared' | 'current' | 'locked';

export interface PathTile {
  state: TileState;
  isBoss: boolean;
  /** Spoken form, e.g. "Fase 3: atual". */
  label: string;
  /** Shown on the tile: the level number, or a drawing for the Boss. */
  content: ReactNode;
}

interface WorldPathProps {
  tiles: PathTile[];
  label: string;
}

/** The levels of one world in order, ending at its Boss. */
export function WorldPath({ tiles, label }: WorldPathProps) {
  return (
    <ol className="world-path" aria-label={label}>
      {tiles.map((tile, i) => (
        <li
          key={i}
          className={`world-path-tile world-path-${tile.state}${tile.isBoss ? ' world-path-boss' : ''}`}
          aria-label={tile.label}
        >
          <span aria-hidden="true">{tile.content}</span>
        </li>
      ))}
    </ol>
  );
}
