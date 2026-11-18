import coinUrl from '../../../assets/coin.svg';
import './CoinBadge.css';

interface CoinBadgeProps {
  amount: number;
  /** Spoken form, e.g. "120 moedas". Leave out when the parent labels it. */
  label?: string;
}

/** A coin icon followed by an amount. */
export function CoinBadge({ amount, label }: CoinBadgeProps) {
  return (
    <span
      className="coin-badge"
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <img src={coinUrl} width={20} height={20} alt="" draggable={false} />
      <span aria-hidden={label ? true : undefined}>{amount}</span>
    </span>
  );
}
