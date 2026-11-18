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
      // 12 cats at 24px need a tighter gap to fit a phone; on the narrowest
      // screens the strip wraps instead of overflowing.
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: total > 9 ? 2 : 4,
        justifyContent: 'center',
      }}
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
