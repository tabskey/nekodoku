import type { Text } from './pt';

export const en: Text = {
  levelLabel: (level) => `Level ${level}`,
  loading: 'Getting the board ready…',
  won: 'Solved!',
  nextLevel: 'Next level',
  board: 'Board',
  cellLabel: (row, col, mark) =>
    `Row ${row}, column ${col}: ${{ empty: 'empty', marked: 'marked', cat: 'cat' }[mark]}`,
  progress: (placed, total) => `${placed} of ${total} cats`,
};
