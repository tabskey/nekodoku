import { useState } from 'react';
import { GamePage } from './pages/GamePage/GamePage';

// shortcut: coins live in memory and reset on reload, and nothing earns them
// yet; the saved profile (Phase 6) replaces this with real balances.
const STARTING_COINS = 200;

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md). For now there is one screen: the level.
// shortcut: the level is kept in memory only; saving arrives in Phase 6.
export function App() {
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(STARTING_COINS);
  return (
    <GamePage
      key={level}
      level={level}
      coins={coins}
      onSpendCoins={(amount) => setCoins((c) => c - amount)}
      onNextLevel={() => setLevel(level + 1)}
    />
  );
}
