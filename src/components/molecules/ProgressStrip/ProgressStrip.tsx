import { CatSprite } from '../../atoms/CatSprite/CatSprite';
import type { CatPalette } from '../../atoms/CatSprite/catSprites';

interface ProgressStripProps {
  placed: number;
  total: number;
  palette: CatPalette;
  silhouette: CatPalette;
  label: string;
}

/** One cat silhouette per cat to place, filled in as cats are placed. */
export function ProgressStrip({
  placed,
  total,
  palette,
  silhouette,
  label,
}: ProgressStripProps) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{ display: 'flex', gap: 4, justifyContent: 'center' }}
    >
      {Array.from({ length: total }, (_, i) => (
        <CatSprite
          key={i}
          palette={i < placed ? palette : silhouette}
          pixelSize={2}
          blink={false}
        />
      ))}
    </div>
  );
}
