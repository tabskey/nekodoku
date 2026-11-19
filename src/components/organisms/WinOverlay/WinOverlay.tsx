import { Button } from '../../atoms/Button/Button';
import { Confetti } from '../../atoms/Confetti/Confetti';
import {
  ClearSummary,
  type ClearSummaryProps,
} from '../../molecules/ClearSummary/ClearSummary';
import './WinOverlay.css';

interface WinOverlayProps {
  title: string;
  /** A short, friendly line under the title. */
  line: string;
  score: string;
  /** What the win paid and the win streak. */
  summary: ClearSummaryProps;
  nextLabel: string;
  onNext: () => void;
}

/**
 * Shown when a level is won: a dark veil, confetti, the message, what the win
 * paid with the streak path and the Next level button (see Win screen in
 * docs/DESIGN.md). Only the button takes taps; the header stays reachable
 * under the veil.
 */
export function WinOverlay({
  title,
  line,
  score,
  summary,
  nextLabel,
  onNext,
}: WinOverlayProps) {
  return (
    <div className="win-overlay">
      <Confetti startSeconds={0.2} />
      <div className="win-overlay-panel">
        <div role="status">
          <p className="win-overlay-title">{title}</p>
          <p className="win-overlay-line">{line}</p>
        </div>
        <p className="win-overlay-score">{score}</p>
        <ClearSummary {...summary} />
        <Button onClick={onNext} autoFocus>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
