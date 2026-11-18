// Portuguese, the default language. This file defines the keys; en.ts must
// match it. See "Languages" in docs/ARCHITECTURE.md.
export const pt = {
  levelLabel: (level: number) => `Fase ${level}`,
  loading: 'Preparando o tabuleiro…',
  won: 'Resolvido!',
  optionsButton: 'Opções',
  optionsTitle: 'Opções',
  languageLegend: 'Idioma',
  themeLegend: 'Modo',
  followDevice: 'Aparelho',
  // Language names are written in their own language in both files.
  portuguese: 'Português',
  english: 'English',
  night: 'Noturno',
  day: 'Diurno',
  sound: 'Efeitos sonoros',
  autoMark: 'Marcar automaticamente',
  back: 'Voltar',
  rulesButton: 'Regras',
  rulesTitle: 'Regras',
  rules: [
    'Um gato em cada linha e em cada coluna.',
    'Um gato em cada zona de cor.',
    'Os gatos não podem se tocar, nem na diagonal.',
  ],
  closeHint: 'Toque em qualquer lugar para fechar.',
  coins: (coins: number) => `${coins} moedas`,
  reveal: 'Revelar',
  eraser: 'Borracha',
  helpLabel: (name: string, cost: number) =>
    cost === 0 ? `${name}, grátis` : `${name}, ${cost} moedas`,
  lost: 'Acabaram as vidas.',
  retry: 'Tentar de novo',
  lives: (lives: number) => (lives === 1 ? '1 vida' : `${lives} vidas`),
  score: (score: number) => `${score} pontos`,
  time: (minutes: number, seconds: number) => `${minutes} min ${seconds} s`,
  nextLevel: 'Próxima fase',
  board: 'Tabuleiro',
  cellLabel: (row: number, col: number, mark: 'empty' | 'marked' | 'cat') =>
    `Linha ${row}, coluna ${col}: ${{ empty: 'vazia', marked: 'marcada', cat: 'gato' }[mark]}`,
  progress: (placed: number, total: number) => `${placed} de ${total} gatos`,
};

export type Text = typeof pt;
