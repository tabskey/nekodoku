import { useEffect, useState } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import { catPalette } from '../../components/atoms/CatSprite/catSprites';
import { CurrencyBadge } from '../../components/atoms/CurrencyBadge/CurrencyBadge';
import { StreakBadge } from '../../components/atoms/StreakBadge/StreakBadge';
import { SpeechBubble } from '../../components/atoms/SpeechBubble/SpeechBubble';
import {
  catLook,
  levelConfig,
  worldLength,
  worldStart,
} from '../../game/progression';
import { streakPercent } from '../../game/rewards';
import { formatTime } from '../../i18n/formatTime';
import { useText } from '../../i18n/useText';
import { useUpdateReady } from '../../pwa/update';
import { useProfile } from '../../state/profileContext';
import './MenuPage.css';

// How long the cat keeps one thing to say.
const HELLO_MS = 7000;

// Past this many tiles the Boss strip drops the level numbers, which no
// longer fit.
const NUMBERED_TILES = 7;

interface MenuPageProps {
  onOpenWorld: () => void;
  onOpenOptions: () => void;
  onOpenShop: () => void;
  onOpenCollection: () => void;
}

/** The home screen: the selected cat, Play, and the way to the next Boss. */
export function MenuPage({
  onOpenWorld,
  onOpenOptions,
  onOpenShop,
  onOpenCollection,
}: MenuPageProps) {
  const text = useText();
  const { profile } = useProfile();
  const nextLevel = profile.levelsCleared + 1;
  const { world, levelInWorld, size, isBoss } = levelConfig(nextLevel);
  const first = worldStart(world);
  const length = worldLength(world);
  const bossSize = levelConfig(first + length - 1).size;
  const bestTime = profile.bestTimes[size];
  const updateReady = useUpdateReady();
  // The cat's words: one at random on opening, and another every few seconds.
  const [hello, setHello] = useState(() =>
    Math.floor(Math.random() * text.catHellos.length),
  );
  useEffect(() => {
    const total = text.catHellos.length;
    const timer = window.setInterval(
      // Always a different one: skip 1 to total - 1 places ahead.
      () =>
        setHello(
          (h) => (h + 1 + Math.floor(Math.random() * (total - 1))) % total,
        ),
      HELLO_MS,
    );
    return () => window.clearInterval(timer);
  }, [text.catHellos.length]);

  return (
    <main className="menu-page">
      <div className="menu-page-balance">
        {profile.winStreak > 0 && (
          <StreakBadge
            count={profile.winStreak}
            bonus={
              streakPercent(profile.winStreak) > 100
                ? text.multiplier(streakPercent(profile.winStreak))
                : undefined
            }
            label={text.streakLabel(
              profile.winStreak,
              streakPercent(profile.winStreak),
            )}
          />
        )}
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
      <header className="menu-page-title">
        <h1>{text.appName}</h1>
        <p>{text.tagline}</p>
      </header>
      <div className="menu-page-cat-wrap">
        <div className="menu-page-cat">
          <CatSprite
            palette={catPalette(profile.selectedCat)}
            pose="full"
            body={catLook(profile.selectedCat).body}
            pixelSize={7}
            label={text.selectedCat}
          />
        </div>
        {/* The cat says hello, in the top right corner of its card. */}
        <SpeechBubble className="menu-page-bubble">
          {text.catHellos[hello % text.catHellos.length]}
        </SpeechBubble>
      </div>
      <button type="button" className="menu-page-play" onClick={onOpenWorld}>
        <span className="menu-page-play-label">{text.play}</span>
        <span>
          {isBoss
            ? text.worldBoss(world)
            : text.worldLevel(world, levelInWorld)}
        </span>
      </button>
      <section className="menu-page-boss">
        <div className="menu-page-boss-title">
          <h2>{text.towardBoss}</h2>
          <span>{text.worldLabel(world)}</span>
        </div>
        <ol className="menu-page-strip">
          {Array.from({ length }, (_, i) => {
            const level = first + i;
            const state =
              level < nextLevel
                ? 'cleared'
                : level === nextLevel
                  ? 'current'
                  : 'locked';
            const boss = i === length - 1;
            return (
              <li
                key={i}
                className={`menu-page-strip-${boss ? 'boss' : state}`}
                aria-label={
                  boss
                    ? text.bossTileLabel(state)
                    : text.tileLabel(i + 1, state)
                }
              >
                <span aria-hidden="true">
                  {boss ? text.bossTile : length <= NUMBERED_TILES && i + 1}
                </span>
              </li>
            );
          })}
        </ol>
        <p>{text.bossInfo(bossSize)}</p>
      </section>
      <nav className="menu-page-links">
        <Button variant="card" onClick={onOpenShop}>
          {text.shopButton}
        </Button>
        <Button variant="card" onClick={onOpenCollection}>
          {text.catsButton}
        </Button>
        <Button
          variant="card"
          onClick={onOpenOptions}
          aria-label={
            updateReady
              ? `${text.optionsButton}: ${text.updateTitle}`
              : undefined
          }
        >
          {text.optionsButton}
          {updateReady && (
            <span className="menu-page-update-dot" aria-hidden="true" />
          )}
        </Button>
      </nav>
      {bestTime !== undefined && (
        <p className="menu-page-record">
          {text.bestTime(size, formatTime(bestTime))}
        </p>
      )}
    </main>
  );
}
