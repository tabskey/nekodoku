import { CurrencyBadge } from '../../atoms/CurrencyBadge/CurrencyBadge';
import { Heart } from '../../atoms/Heart/Heart';
import './HudBar.css';

interface HudBarProps {
  lives: number;
  maxLives: number;
  score: number;
  /** The clock as shown, e.g. "01:05". */
  time: string;
  livesLabel: string;
  scoreLabel: string;
  /** Spoken form of the time, e.g. "1 min 5 s". */
  timeLabel: string;
  coins: number;
  coinsLabel: string;
}

/** The level's status line: lives, time, score and coins. */
export function HudBar({
  lives,
  maxLives,
  score,
  time,
  livesLabel,
  scoreLabel,
  timeLabel,
  coins,
  coinsLabel,
}: HudBarProps) {
  return (
    <div className="hud-bar">
      <div className="hud-bar-lives" role="img" aria-label={livesLabel}>
        {Array.from({ length: maxLives }, (_, i) => (
          <Heart key={i} full={i < lives} />
        ))}
      </div>
      <span className="hud-bar-time" role="timer" aria-label={timeLabel}>
        {time}
      </span>
      <span className="hud-bar-score" aria-label={scoreLabel}>
        {score}
      </span>
      <CurrencyBadge amount={coins} label={coinsLabel} />
    </div>
  );
}
