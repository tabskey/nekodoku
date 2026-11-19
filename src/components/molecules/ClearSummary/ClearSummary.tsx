import { CurrencyBadge } from '../../atoms/CurrencyBadge/CurrencyBadge';
import { StreakMeter, type MeterStep } from '../StreakMeter/StreakMeter';
import './ClearSummary.css';

export interface ClearSummaryProps {
  /** What the clear paid: the amounts without the streak bonus, and the bonus. */
  coins: number;
  coinsBonus: number;
  fish: number;
  fishBonus: number;
  /** Spoken form of the reward, e.g. "You earned 105 coins and 2 fish". */
  rewardLabel: string;
  /** Said instead of the amounts when the clear paid nothing. */
  noReward: string;
  streak: {
    count: number;
    steps: MeterStep[];
    /** Spoken form of the streak. */
    label: string;
    /** On the ribbon, e.g. "Win streak: 4 · x1.10". */
    banner: string;
  };
}

/**
 * What a cleared level earned: the coins and fish with the streak bonus beside
 * each in another color (like "100 +5"), then the win streak as a ribbon over a
 * path of beads. Used by the win screen and the Boss restoration, which set
 * the colors with --bonus-color and --meter-empty.
 */
export function ClearSummary({
  coins,
  coinsBonus,
  fish,
  fishBonus,
  rewardLabel,
  noReward,
  streak,
}: ClearSummaryProps) {
  const paid = coins + coinsBonus > 0 || fish + fishBonus > 0;
  return (
    <div className="clear-summary">
      {paid ? (
        <p className="clear-summary-reward" role="img" aria-label={rewardLabel}>
          <span className="clear-summary-amount">
            <CurrencyBadge amount={coins} />
            {coinsBonus > 0 && (
              <span className="clear-summary-bonus">+{coinsBonus}</span>
            )}
          </span>
          {fish + fishBonus > 0 && (
            <span className="clear-summary-amount">
              <CurrencyBadge amount={fish} currency="fish" />
              {fishBonus > 0 && (
                <span className="clear-summary-bonus">+{fishBonus}</span>
              )}
            </span>
          )}
        </p>
      ) : (
        <p className="clear-summary-none">{noReward}</p>
      )}
      <div className="clear-summary-ribbon">
        <p>{streak.banner}</p>
      </div>
      <StreakMeter
        count={streak.count}
        steps={streak.steps}
        label={streak.label}
      />
    </div>
  );
}
