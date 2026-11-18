import type { Text } from './pt';

export const en: Text = {
  levelLabel: (level) => `Level ${level}`,
  loading: 'Getting the board ready…',
  won: 'Solved!',
  lost: 'Out of lives.',
  retry: 'Try again',
  lives: (lives) => (lives === 1 ? '1 life' : `${lives} lives`),
  score: (score) => `${score} points`,
  nextLevel: 'Next level',
  board: 'Board',
  cellLabel: (row, col, mark) =>
    `Row ${row}, column ${col}: ${{ empty: 'empty', marked: 'marked', cat: 'cat' }[mark]}`,
  progress: (placed, total) => `${placed} of ${total} cats`,
};
