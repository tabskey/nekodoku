import type { ReactNode } from 'react';
import { CatSprite } from '../../atoms/CatSprite/CatSprite';
import type { CatPalette, CatPose } from '../../atoms/CatSprite/catSprites';
import './ShopCatCard.css';

interface ShopCatCardProps {
  name: string;
  palette: CatPalette;
  /** The card's action: a price to buy, or a choice to use. */
  actionContent: ReactNode;
  actionLabel: string;
  disabled: boolean;
  /** Shown highlighted, e.g. the cat in use. */
  selected?: boolean;
  /** 'head' in the shop (default); 'full' in the collection. */
  pose?: CatPose;
  /** Set to false for a static sprite, such as a silhouette. */
  blink?: boolean;
  onAction: () => void;
}

/** One cat in the shop or the collection, with its head and one action. */
export function ShopCatCard({
  name,
  palette,
  actionContent,
  actionLabel,
  disabled,
  selected = false,
  pose = 'head',
  blink = true,
  onAction,
}: ShopCatCardProps) {
  return (
    <li className={`shop-cat-card${selected ? ' shop-cat-card-selected' : ''}`}>
      <CatSprite palette={palette} pose={pose} pixelSize={4} blink={blink} />
      <span className="shop-cat-card-name">{name}</span>
      <button
        type="button"
        className="shop-cat-card-action"
        disabled={disabled}
        aria-label={actionLabel}
        onClick={onAction}
      >
        {actionContent}
      </button>
    </li>
  );
}
