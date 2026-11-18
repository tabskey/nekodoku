import { useState } from 'react';
import { GamePage } from './pages/GamePage/GamePage';

// Screens are switched by state, never by URL (see "Routing on GitHub Pages"
// in docs/ARCHITECTURE.md). Phase 4 has one screen: the level being played.
// shortcut: the level is kept in memory only; saving arrives in Phase 6.
export function App() {
  const [level, setLevel] = useState(1);
  return (
    <GamePage
      key={level}
      level={level}
      onNextLevel={() => setLevel(level + 1)}
    />
  );
}
