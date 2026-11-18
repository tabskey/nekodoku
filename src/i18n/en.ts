import type { Text } from './pt';

export const en: Text = {
  levelLabel: (level) => `Level ${level}`,
  loading: 'Getting the board ready…',
  won: 'Solved!',
  coins: (coins) => `${coins} coins`,
  reveal: 'Reveal',
  eraser: 'Eraser',
  helpLabel: (name, cost) =>
    cost === 0 ? `${name}, free` : `${name}, ${cost} coins`,
  lost: 'Out of lives.',
  retry: 'Try again',
  lives: (lives) => (lives === 1 ? '1 life' : `${lives} lives`),
  score: (score) => `${score} points`,
  time: (minutes, seconds) => `${minutes} min ${seconds} s`,
  nextLevel: 'Next level',
  board: 'Board',
  cellLabel: (row, col, mark) =>
    `Row ${row}, column ${col}: ${{ empty: 'empty', marked: 'marked', cat: 'cat' }[mark]}`,
  progress: (placed, total) => `${placed} of ${total} cats`,
};
