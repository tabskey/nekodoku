import { useState } from 'react';
import { clearReward, type Reward } from './game/rewards';
import { GamePage } from './pages/GamePage/GamePage';
import { MenuPage } from './pages/MenuPage/MenuPage';
import { OptionsPage } from './pages/OptionsPage/OptionsPage';
import { ShopPage } from './pages/ShopPage/ShopPage';
import { useProfile } from './state/profileContext';

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md).
export function App() {
  const { profile, dispatch } = useProfile();
  const [screen, setScreen] = useState<'menu' | 'game' | 'options' | 'shop'>(
    'menu',
  );
  const [level, setLevel] = useState(1);
  const [lastClear, setLastClear] = useState<{
    level: number;
    reward: Reward;
  }>();
  // Set when returning to the menu right after a win, so the cat walks on.
  const [walkFrom, setWalkFrom] = useState<number>();

  function openMenu(cleared?: number) {
    setWalkFrom(cleared);
    setScreen('menu');
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
    return <OptionsPage onBack={() => openMenu()} />;
  }
  if (screen === 'shop') {
    return <ShopPage onBack={() => openMenu()} />;
  }
  if (screen === 'menu') {
    return (
      <MenuPage
        onPlay={(next) => {
          setLastClear(undefined);
          setLevel(next);
          setScreen('game');
        }}
        onOpenOptions={() => setScreen('options')}
        onOpenShop={() => setScreen('shop')}
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
      onNextLevel={() => setLevel(level + 1)}
      onOpenMenu={() =>
        openMenu(lastClear?.level === level ? level : undefined)
      }
    />
  );
}
