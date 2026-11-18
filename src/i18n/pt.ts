// Portuguese, the default language. This file defines the keys; en.ts must
// match it. See "Languages" in docs/ARCHITECTURE.md.
export const pt = {
  levelLabel: (level: number) => `Fase ${level}`,
  loading: 'Preparando o tabuleiro…',
  won: 'Resolvido!',
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
