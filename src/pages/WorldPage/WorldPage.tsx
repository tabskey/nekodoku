import { useRef, useState, type PointerEvent } from 'react';
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
import {
  levelConfig,
  worldCat,
  worldLength,
  worldStart,
} from '../../game/progression';
import { useText } from '../../i18n/useText';
import { useProfile } from '../../state/profileContext';
import './MenuPage.css';

// SVG fill cannot read CSS variables, so the Boss ghost takes the text color.
const GHOST = silhouettePalette('currentColor');
// A horizontal drag longer than this changes world (see Board input in
// docs/ARCHITECTURE.md).
const SWIPE_PX = 50;

interface MenuPageProps {
  onPlay: (level: number) => void;
  onOpenOptions: () => void;
  onOpenShop: () => void;
  /** The level just cleared: the cat walks from its tile to the next one. */
  walkFrom?: number;
}

/** The home screen: the selected cat, the world map with replay, and Play. */
export function MenuPage({
  onPlay,
  onOpenOptions,
  onOpenShop,
  walkFrom,
}: MenuPageProps) {
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
    // A beaten Boss shows its restored cat in color; otherwise the ghost waits.
    const bossSprite = (
      <CatSprite
        palette={state === 'cleared' ? catPalette(worldCat(world)) : GHOST}
        pixelSize={3}
        blink={state === 'cleared'}
      />
    );
    return {
      state,
      isBoss,
      label:
        best === undefined
          ? tileLabel
          : `${tileLabel}, ${text.bestScoreNote(best)}`,
      content: isBoss ? bossSprite : i + 1,
      note: best === undefined ? undefined : String(best),
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
      <section
        className="menu-page-world"
        onPointerDown={(event) => (swipeStart.current = event.clientX)}
        onPointerUp={handleUp}
        onPointerCancel={() => (swipeStart.current = undefined)}
      >
        <div className="menu-page-world-title">
          <button
            type="button"
            className="menu-page-arrow"
            aria-label={text.previousWorld}
            disabled={world === 1}
            onClick={() => changeWorld(-1)}
          >
            &lt;
          </button>
          <h2>{text.worldLabel(world)}</h2>
          <button
            type="button"
            className="menu-page-arrow"
            aria-label={text.nextWorld}
            disabled={world === lastViewable}
            onClick={() => changeWorld(1)}
          >
            &gt;
          </button>
        </div>
        <div
          className="menu-page-dots"
          role="img"
          aria-label={text.worldDots(world, lastViewable)}
        >
          {Array.from({ length: lastViewable }, (_, i) => (
            <span
              key={i}
              className={i + 1 === world ? 'menu-page-dot-current' : undefined}
            />
          ))}
        </div>
        <WorldPath
          key={world}
          tiles={tiles}
          label={text.worldPath(world)}
          dimmed={locked}
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
        {locked && (
          <p className="menu-page-locked">{text.lockedWorld(world - 1)}</p>
        )}
      </section>
      <div className="menu-page-actions">
        <Button onClick={() => onPlay(playLevel)}>
          {levelConfig(playLevel).isBoss
            ? text.playBoss
            : text.playLevel(
                playLevel - worldStart(levelConfig(playLevel).world) + 1,
              )}
        </Button>
        <Button variant="card" onClick={onOpenShop}>
          {text.shopButton}
        </Button>
        <Button variant="card" onClick={onOpenOptions}>
          {text.optionsButton}
        </Button>
      </div>
    </main>
  );
}
