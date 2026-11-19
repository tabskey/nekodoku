import type { Text } from './pt';

export const en: Text = {
  levelLabel: (level) => `Level ${level}`,
  loading: 'Getting the board ready…',
  wonMessages: [
    { title: 'Purr-fect!', line: 'Every cat in its cozy corner.' },
    { title: 'Purring loudly!', line: 'The cats loved the board.' },
    { title: 'Paws up!', line: 'Nobody touched anybody.' },
    { title: 'Cat-tastic!', line: 'That board was a piece of cake.' },
  ],
  shopButton: 'Shop',
  shopTitle: 'Cat Shop',
  todaysCats: 'Just arrived!',
  todaysCatsHint:
    'Each cat only shows up on certain days. Missed one? It comes back another day!',
  noShopCats: 'No new cats today. Come back tomorrow!',
  collectionTitle: 'Cats',
  collectionCount: (owned, total) =>
    owned === total
      ? `Squad complete! All ${total} cats`
      : `${owned} of ${total} cats in your squad`,
  collectionHint:
    'Tap a cat to bring it along on the map. The dark ones are still hiding!',
  unknownCat: 'Who is it?',
  toRescue: 'Needs rescue',
  toRescueLabel: 'A cat still to rescue at a Boss',
  inShop: 'In the shop',
  inShopLabel: 'A cat on sale in the shop',
  helpsTitle: 'Little helpers',
  helpsHint: 'Pay with coins only when things get tough, during a level.',
  revealInfo: 'A clever kitty hops straight to the right spot.',
  eraserInfo: 'Erases the x on cat cells. Free if there are none.',
  fish: (fish) => `${fish} fish`,
  buyCat: (name, price) => `Buy ${name} for ${price} fish`,
  soldOut: 'Sold out',
  soldOutLabel: (name) => `${name}: sold out, it is yours`,
  useCat: 'Choose',
  inUse: 'Chosen!',
  useCatLabel: (name) => `Choose ${name}`,
  inUseLabel: (name) => `${name}, chosen`,
  // Cat names are translated, not kept in Portuguese: each one says what the
  // cat looks like (Mingau is the soft white default, Fumaça is smoke gray).
  catNames: {
    white: 'Snowball',
    orange: 'Caramel',
    gray: 'Smoky',
    black: 'Midnight',
    calico: 'Calico',
  },
  appName: 'Nekodoku',
  tagline: 'One cat per row, column and color... and no touching!',
  play: "Let's play!",
  worldLevel: (world, level) => `World ${world} · level ${level}`,
  worldBoss: (world) => `World ${world} · the Boss awaits!`,
  towardBoss: 'On to the Boss!',
  bossInfo: (size) =>
    `At the end: a ${size}x${size} board and a little ghost waiting to be a cat again!`,
  catsButton: 'Cats',
  bestTime: (size, time) =>
    `Best on ${size}x${size}: ${time}. Think you can beat it?`,
  mapHint: 'Tap an open level and your cat walks there. Tap again to go in!',
  mapSays: ['Meow!', "Let's go!", 'This way!', 'Hehe!', 'Tickles!', 'Purr!'],
  petCat: 'Pet your cat',
  playLevel: (level) => `Let's go, level ${level}!`,
  playBoss: "Let's face the Boss!",
  menuButton: 'Menu',
  worldPath: (world) => `World ${world} path`,
  tileLabel: (level, state) =>
    `Level ${level}: ${{ cleared: 'cleared', current: 'current', locked: 'locked' }[state]}`,
  bossTile: 'BOSS',
  bossTileLabel: (state) =>
    `Boss: ${{ cleared: 'beaten', current: 'current', locked: 'locked' }[state]}`,
  selectedCat: 'Your cat',
  catHellos: ['Hi!!', 'Meow!', 'Welcome back!', 'Purr purr...', 'Wanna play?'],
  previousWorld: 'Previous world',
  nextWorld: 'Next world',
  worldDots: (world, total) => `World ${world} of ${total}`,
  lockedWorld: (previous) =>
    `Shh, this world is still asleep. Beat the World ${previous} Boss to wake it up!`,
  bestScoreNote: (score) => `best ${score}`,
  worldLabel: (world) => `World ${world}`,
  boss: 'Boss',
  zoomIn: 'Zoom in',
  zoomOut: 'See all',
  zoomHint: 'Drag with two fingers to move the board.',
  restoredYay: 'YAY!',
  restoredTitle: 'Cat restored!',
  restoredMessage: (world) =>
    `World ${world}'s ghost is a cat again and joined your collection.`,
  restoredCatLabel: (name) => `${name}, the restored cat, full body`,
  backToMap: 'Back to the map',
  replayRestoration: 'Watch the restoration again',
  bossScene: "The world's scenery, with the cat's ghost waiting",
  finalScore: (score) => `${score} points`,
  reward: (coins, fish) =>
    fish > 0
      ? `You earned ${coins} coins and ${fish} fish`
      : `You earned ${coins} coins`,
  noReward: 'No reward: beat your best score to earn again.',
  streakBanner: (count, percent, max) =>
    `Win streak: ${count}${percent > 100 ? ` · x${(percent / 100).toFixed(2)}${max ? ' max' : ''}` : ''}`,
  streakLabel: (count, percent) =>
    `${count} ${count === 1 ? 'win' : 'wins'} in a row${percent > 100 ? `, rewards x${(percent / 100).toFixed(2)}` : ''}`,
  streakStep: (percent) => `+${percent}%`,
  multiplier: (percent) => `x${(percent / 100).toFixed(2)}`,
  optionsButton: 'Options',
  optionsTitle: 'Options',
  languageLegend: 'How does the cat talk?',
  themeLegend: 'Day or night?',
  followDevice: 'Device',
  portuguese: 'Português',
  english: 'English',
  night: 'Night',
  day: 'Day',
  sound: 'Meows and sound effects',
  music: 'Background tunes',
  autoMark: 'Mark the x for me',
  back: 'Back',
  backupTitle: 'Backup code',
  backupHint:
    'Take your progress (and your cats!) to another device. The code is a snapshot: make a new one after playing.',
  createCode: 'Save progress',
  useCode: 'Restore progress',
  copyCode: 'Copy',
  copied: 'Copied! Keep it safe, okay?',
  copyFailed:
    'Oops, the cat knocked it over! Select the text and copy it by hand.',
  codeLabel: 'Your backup code',
  pasteLabel: 'Paste the code here',
  checkCode: 'Sniff the code',
  codeChecksum: 'Hmm, the code looks incomplete or has a typo.',
  codeInvalid: 'Hmm, this code is not a Nekodoku save.',
  backupSummary: (levels, coins, fish, cats) =>
    `Found ${levels} levels cleared, ${coins} coins, ${fish} fish and ${cats} cats.`,
  backupWarning:
    'Heads up: the progress on this device will be swapped for this one.',
  confirmImport: 'Yes, swap it',
  cancel: 'Never mind',
  imported: 'Done! Your progress is back home.',
  resetTitle: 'Start over',
  resetHint:
    'Erases the levels, coins, fish, cats and streak on this device. Your options stay as they are.',
  resetButton: 'Clear progress',
  resetWarning:
    'Are you sure? The cats will miss you! This cannot be undone. Want to copy a backup code first?',
  resetBackup: 'Copy backup first',
  resetConfirm: 'Yes, erase everything',
  resetDone: 'Done! All clean. Ready to start again?',
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
  lostMessages: [
    { title: 'Meow... out of lives!', line: 'The cats went off for a nap.' },
    { title: 'Oops, slipped!', line: 'Cats land on their feet... sometimes.' },
    {
      title: 'The cats ran away!',
      line: 'They will come back if you call again.',
    },
    {
      title: 'Out of lives!',
      line: 'Take a breath, give a pet and try again.',
    },
  ],
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
