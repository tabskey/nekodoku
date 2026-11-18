import { useRef, useState, type PointerEvent } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import { CurrencyBadge } from '../../components/atoms/CurrencyBadge/CurrencyBadge';
import {
  catPalette,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { MAP_PALETTES } from '../../components/molecules/WorldPath/mapPalettes';
import {
  WorldPath,
  type TileState,
} from '../../components/molecules/WorldPath/WorldPath';
import {
  levelConfig,
  worldCat,
  worldLength,
  worldStart,
} from '../../game/progression';
import { worldScene } from '../../game/biomes';
import { useText } from '../../i18n/useText';
import { useProfile } from '../../state/profileContext';
import './WorldPage.css';

// SVG fill cannot read CSS variables, so the Boss ghost takes the text color.
const GHOST = silhouettePalette('currentColor');
// A horizontal drag longer than this changes world (see Board input in
// docs/ARCHITECTURE.md).
const SWIPE_PX = 50;

interface WorldPageProps {
  onPlay: (level: number) => void;
  onOpenMenu: () => void;
  onOpenShop: () => void;
  onOpenOptions: () => void;
  /** The level just cleared: the cat walks from its tile to the next one. */
  walkFrom?: number;
}

/** The world map: the cat walks the path to a level, with replay of cleared worlds. */
export function WorldPage({
  onPlay,
  onOpenMenu,
  onOpenShop,
  onOpenOptions,
  walkFrom,
}: WorldPageProps) {
  const text = useText();
  const { profile } = useProfile();
  const nextLevel = profile.levelsCleared + 1;
  const currentWorld = levelConfig(nextLevel).world;
  // Worlds up to the current one are open; the next one shows as locked.
  const lastViewable = currentWorld + 1;
  const [world, setWorld] = useState(currentWorld);
  const locked = world > currentWorld;
  const first = worldStart(world);
  const length = worldLength(world);
  const scene = worldScene(world);
  // The tile tapped: the cat walks there. A second tap on it opens the level
  // once the cat stands on it.
  const [destination, setDestination] = useState<number>();
  const [opening, setOpening] = useState(false);
  // The walk after a win plays once, on the world it happened in.
  const [walkStart, setWalkStart] = useState(walkFrom);
  // The cat waits on the current level, or at the Boss of a cleared world.
  const home = world === currentWorld ? nextLevel - first : length - 1;
  const catTile = destination ?? home;
  const playLevel = locked ? nextLevel : first + catTile;
  const catFrom =
    walkStart !== undefined && walkStart >= first && walkStart < first + length
      ? walkStart - first
      : undefined;

  const swipeStart = useRef<number | undefined>(undefined);
  function changeWorld(step: number) {
    setWorld((w) => Math.min(lastViewable, Math.max(1, w + step)));
    setDestination(undefined);
    setOpening(false);
    setWalkStart(undefined);
  }
  function handleUp(event: PointerEvent<HTMLElement>) {
    if (swipeStart.current === undefined) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = undefined;
    // Swipe left for the next world, right for the previous one.
    if (Math.abs(dx) > SWIPE_PX) changeWorld(dx < 0 ? 1 : -1);
  }

  const tiles = Array.from({ length }, (_, i) => {
    const level = first + i;
    const { isBoss } = levelConfig(level);
    const state: TileState =
      level < nextLevel
        ? 'cleared'
        : level === nextLevel
          ? 'current'
          : 'locked';
    const best = profile.bestScores[level];
    const tileLabel = isBoss
      ? text.bossTileLabel(state)
      : text.tileLabel(i + 1, state);
    // Beside the Boss: its restored cat once beaten, else the floating ghost.
    const bossSprite =
      state === 'cleared' ? (
        <CatSprite palette={catPalette(worldCat(world))} pixelSize={3} />
      ) : (
        <span className="world-page-ghost">
          <CatSprite palette={GHOST} pixelSize={3} blink={false} />
        </span>
      );
    return {
      state,
      isBoss,
      label:
        best === undefined
          ? tileLabel
          : `${tileLabel}, ${text.bestScoreNote(best)}`,
      content: isBoss ? text.bossTile : i + 1,
      beside: isBoss ? bossSprite : undefined,
      note: best === undefined ? undefined : String(best),
    };
  });

  return (
    <main className="world-page">
      <header className="world-page-header">
        <Button variant="card" onClick={onOpenMenu}>
          {text.menuButton}
        </Button>
        <div className="world-page-balance">
          <CurrencyBadge
            amount={profile.coins}
            label={text.coins(profile.coins)}
          />
          <CurrencyBadge
            amount={profile.fish}
            currency="fish"
            label={text.fish(profile.fish)}
          />
        </div>
      </header>
      <section
        className="world-page-world"
        onPointerDown={(event) => (swipeStart.current = event.clientX)}
        onPointerUp={handleUp}
        onPointerCancel={() => (swipeStart.current = undefined)}
      >
        <div className="world-page-world-title">
          <button
            type="button"
            className="world-page-arrow"
            aria-label={text.previousWorld}
            disabled={world === 1}
            onClick={() => changeWorld(-1)}
          >
            &lt;
          </button>
          <h1>{text.worldLabel(world)}</h1>
          <button
            type="button"
            className="world-page-arrow"
            aria-label={text.nextWorld}
            disabled={world === lastViewable}
            onClick={() => changeWorld(1)}
          >
            &gt;
          </button>
        </div>
        <div
          className="world-page-dots"
          role="img"
          aria-label={text.worldDots(world, lastViewable)}
        >
          {Array.from({ length: lastViewable }, (_, i) => (
            <span
              key={i}
              className={i + 1 === world ? 'world-page-dot-current' : undefined}
            />
          ))}
        </div>
        <p className="world-page-hint">
          {locked ? text.lockedWorld(world - 1) : text.mapHint}
        </p>
        <WorldPath
          key={world}
          tiles={tiles}
          label={text.worldPath(world)}
          dimmed={locked}
          palette={MAP_PALETTES[scene.biome][scene.time]}
          seed={world}
          onSelect={(i) => {
            if (i === catTile) setOpening(true);
            else {
              setDestination(i);
              setOpening(false);
            }
          }}
          cat={
            locked
              ? undefined
              : (walking) => (
                  <CatSprite
                    palette={catPalette(profile.selectedCat)}
                    pose="walk"
                    pixelSize={3}
                    walking={walking}
                  />
                )
          }
          catAt={catTile}
          catFrom={catFrom}
          onArrive={() => {
            if (opening) onPlay(playLevel);
          }}
        />
      </section>
      <Button onClick={() => onPlay(playLevel)}>
        {levelConfig(playLevel).isBoss
          ? text.playBoss
          : text.playLevel(
              playLevel - worldStart(levelConfig(playLevel).world) + 1,
            )}
      </Button>
      <nav className="world-page-links">
        <Button variant="card" onClick={onOpenShop}>
          {text.shopButton}
        </Button>
        <Button variant="card" onClick={onOpenOptions}>
          {text.optionsButton}
        </Button>
      </nav>
    </main>
  );
}
