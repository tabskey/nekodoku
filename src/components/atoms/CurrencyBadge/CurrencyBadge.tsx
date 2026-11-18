import coinUrl from '../../../assets/coin.svg';
import fishUrl from '../../../assets/fish.svg';
import './CurrencyBadge.css';

// Icon and size per currency; sizes are whole multiples of each sprite grid
// (coin 10x10, fish 12x7).
const ICONS = {
  coin: { url: coinUrl, width: 20, height: 20 },
  fish: { url: fishUrl, width: 24, height: 14 },
};

interface CurrencyBadgeProps {
  amount: number;
  currency?: keyof typeof ICONS;
  /** Shown before the amount, e.g. "+" for a reward. */
  prefix?: string;
  /** Spoken form, e.g. "120 moedas". Leave out when the parent labels it. */
  label?: string;
}

/** A currency icon followed by an amount. */
export function CurrencyBadge({
  amount,
  currency = 'coin',
  prefix = '',
  label,
}: CurrencyBadgeProps) {
  const icon = ICONS[currency];
  return (
    <span
      className="currency-badge"
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <img
        src={icon.url}
        width={icon.width}
        height={icon.height}
        alt=""
        draggable={false}
      />
      <span aria-hidden={label ? true : undefined}>
        {prefix}
        {amount}
      </span>
    </span>
  );
}
