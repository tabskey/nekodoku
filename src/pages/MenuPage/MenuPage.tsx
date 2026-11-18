import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import {
  catPalette,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import {
  WorldPath,
  type TileState,
} from '../../components/molecules/WorldPath/WorldPath';
import { levelConfig, worldLength, worldStart } from '../../game/progression';
import { useText } from '../../i18n/useText';
import { useProfile } from '../../state/profileContext';
import './MenuPage.css';

// SVG fill cannot read CSS variables, so the Boss ghost takes the text color.
const GHOST = silhouettePalette('currentColor');

interface MenuPageProps {
  onPlay: (level: number) => void;
  onOpenOptions: () => void;
}

/** The home screen: the selected cat, the path to the next Boss, and Play. */
export function MenuPage({ onPlay, onOpenOptions }: MenuPageProps) {
  const text = useText();
  const { profile } = useProfile();
  const nextLevel = profile.levelsCleared + 1;
  const { world } = levelConfig(nextLevel);
  const first = worldStart(world);

  const tiles = Array.from({ length: worldLength(world) }, (_, i) => {
    const level = first + i;
    const { isBoss } = levelConfig(level);
    const state: TileState =
      level < nextLevel
        ? 'cleared'
        : level === nextLevel
          ? 'current'
          : 'locked';
    return {
      state,
      isBoss,
      label: isBoss ? text.bossTileLabel(state) : text.tileLabel(i + 1, state),
      content: isBoss ? (
        <CatSprite palette={GHOST} pixelSize={3} blink={false} />
      ) : (
        i + 1
      ),
    };
  });

  return (
    <main className="menu-page">
      <h1>{text.appName}</h1>
      <CatSprite
        palette={catPalette(profile.selectedCat)}
        pose="full"
        pixelSize={6}
        label={text.selectedCat}
      />
      <section className="menu-page-world">
        <h2>{text.worldLabel(world)}</h2>
        <WorldPath tiles={tiles} label={text.worldPath(world)} />
      </section>
      <div className="menu-page-actions">
        <Button onClick={() => onPlay(nextLevel)}>{text.play}</Button>
        <Button variant="card" onClick={onOpenOptions}>
          {text.optionsButton}
        </Button>
      </div>
    </main>
  );
}
