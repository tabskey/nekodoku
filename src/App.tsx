import { useEffect, useState } from 'react';
import { setSoundEnabled, startMusic, stopMusic } from './audio/audio';
import { clearResult, MAX_STREAK_PERCENT, type Reward } from './game/rewards';
import { GamePage } from './pages/GamePage/GamePage';
import { MenuPage } from './pages/MenuPage/MenuPage';
import { WorldPage } from './pages/WorldPage/WorldPage';
import { CollectionPage } from './pages/CollectionPage/CollectionPage';
import { OptionsPage } from './pages/OptionsPage/OptionsPage';
import { ShopPage } from './pages/ShopPage/ShopPage';
import { useProfile } from './state/profileContext';

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md).
export function App() {
  const { profile, dispatch } = useProfile();
  useEffect(
    () => setSoundEnabled(profile.options.sound),
    [profile.options.sound],
  );
  const [screen, setScreen] = useState<
    'menu' | 'world' | 'game' | 'options' | 'shop' | 'collection'
  >('menu');
  // The funky loop plays on every screen outside a level, and keeps going
  // between them; a level starts its own song.
  const outsideLevel = screen !== 'game';
  useEffect(() => {
    if (!outsideLevel || !profile.options.music) return;
    startMusic('menu');
    return stopMusic;
  }, [outsideLevel, profile.options.music]);
  const [level, setLevel] = useState(1);
  const [lastClear, setLastClear] = useState<{
    level: number;
    reward: Reward;
    /** The part of the reward that came from the win streak. */
    bonus: Reward;
    /** The win streak after the clear, and the bonus it paid. */
    streak: { count: number; percent: number };
  }>();
  // The level just won, so the cat walks on from it the next time the map
  // opens. Cleared once the map has shown the walk.
  const [walkFrom, setWalkFrom] = useState<number>();
  // Shop and Options return to the screen they were opened from.
  const [backTo, setBackTo] = useState<'menu' | 'world'>('menu');
  function open(
    next: 'options' | 'shop' | 'collection',
    from: 'menu' | 'world',
  ) {
    // The map has already shown the walk; coming back must not replay it.
    if (from === 'world') setWalkFrom(undefined);
    setBackTo(from);
    setScreen(next);
  }

  function handleCleared(score: number, seconds: number) {
    // Same rule the profile applies, read before the profile changes.
    const { reward, bonus, streak, percent } = clearResult(
      level,
      score,
      profile.levelsCleared,
      profile.bestScores[level],
      profile.winStreak,
    );
    setLastClear({
      level,
      reward,
      bonus,
      streak: { count: streak, percent },
    });
    dispatch({ type: 'levelCleared', level, score, seconds });
  }

  if (screen === 'options') {
    return <OptionsPage onBack={() => setScreen(backTo)} />;
  }
  if (screen === 'collection') {
    return <CollectionPage onBack={() => setScreen(backTo)} />;
  }
  if (screen === 'shop') {
    return <ShopPage onBack={() => setScreen(backTo)} />;
  }
  if (screen === 'menu') {
    return (
      <MenuPage
        onOpenWorld={() => setScreen('world')}
        onOpenOptions={() => open('options', 'menu')}
        onOpenShop={() => open('shop', 'menu')}
        onOpenCollection={() => open('collection', 'menu')}
      />
    );
  }
  if (screen === 'world') {
    return (
      <WorldPage
        onPlay={(next) => {
          setLastClear(undefined);
          setWalkFrom(undefined);
          setLevel(next);
          setScreen('game');
        }}
        onOpenMenu={() => {
          setWalkFrom(undefined);
          setScreen('menu');
        }}
        onOpenShop={() => open('shop', 'world')}
        onOpenOptions={() => open('options', 'world')}
        walkFrom={walkFrom}
      />
    );
  }
  // Leaving a level for the menu discards it (see Saving in
  // docs/GAME_RULES.md).
  return (
    <GamePage
      key={level}
      level={level}
      coins={profile.coins}
      onSpendCoins={(amount) => dispatch({ type: 'spendCoins', amount })}
      onCleared={handleCleared}
      reward={lastClear?.level === level ? lastClear.reward : undefined}
      bonus={lastClear?.level === level ? lastClear.bonus : undefined}
      streak={
        lastClear?.level === level
          ? {
              ...lastClear.streak,
              max: lastClear.streak.percent >= MAX_STREAK_PERCENT,
            }
          : undefined
      }
      onLost={() => dispatch({ type: 'levelLost' })}
      onNextLevel={() => setLevel(level + 1)}
      onOpenMenu={() => {
        setWalkFrom(lastClear?.level === level ? level : undefined);
        setScreen('menu');
      }}
      onOpenMap={() => {
        setWalkFrom(undefined);
        setScreen('world');
      }}
    />
  );
}
