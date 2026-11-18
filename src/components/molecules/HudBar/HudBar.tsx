import { Heart } from '../../atoms/Heart/Heart';
import './HudBar.css';

interface HudBarProps {
  lives: number;
  maxLives: number;
  score: number;
  livesLabel: string;
  scoreLabel: string;
}

/** The level's status line: lives and score. Time and coins come next. */
export function HudBar({
  lives,
  maxLives,
  score,
  livesLabel,
  scoreLabel,
}: HudBarProps) {
  return (
    <div className="hud-bar">
      <div className="hud-bar-lives" role="img" aria-label={livesLabel}>
        {Array.from({ length: maxLives }, (_, i) => (
          <Heart key={i} full={i < lives} />
        ))}
      </div>
      <span className="hud-bar-score" aria-label={scoreLabel}>
        {score}
      </span>
    </div>
  );
}
