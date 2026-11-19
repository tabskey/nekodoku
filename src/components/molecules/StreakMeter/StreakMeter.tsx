import { PixelRects } from '../../atoms/PixelRects/PixelRects';
import './StreakMeter.css';

/** The bonus steps of the streak: the wins that reach each, and its label. */
export interface MeterStep {
  wins: number;
  label: string;
}

// A check mark, 5x4 sprite pixels drawn at 4x, for a step already reached.
const CHECK = ['....o', '...o.', 'o.o..', '.o...'];

interface StreakMeterProps {
  /** Wins in a row so far. */
  count: number;
  steps: MeterStep[];
  /** Spoken form, e.g. "4 wins in a row, rewards x1.10". */
  label: string;
}

/**
 * The win streak as a path of beads: one position per win, up to the last
 * step. The line fills as the streak grows; the steps where a bonus starts are
 * bigger squares with their wins, a check once reached, and their bonus under
 * them. The next step blinks.
 */
export function StreakMeter({ count, steps, label }: StreakMeterProps) {
  const total = steps[steps.length - 1].wins;
  const reached = Math.min(count, total);
  const next = steps.find((step) => step.wins > count)?.wins;
  return (
    <div
      className="streak-meter"
      role="img"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
    >
      <span className="streak-meter-track" aria-hidden="true">
        <span
          className="streak-meter-fill"
          style={{
            width: `${reached > 1 ? ((reached - 1) / (total - 1)) * 100 : 0}%`,
          }}
        />
      </span>
      {Array.from({ length: total }, (_, i) => {
        const wins = i + 1;
        const step = steps.find((s) => s.wins === wins);
        const filled = wins <= count;
        if (!step) {
          return (
            <span
              key={wins}
              className={`streak-meter-bead${filled ? ' streak-meter-bead-filled' : ''}`}
              aria-hidden="true"
            />
          );
        }
        return (
          <span
            key={wins}
            className={[
              'streak-meter-node',
              filled ? 'streak-meter-node-filled' : '',
              wins === next ? 'streak-meter-node-next' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            {filled ? (
              <svg
                viewBox="0 0 5 4"
                width={20}
                height={16}
                shapeRendering="crispEdges"
              >
                <PixelRects
                  rows={CHECK}
                  colorOf={(char) =>
                    char === 'o' ? 'currentColor' : undefined
                  }
                />
              </svg>
            ) : (
              step.wins
            )}
            <span className="streak-meter-label">{step.label}</span>
          </span>
        );
      })}
    </div>
  );
}
