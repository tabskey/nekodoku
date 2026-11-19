import { Button } from '../../components/atoms/Button/Button';
import {
  catPalette,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { ShopCatCard } from '../../components/molecules/ShopCatCard/ShopCatCard';
import { catLook, levelConfig, worldCat } from '../../game/progression';
import { SHOP_CATS, shopCat } from '../../game/shop';
import { catName } from '../../i18n/catName';
import { useText } from '../../i18n/useText';
import { useProfile } from '../../state/profileContext';
import './CollectionPage.css';

// SVG fill cannot read CSS variables, so silhouettes take the text color.
const SILHOUETTE = silhouettePalette('currentColor');

interface CollectionPageProps {
  onBack: () => void;
}

/**
 * Every cat in the game, in full body: the player's cats to choose from, and
 * silhouettes of the ones still to find, with where to find them.
 */
export function CollectionPage({ onBack }: CollectionPageProps) {
  const text = useText();
  const { profile, dispatch } = useProfile();
  // The starting cat, the shop cats, then one cat per world reached so far.
  const currentWorld = levelConfig(profile.levelsCleared + 1).world;
  const worldCats = Array.from({ length: currentWorld }, (_, i) =>
    worldCat(i + 1),
  );
  const all = ['white', ...SHOP_CATS.map((cat) => cat.id), ...worldCats];
  const name = (id: string) => catName(text, id);

  return (
    <main className="collection-page">
      <header>
        <h1>{text.collectionTitle}</h1>
        <p>{text.collectionCount(profile.ownedCats.length, all.length)}</p>
        <p>{text.collectionHint}</p>
      </header>
      <ul className="collection-page-grid">
        {all.map((id) => {
          if (!profile.ownedCats.includes(id)) {
            // A shop cat is bought; any other cat is rescued at a Boss.
            const inShop = shopCat(id) !== undefined;
            return (
              <ShopCatCard
                key={id}
                name={text.unknownCat}
                palette={SILHOUETTE}
                pose="full"
                body={catLook(id).body}
                blink={false}
                actionContent={inShop ? text.inShop : text.toRescue}
                actionLabel={inShop ? text.inShopLabel : text.toRescueLabel}
                disabled
                onAction={() => {}}
              />
            );
          }
          const inUse = id === profile.selectedCat;
          return (
            <ShopCatCard
              key={id}
              name={name(id)}
              palette={catPalette(id)}
              pose="full"
              body={catLook(id).body}
              actionContent={inUse ? text.inUse : text.useCat}
              actionLabel={
                inUse ? text.inUseLabel(name(id)) : text.useCatLabel(name(id))
              }
              disabled={inUse}
              selected={inUse}
              onAction={() => dispatch({ type: 'selectCat', id })}
            />
          );
        })}
      </ul>
      <Button variant="card" onClick={onBack}>
        {text.back}
      </Button>
    </main>
  );
}
