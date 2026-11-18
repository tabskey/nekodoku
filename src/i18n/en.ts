import type { Text } from './pt';

export const en: Text = {
  levelLabel: (level) => `Level ${level}`,
  loading: 'Getting the board ready…',
  won: 'Solved!',
  worldLabel: (world) => `World ${world}`,
  boss: 'Boss',
  finalScore: (score) => `${score} points`,
  reward: (coins, fish) =>
    fish > 0
      ? `You earned ${coins} coins and ${fish} fish`
      : `You earned ${coins} coins`,
  noReward: 'No reward: beat your best score to earn again.',
  optionsButton: 'Options',
  optionsTitle: 'Options',
  languageLegend: 'Language',
  themeLegend: 'Mode',
  followDevice: 'Device',
  portuguese: 'Português',
  english: 'English',
  night: 'Night',
  day: 'Day',
  sound: 'Sound effects',
  autoMark: 'Auto-mark',
  back: 'Back',
  rulesButton: 'Rules',
  rulesTitle: 'Rules',
  rules: [
    'One cat in every row and every column.',
    'One cat in every color zone.',
    'Cats cannot touch, not even diagonally.',
  ],
  closeHint: 'Tap anywhere to close.',
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
