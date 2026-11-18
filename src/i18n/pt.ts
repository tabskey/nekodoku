// Portuguese, the default language. This file defines the keys; en.ts must
// match it. See "Languages" in docs/ARCHITECTURE.md.
export const pt = {
  levelLabel: (level: number) => `Fase ${level}`,
  loading: 'Preparando o tabuleiro…',
  won: 'Resolvido!',
  shopButton: 'Loja',
  shopTitle: 'Loja',
  todaysCats: 'Gatos de hoje',
  todaysCatsHint:
    'Cada gato só pode ser comprado nos dias em que aparece aqui.',
  noShopCats: 'Nenhum gato novo hoje.',
  yourCats: 'Seus gatos',
  helpsTitle: 'Ajudas',
  helpsHint: 'Compradas com moedas na hora de usar, durante a fase.',
  revealInfo: 'Coloca um gato certo.',
  eraserInfo:
    'Apaga os x que estão em casas de gato. Grátis se não houver nenhum.',
  fish: (fish: number) => `${fish} peixes`,
  buyCat: (name: string, price: number) =>
    `Comprar ${name} por ${price} peixes`,
  useCat: 'Usar',
  inUse: 'Em uso',
  useCatLabel: (name: string) => `Usar ${name}`,
  inUseLabel: (name: string) => `${name}, em uso`,
  catNames: {
    white: 'Mingau',
    orange: 'Caramelo',
    gray: 'Fumaça',
    black: 'Meia-noite',
    calico: 'Tricolor',
  } as Record<string, string>,
  appName: 'Nekodoku',
  play: 'Jogar',
  menuButton: 'Menu',
  worldPath: (world: number) => `Caminho do mundo ${world}`,
  tileLabel: (level: number, state: 'cleared' | 'current' | 'locked') =>
    `Fase ${level}: ${{ cleared: 'concluída', current: 'atual', locked: 'bloqueada' }[state]}`,
  bossTileLabel: (state: 'cleared' | 'current' | 'locked') =>
    `Chefe: ${{ cleared: 'vencido', current: 'atual', locked: 'bloqueado' }[state]}`,
  selectedCat: 'Seu gato',
  previousWorld: 'Mundo anterior',
  nextWorld: 'Próximo mundo',
  worldDots: (world: number, total: number) => `Mundo ${world} de ${total}`,
  lockedWorld: (previous: number) =>
    `Vença o Chefe do Mundo ${previous} para abrir.`,
  bestScoreNote: (score: number) => `recorde ${score}`,
  worldLabel: (world: number) => `Mundo ${world}`,
  boss: 'Chefe',
  finalScore: (score: number) => `${score} pontos`,
  reward: (coins: number, fish: number) =>
    fish > 0
      ? `Ganhou ${coins} moedas e ${fish} peixes`
      : `Ganhou ${coins} moedas`,
  noReward: 'Sem recompensa: para ganhar de novo, supere seu recorde.',
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
  backupTitle: 'Código de backup',
  backupHint:
    'Leve seu progresso para outro aparelho. O código é uma foto do momento: crie um novo depois de jogar.',
  createCode: 'Criar código',
  useCode: 'Usar código',
  copyCode: 'Copiar',
  copied: 'Copiado!',
  copyFailed: 'Não deu para copiar. Selecione o texto e copie à mão.',
  codeLabel: 'Seu código de backup',
  pasteLabel: 'Cole o código aqui',
  checkCode: 'Verificar',
  codeChecksum: 'Código incompleto ou com erro de digitação.',
  codeInvalid: 'Este código não é um progresso do Nekodoku.',
  backupSummary: (levels: number, coins: number, fish: number, cats: number) =>
    `Este código tem ${levels} fases concluídas, ${coins} moedas, ${fish} peixes e ${cats} gatos.`,
  backupWarning: 'Seu progresso atual neste aparelho será substituído.',
  confirmImport: 'Substituir',
  cancel: 'Cancelar',
  imported: 'Progresso restaurado.',
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
