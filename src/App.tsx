import { useState } from 'react';
import { GamePage } from './pages/GamePage/GamePage';
import { OptionsPage } from './pages/OptionsPage/OptionsPage';

// shortcut: coins live in memory and reset on reload, and nothing earns them
// yet; the saved profile (Phase 6) replaces this with real balances.
const STARTING_COINS = 200;

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md).
// shortcut: the level is kept in memory only; saving arrives in Phase 6.
export function App() {
  const [screen, setScreen] = useState<'game' | 'options'>('game');
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(STARTING_COINS);

  if (screen === 'options') {
    return <OptionsPage onBack={() => setScreen('game')} />;
  }
  // Leaving a level discards it (see Saving in docs/GAME_RULES.md), so coming
  // back from Options starts the level again.
  return (
    <GamePage
      key={level}
      level={level}
      coins={coins}
      onSpendCoins={(amount) => setCoins((c) => c - amount)}
      onNextLevel={() => setLevel(level + 1)}
      onOpenOptions={() => setScreen('options')}
    />
  );
}
