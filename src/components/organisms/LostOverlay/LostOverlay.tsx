import ghostUrl from '../../../assets/ghost-cat.svg';
import { PixelIcon } from '../../atoms/PixelIcon/PixelIcon';
import { Button } from '../../atoms/Button/Button';
import './LostOverlay.css';

// The shadow on the ground: a flat ellipse, 12x3 sprite pixels.
const SHADOW = ['..oooooooo..', '.oooooooooo.', '..oooooooo..'];

interface LostOverlayProps {
  title: string;
  /** A short, friendly line under the title. */
  line: string;
  retryLabel: string;
  onRetry: () => void;
}

/**
 * Shown when a level is lost: a dark veil over the page, the ghost in the
 * middle over its shadow floating up and fading away, and the message and
 * Try again button below it, with a friendly message (see Lost level in docs/DESIGN.md). Only the
 * button takes taps; the header stays reachable under the veil.
 */
export function LostOverlay({
  title,
  line,
  retryLabel,
  onRetry,
}: LostOverlayProps) {
  return (
    <div className="lost-overlay">
      <div className="lost-overlay-panel">
        <div className="lost-overlay-ghost" aria-hidden="true">
          <div className="lost-overlay-fade">
            <div className="lost-overlay-rise">
              <div className="lost-overlay-sway">
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
            <PixelIcon
              className="lost-overlay-shadow"
              rows={SHADOW}
              pixelSize={8}
            />
          </div>
        </div>
        <div className="lost-overlay-actions">
          <div role="status">
            <p className="lost-overlay-title">{title}</p>
            <p className="lost-overlay-line">{line}</p>
          </div>
          <Button onClick={onRetry} autoFocus>
            {retryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
