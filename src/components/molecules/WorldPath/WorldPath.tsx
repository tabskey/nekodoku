import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { decorations } from './decorations';
import type { MapPalette } from './mapPalettes';
import type { WorldRoute } from '../../../game/biomes';
import { pathLayout } from './pathLayout';
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
  /** Drawn beside the tile, above the path line, e.g. the Boss's ghost. */
  beside?: ReactNode;
}

interface WorldPathProps {
  tiles: PathTile[];
  label: string;
  /** Called with the tile's index when an open tile is tapped. */
  onSelect: (index: number) => void;
  /** Dims the whole path, for a world not yet unlocked. */
  dimmed?: boolean;
  /** Colors of the world's biome and time of day. */
  palette: MapPalette;
  /** Places the decorations, so a world always looks the same: the world number. */
  seed: number;
  /** The shape of the path between the tiles. */
  route: WorldRoute;
  /** The selected cat, 16x18 sprite pixels at 3x. Gets whether it is walking. */
  cat?: (walking: boolean) => ReactNode;
  /** Index of the tile the cat walks to, dot by dot along the path. */
  catAt?: number;
  /** Index of the tile the cat starts on, when it differs from `catAt`. */
  catFrom?: number;
  /** Called while the cat stands on `catAt`. */
  onArrive?: () => void;
}

// Time for the cat to move from one dot to the next.
const DOT_MS = 70;
// The 48x54 cat stands centered on the dot, its feet just below it.
const CAT_HALF_WIDTH = 24;
const CAT_FEET = 48;

/** The map of one world: its levels along a winding path, ending at its Boss. */
export function WorldPath({
  tiles,
  label,
  onSelect,
  dimmed = false,
  palette,
  seed,
  route,
  cat,
  catAt = 0,
  catFrom = catAt,
  onArrive,
}: WorldPathProps) {
  const { width, height, points, tilePoints, decor } = useMemo(() => {
    const layout = pathLayout(tiles.length, route);
    return { ...layout, decor: decorations(layout, seed) };
  }, [tiles.length, seed, route]);
  const target = tilePoints[catAt];
  const [stand, setStand] = useState({ at: tilePoints[catFrom], left: false });

  useEffect(() => {
    if (stand.at === target) {
      onArrive?.();
      return;
    }
    const timer = window.setTimeout(() => {
      const next = stand.at + Math.sign(target - stand.at);
      const dx = points[next].x - points[stand.at].x;
      // Going up or down keeps the way the cat was facing.
      setStand({ at: next, left: dx === 0 ? stand.left : dx < 0 });
    }, DOT_MS);
    return () => window.clearTimeout(timer);
  }, [stand, target, points, onArrive]);

  const catPoint = points[stand.at];

  return (
    <div
      className={`world-path${dimmed ? ' world-path-dimmed' : ''}`}
      style={
        {
          '--map-ground': palette.ground,
          '--map-path': palette.path,
        } as CSSProperties
      }
    >
      {palette.sea && (
        <span
          className="world-path-sea"
          style={{
            background: palette.sea[0],
            borderLeftColor: palette.sea[1],
          }}
        />
      )}
      <div className="world-path-field" style={{ width, height }}>
        {decor.map(({ kind, x, y }, i) => {
          if (kind === 'bush') {
            return (
              palette.bush && (
                <span
                  key={i}
                  className="world-path-bush"
                  style={{ left: x, top: y }}
                >
                  <span style={{ background: palette.bush[1] }} />
                  <span style={{ background: palette.bush[0] }} />
                </span>
              )
            );
          }
          if (kind === 'firefly') {
            return (
              palette.firefly && (
                <span
                  key={i}
                  className="world-path-speck world-path-firefly"
                  style={{
                    left: x,
                    top: y,
                    background: palette.firefly,
                    // Spread the blinks so the fireflies never pulse together.
                    animationDelay: `${(i % 5) * -0.45}s`,
                  }}
                />
              )
            );
          }
          return (
            <span
              key={i}
              className="world-path-speck"
              style={{
                left: x,
                top: y,
                background: palette.specks[kind === 'speck0' ? 0 : 1],
              }}
            />
          );
        })}
        {points.map((point, i) => (
          <span
            key={i}
            className="world-path-dot"
            style={{ left: point.x - 3, top: point.y - 3 }}
          />
        ))}
        <ol aria-label={label}>
          {tiles.map((tile, i) => (
            <li
              key={i}
              className="world-path-stop"
              style={{
                left: points[tilePoints[i]].x,
                top: points[tilePoints[i]].y,
              }}
            >
              <button
                type="button"
                className={`world-path-tile world-path-${tile.state}${tile.isBoss ? ' world-path-boss' : ''}`}
                aria-label={tile.label}
                disabled={tile.state === 'locked'}
                onClick={() => onSelect(i)}
              >
                <span aria-hidden="true">{tile.content}</span>
              </button>
              {tile.beside && (
                <span
                  className={`world-path-beside world-path-beside-${points[tilePoints[i] - 1]?.x < points[tilePoints[i]].x ? 'right' : 'left'}`}
                  aria-hidden="true"
                >
                  {tile.beside}
                </span>
              )}
              {tile.note && (
                <span className="world-path-note" aria-hidden="true">
                  {tile.note}
                </span>
              )}
            </li>
          ))}
        </ol>
        {cat && (
          <div
            className={`world-path-cat${stand.left ? ' world-path-cat-left' : ''}`}
            style={{
              left: catPoint.x - CAT_HALF_WIDTH,
              top: catPoint.y - CAT_FEET,
            }}
            aria-hidden="true"
          >
            {cat(stand.at !== target)}
          </div>
        )}
      </div>
    </div>
  );
}
