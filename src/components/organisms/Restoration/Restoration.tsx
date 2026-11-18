import { useState } from 'react';
import ghostUrl from '../../../assets/ghost-cat.svg';
import { Button } from '../../atoms/Button/Button';
import { CatSprite } from '../../atoms/CatSprite/CatSprite';
import type { CatPalette } from '../../atoms/CatSprite/catSprites';
import './Restoration.css';

interface RestorationProps {
  /** The restored cat's colors. */
  palette: CatPalette;
  name: string;
  title: string;
  message: string;
  /** Spoken name of the revealed cat. */
  catLabel: string;
  backLabel: string;
  replayLabel: string;
  onBack: () => void;
  /** Called when the sequence plays again, e.g. to replay its sounds. */
  onReplay?: () => void;
}

/**
 * The ghost turning back into a cat after a Boss is beaten: about 3.6 s in
 * hard steps (see Restoration sequence in docs/DESIGN.md).
 */
export function Restoration({
  palette,
  name,
  title,
  message,
  catLabel,
  backLabel,
  replayLabel,
  onBack,
  onReplay,
}: RestorationProps) {
  // Changing the key remounts the animated parts, which plays them again.
  const [run, setRun] = useState(0);

  return (
    <section
      key={run}
      className="restoration"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="restoration-stage restoration-move">
        {/* 12x14 ghost at 8x, centered on the 16x18 cat. */}
        <img
          className="restoration-ghost"
          src={ghostUrl}
          width={96}
          height={112}
          alt=""
          draggable={false}
        />
        <span className="restoration-silhouette" aria-hidden="true">
          <CatSprite
            palette={palette}
            pose="full"
            pixelSize={8}
            blink={false}
          />
        </span>
        <span className="restoration-show">
          <CatSprite
            palette={palette}
            pose="full"
            pixelSize={8}
            label={catLabel}
          />
        </span>
      </div>
      <div className="restoration-show restoration-text">
        <h2>{title}</h2>
        <p className="restoration-name">{name}</p>
        <p>{message}</p>
      </div>
      <div className="restoration-show restoration-actions">
        <Button onClick={onBack}>{backLabel}</Button>
        <button
          type="button"
          className="restoration-replay"
          onClick={() => {
            setRun((r) => r + 1);
            onReplay?.();
          }}
        >
          {replayLabel}
        </button>
      </div>
    </section>
  );
}
