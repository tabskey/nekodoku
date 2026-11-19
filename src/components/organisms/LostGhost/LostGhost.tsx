import ghostUrl from '../../../assets/ghost-cat.svg';
import { PixelRects } from '../../atoms/PixelRects/PixelRects';
import './LostGhost.css';

// The shadow on the ground: a flat ellipse, 12x3 sprite pixels.
const SHADOW = ['..oooooooo..', '.oooooooooo.', '..oooooooo..'];

/**
 * Shown when a level is lost: the ghost appears in the middle of the screen
 * over its shadow, floats up and fades away, in hard steps (see Lost level
 * in docs/DESIGN.md). Decorative, and it never blocks a tap.
 */
export function LostGhost() {
  return (
    <div className="lost-ghost" aria-hidden="true">
      <div className="lost-ghost-fade">
        <div className="lost-ghost-rise">
          <div className="lost-ghost-sway">
            {/* The 12x14 ghost sprite at 8x. */}
            <img
              src={ghostUrl}
              width={96}
              height={112}
              alt=""
              draggable={false}
            />
          </div>
        </div>
        <svg
          className="lost-ghost-shadow"
          viewBox="0 0 12 3"
          width={96}
          height={24}
          shapeRendering="crispEdges"
        >
          <PixelRects
            rows={SHADOW}
            colorOf={(char) => (char === 'o' ? 'currentColor' : undefined)}
          />
        </svg>
      </div>
    </div>
  );
}
