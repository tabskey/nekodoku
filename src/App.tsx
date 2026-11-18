import { useState } from 'react';
import { clearReward, type Reward } from './game/rewards';
import { GamePage } from './pages/GamePage/GamePage';
import { MenuPage } from './pages/MenuPage/MenuPage';
import { WorldPage } from './pages/WorldPage/WorldPage';
import { OptionsPage } from './pages/OptionsPage/OptionsPage';
import { ShopPage } from './pages/ShopPage/ShopPage';
import { useProfile } from './state/profileContext';

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md).
export function App() {
  const { profile, dispatch } = useProfile();
  const [screen, setScreen] = useState<
    'menu' | 'world' | 'game' | 'options' | 'shop'
  >('menu');
  const [level, setLevel] = useState(1);
  const [lastClear, setLastClear] = useState<{
    level: number;
    reward: Reward;
  }>();
  // Set when returning to the map right after a win, so the cat walks on.
  const [walkFrom, setWalkFrom] = useState<number>();

  function openWorld(cleared?: number) {
    setWalkFrom(cleared);
    setScreen('world');
  }

  function handleCleared(score: number, seconds: number) {
    // Same rule the profile applies, read before the profile changes.
    const reward = clearReward(
      level,
      score,
      profile.levelsCleared,
      profile.bestScores[level],
    );
    setLastClear({ level, reward });
    dispatch({ type: 'levelCleared', level, score, seconds });
  }

  if (screen === 'options') {
    return <OptionsPage onBack={() => setScreen('menu')} />;
  }
  if (screen === 'shop') {
    return <ShopPage onBack={() => setScreen('menu')} />;
  }
  if (screen === 'menu') {
    return (
      <MenuPage
        onOpenWorld={() => openWorld()}
        onOpenOptions={() => setScreen('options')}
        onOpenShop={() => setScreen('shop')}
      />
    );
  }
  if (screen === 'world') {
    return (
      <WorldPage
        onPlay={(next) => {
          setLastClear(undefined);
          setLevel(next);
          setScreen('game');
        }}
        onOpenMenu={() => setScreen('menu')}
        walkFrom={walkFrom}
      />
    );
  }
  // Leaving a level for the map discards it (see Saving in
  // docs/GAME_RULES.md).
  return (
    <GamePage
      key={level}
      level={level}
      coins={profile.coins}
      onSpendCoins={(amount) => dispatch({ type: 'spendCoins', amount })}
      onCleared={handleCleared}
      reward={lastClear?.level === level ? lastClear.reward : undefined}
      onNextLevel={() => setLevel(level + 1)}
      onOpenMenu={() =>
        openWorld(lastClear?.level === level ? level : undefined)
      }
    />
  );
}
