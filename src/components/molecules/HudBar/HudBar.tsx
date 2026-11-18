import { CurrencyBadge } from '../../atoms/CurrencyBadge/CurrencyBadge';
import { Heart } from '../../atoms/Heart/Heart';
import './HudBar.css';

interface HudBarProps {
  lives: number;
  maxLives: number;
  score: number;
  elapsedSeconds: number;
  livesLabel: string;
  scoreLabel: string;
  /** Spoken form of the time, e.g. "1 min 5 s". */
  timeLabel: (minutes: number, seconds: number) => string;
  coins: number;
  coinsLabel: string;
}

/** The level's status line: lives, time, score and coins. */
export function HudBar({
  lives,
  maxLives,
  score,
  elapsedSeconds,
  livesLabel,
  scoreLabel,
  timeLabel,
  coins,
  coinsLabel,
}: HudBarProps) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return (
    <div className="hud-bar">
      <div className="hud-bar-lives" role="img" aria-label={livesLabel}>
        {Array.from({ length: maxLives }, (_, i) => (
          <Heart key={i} full={i < lives} />
        ))}
      </div>
      <span
        className="hud-bar-time"
        role="timer"
        aria-label={timeLabel(minutes, seconds)}
      >
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="hud-bar-score" aria-label={scoreLabel}>
        {score}
      </span>
      <CurrencyBadge amount={coins} label={coinsLabel} />
    </div>
  );
}
