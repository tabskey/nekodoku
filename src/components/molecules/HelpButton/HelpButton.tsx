import { CoinBadge } from '../../atoms/CoinBadge/CoinBadge';
import './HelpButton.css';

interface HelpButtonProps {
  name: string;
  cost: number;
  disabled: boolean;
  /** Full spoken label, with the name and the price. */
  label: string;
  onUse: () => void;
}

/** A help with its current price in coins. */
export function HelpButton({
  name,
  cost,
  disabled,
  label,
  onUse,
}: HelpButtonProps) {
  return (
    <button
      type="button"
      className="help-button"
      disabled={disabled}
      aria-label={label}
      onClick={onUse}
    >
      <span>{name}</span>
      <CoinBadge amount={cost} />
    </button>
  );
}
