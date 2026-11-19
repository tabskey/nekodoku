import { play } from '../../audio/audio';
import { Button } from '../../components/atoms/Button/Button';
import { catPalette } from '../../components/atoms/CatSprite/catSprites';
import { CurrencyBadge } from '../../components/atoms/CurrencyBadge/CurrencyBadge';
import { ShopCatCard } from '../../components/molecules/ShopCatCard/ShopCatCard';
import { ERASER_COST, REVEAL_COST } from '../../game/helps';
import { dailyRotation } from '../../game/shop';
import { catName } from '../../i18n/catName';
import { useText } from '../../i18n/useText';
import { useProfile } from '../../state/profileContext';
import './ShopPage.css';

interface ShopPageProps {
  onBack: () => void;
}

// The device's local date, e.g. "2026-11-18": the rotation changes at local
// midnight.
// shortcut: read once per render, so a shop left open past midnight shows
// yesterday's cats until the screen is opened again.
function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Today's shop cats and the help prices. Cats are chosen in the collection. */
export function ShopPage({ onBack }: ShopPageProps) {
  const text = useText();
  const { profile, dispatch } = useProfile();
  const rotation = dailyRotation(today());
  const name = (id: string) => catName(text, id);

  return (
    <main className="shop-page">
      <header className="shop-page-header">
        <h1>{text.shopTitle}</h1>
        <div className="shop-page-balance">
          <CurrencyBadge
            amount={profile.fish}
            currency="fish"
            label={text.fish(profile.fish)}
          />
          <CurrencyBadge
            amount={profile.coins}
            label={text.coins(profile.coins)}
          />
        </div>
      </header>

      <section>
        <h2>{text.todaysCats}</h2>
        <p className="shop-page-hint">{text.todaysCatsHint}</p>
        {rotation.length === 0 ? (
          <p className="shop-page-hint">{text.noShopCats}</p>
        ) : (
          <ul className="shop-page-grid">
            {rotation.map((cat) => {
              // A cat already bought stays in the rotation, sold out.
              const owned = profile.ownedCats.includes(cat.id);
              return (
                <ShopCatCard
                  key={cat.id}
                  name={name(cat.id)}
                  palette={catPalette(cat.id)}
                  actionContent={
                    owned ? (
                      <span className="shop-page-sold-out">{text.soldOut}</span>
                    ) : (
                      <CurrencyBadge amount={cat.price} currency="fish" />
                    )
                  }
                  actionLabel={
                    owned
                      ? text.soldOutLabel(name(cat.id))
                      : text.buyCat(name(cat.id), cat.price)
                  }
                  disabled={owned || profile.fish < cat.price}
                  onAction={() => {
                    play('coin');
                    dispatch({ type: 'buyCat', id: cat.id });
                  }}
                />
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>{text.helpsTitle}</h2>
        <p className="shop-page-hint">{text.helpsHint}</p>
        <dl className="shop-page-helps">
          <dt>
            {text.reveal} <CurrencyBadge amount={REVEAL_COST} />
          </dt>
          <dd>{text.revealInfo}</dd>
          <dt>
            {text.eraser} <CurrencyBadge amount={ERASER_COST} />
          </dt>
          <dd>{text.eraserInfo}</dd>
        </dl>
      </section>

      <Button variant="card" onClick={onBack}>
        {text.back}
      </Button>
    </main>
  );
}
