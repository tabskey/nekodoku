import { useState } from 'react';
import { GamePage } from './pages/GamePage/GamePage';
import { OptionsPage } from './pages/OptionsPage/OptionsPage';
import { useProfile } from './state/profileContext';

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md).
export function App() {
  const { profile, dispatch } = useProfile();
  const [screen, setScreen] = useState<'game' | 'options'>('game');
  // Opens on the first level not yet cleared. The menu and map (later in
  // Phase 6) will let the player pick any open level instead.
  const [level, setLevel] = useState(() => profile.levelsCleared + 1);

  if (screen === 'options') {
    return <OptionsPage onBack={() => setScreen('game')} />;
  }
  // Leaving a level discards it (see Saving in docs/GAME_RULES.md), so coming
  // back from Options starts the level again.
  return (
    <GamePage
      key={level}
      level={level}
      coins={profile.coins}
      onSpendCoins={(amount) => dispatch({ type: 'spendCoins', amount })}
      onCleared={(score, seconds) =>
        dispatch({ type: 'levelCleared', level, score, seconds })
      }
      onNextLevel={() => setLevel(level + 1)}
      onOpenOptions={() => setScreen('options')}
    />
  );
}
