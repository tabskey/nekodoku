// Portuguese, the default language. This file defines the keys; en.ts must
// match it. See "Languages" in docs/ARCHITECTURE.md.
export const pt = {
  levelLabel: (level: number) => `Fase ${level}`,
  loading: 'Preparando o tabuleiro…',
  // A title and a line, one pair shown at random for each won level.
  wonMessages: [
    { title: 'Miau-ravilha!', line: 'Cada gatinho no seu cantinho.' },
    { title: 'Ronrom garantido!', line: 'Os gatinhos adoraram o tabuleiro.' },
    { title: 'Patinhas pro alto!', line: 'Ninguém encostou em ninguém.' },
    { title: 'Gatíssimo!', line: 'Esse tabuleiro foi moleza pra você.' },
  ],
  shopButton: 'Lojinha',
  shopTitle: 'Lojinha',
  todaysCats: 'Chegaram hoje!',
  todaysCatsHint:
    'Cada gatinho só dá as caras nos dias em que aparece aqui. Perdeu? Ele volta outro dia!',
  noShopCats: 'Hoje não chegou nenhum gatinho novo. Volta amanhã!',
  collectionTitle: 'Gatinhos',
  collectionCount: (owned: number, total: number) =>
    owned === total
      ? `Turminha completa! ${total} gatinhos`
      : `${owned} de ${total} gatinhos na sua turminha`,
  collectionHint:
    'Toque num gatinho pra ele te acompanhar pelo mapa. Os escurinhos ainda estão escondidos!',
  unknownCat: 'Quem será?',
  toRescue: 'Espera resgate',
  toRescueLabel: 'Um gatinho ainda por resgatar num Boss',
  inShop: 'Na lojinha',
  inShopLabel: 'Um gatinho à venda na lojinha',
  helpsTitle: 'Ajudinhas',
  helpsHint: 'Você paga com moedas só na hora do aperto, durante a fase.',
  revealInfo: 'Um gatinho esperto vai direto pro lugar certo.',
  eraserInfo:
    'Apaga os x que estão em casas de gatinho. É de graça se não tiver nenhum.',
  fish: (fish: number) => `${fish} peixes`,
  buyCat: (name: string, price: number) =>
    `Comprar ${name} por ${price} peixes`,
  soldOut: 'Esgotado',
  soldOutLabel: (name: string) => `${name}: esgotado, já é seu`,
  useCat: 'Escolher',
  inUse: 'Escolhido!',
  useCatLabel: (name: string) => `Escolher ${name}`,
  inUseLabel: (name: string) => `${name}, escolhido`,
  catNames: {
    white: 'Mingau',
    orange: 'Caramelo',
    gray: 'Fumaça',
    black: 'Meia-noite',
    calico: 'Tricolor',
  } as Record<string, string>,
  appName: 'Nekodoku',
  tagline: 'Um gatinho por linha, coluna e cor.',
  play: 'Jogar',
  worldLevel: (world: number, level: number) =>
    `Mundo ${world} · fase ${level}`,
  worldBoss: (world: number) => `Mundo ${world} · Boss`,
  towardBoss: 'Rumo ao Boss',
  bossInfo: (size: number) =>
    `Boss do mundo: tabuleiro ${size}x${size} e um gatinho pra resgatar.`,
  catsButton: 'Gatinhos',
  bestTime: (size: number, time: string) =>
    `Recorde no ${size}x${size}: ${time}`,
  mapHint: 'Toque numa fase liberada pra o gatinho andar até ela.',
  playLevel: (level: number) => `Jogar fase ${level}`,
  playBoss: 'Enfrentar o chefe',
  menuButton: 'Menu',
  worldPath: (world: number) => `Caminho do mundo ${world}`,
  tileLabel: (level: number, state: 'cleared' | 'current' | 'locked') =>
    `Fase ${level}: ${{ cleared: 'concluída', current: 'atual', locked: 'bloqueada' }[state]}`,
  bossTile: 'BOSS',
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
  zoomIn: 'Aproximar',
  zoomOut: 'Ver tudo',
  zoomHint: 'Arraste com dois dedos pra mover o tabuleiro.',
  restoredYay: 'OBA!',
  restoredTitle: 'Gatinho restaurado!',
  restoredMessage: (world: number) =>
    `O fantasminha do Mundo ${world} voltou a ser gatinho e entrou pra sua coleção.`,
  restoredCatLabel: (name: string) =>
    `${name}, o gatinho restaurado, de corpo inteiro`,
  backToMap: 'Voltar ao mapa',
  replayRestoration: 'Ver a restauração de novo',
  bossScene: 'Cenário do mundo, com o fantasminha do gatinho esperando',
  finalScore: (score: number) => `${score} pontos`,
  reward: (coins: number, fish: number) =>
    fish > 0
      ? `Ganhou ${coins} moedas e ${fish} peixes`
      : `Ganhou ${coins} moedas`,
  noReward: 'Sem recompensa: para ganhar de novo, supere seu recorde.',
  optionsButton: 'Opções',
  optionsTitle: 'Opções',
  languageLegend: 'Como o gatinho fala?',
  themeLegend: 'Dia ou noite?',
  followDevice: 'Aparelho',
  // Language names are written in their own language in both files.
  portuguese: 'Português',
  english: 'English',
  night: 'Noite',
  day: 'Dia',
  sound: 'Miaus e efeitos sonoros',
  music: 'Musiquinha de fundo',
  autoMark: 'Marcar os x pra mim',
  back: 'Voltar',
  backupTitle: 'Código de backup',
  backupHint:
    'Leve seu progresso (e seus gatinhos!) para outro aparelho. O código é uma foto do momento: crie um novo depois de jogar.',
  createCode: 'Guardar progresso',
  useCode: 'Recuperar progresso',
  copyCode: 'Copiar',
  copied: 'Copiado! Guarde bem, hein?',
  copyFailed:
    'Ops, o gatinho derrubou a cópia! Selecione o texto e copie à mão.',
  codeLabel: 'Seu código de backup',
  pasteLabel: 'Cole o código aqui',
  checkCode: 'Farejar código',
  codeChecksum:
    'Hmm, o código parece incompleto ou tem um errinho de digitação.',
  codeInvalid: 'Hmm, esse código não é um progresso do Nekodoku.',
  backupSummary: (levels: number, coins: number, fish: number, cats: number) =>
    `Achei ${levels} fases concluídas, ${coins} moedas, ${fish} peixes e ${cats} gatinhos.`,
  backupWarning:
    'Atenção: o progresso que está neste aparelho vai ser trocado por esse.',
  confirmImport: 'Sim, trocar',
  cancel: 'Deixa pra lá',
  imported: 'Pronto! Seu progresso voltou pra casa.',
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
  // A title and a line, one pair shown at random for each lost level.
  lostMessages: [
    {
      title: 'Miau... sem vidas!',
      line: 'Os gatinhos foram tirar uma soneca.',
    },
    { title: 'Ops, escorregou!', line: 'Até gato cai de pé... às vezes.' },
    {
      title: 'Os gatinhos fugiram!',
      line: 'Mas eles voltam se você chamar de novo.',
    },
    {
      title: 'Fim das vidas!',
      line: 'Respira, faz um carinho e tenta outra vez.',
    },
  ],
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
