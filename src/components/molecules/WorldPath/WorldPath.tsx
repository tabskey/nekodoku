import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  /** The selected cat standing on a tile. Gets whether it is walking. */
  cat?: (walking: boolean) => ReactNode;
  /** Index of the tile the cat walks to, one tile at a time. */
  catAt?: number;
  /** Index of the tile the cat starts on, when it differs from `catAt`. */
  catFrom?: number;
  /** Called while the cat stands still on `catAt`. */
  onArrive?: () => void;
}

// Time for the cat to walk from one tile to the next.
const STEP_MS = 250;
// The cat's feet overlap the top of the tile by this much.
const FEET_PX = 10;

/** The levels of one world in order, ending at its Boss. Open tiles can be tapped. */
export function WorldPath({
  tiles,
  label,
  onSelect,
  dimmed = false,
  cat,
  catAt = 0,
  catFrom = catAt,
  onArrive,
}: WorldPathProps) {
  const [stand, setStand] = useState({ at: catFrom, left: false });
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const catRef = useRef<HTMLLIElement>(null);
  const placed = useRef<string | undefined>(undefined);

  // Every STEP_MS, the cat moves one tile closer to catAt, or reports that it
  // has arrived.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (stand.at === catAt) onArrive?.();
      else {
        const next = stand.at + Math.sign(catAt - stand.at);
        setStand({ at: next, left: next < stand.at });
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [stand, catAt, onArrive]);

  // Slides the cat onto its tile. offsetLeft and offsetTop are whole pixels,
  // so the sprite stays crisp.
  // shortcut: not re-measured on resize or rotation; it corrects itself on
  // the next step. Add a ResizeObserver if a rotated phone shows it misplaced.
  useLayoutEffect(() => {
    const tile = tileRefs.current[stand.at];
    const sprite = catRef.current;
    if (!tile || !sprite) return;
    const x =
      tile.offsetLeft + Math.round((tile.offsetWidth - sprite.offsetWidth) / 2);
    const y = tile.offsetTop - sprite.offsetHeight + FEET_PX;
    const to = `translate(${x}px, ${y}px)`;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (placed.current && !still) {
      sprite.animate(
        [{ transform: placed.current }, { transform: to }],
        STEP_MS,
      );
    }
    sprite.style.transform = to;
    placed.current = to;
  }, [stand.at]);

  return (
    <ol
      className={`world-path${dimmed ? ' world-path-dimmed' : ''}`}
      aria-label={label}
    >
      {tiles.map((tile, i) => (
        <li key={i} className="world-path-stop">
          <button
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
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
      {cat && (
        <li ref={catRef} className="world-path-cat" aria-hidden="true">
          <div className={stand.left ? 'world-path-cat-left' : undefined}>
            {cat(stand.at !== catAt)}
          </div>
        </li>
      )}
    </ol>
  );
}
