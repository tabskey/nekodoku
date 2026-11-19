# Nekodoku 🐱

[![Deploy](https://github.com/tabskey/nekodoku/actions/workflows/deploy.yml/badge.svg)](https://github.com/tabskey/nekodoku/actions/workflows/deploy.yml)

**Jogar / Play:** https://tabskey.github.io/nekodoku/

[Português](#português) · [English](#english)

<!-- Screenshots and a short gameplay GIF go here, right under the links. -->

## Português

Um gatinho por linha, um por coluna, um por cor... e ninguém encostando em ninguém! Um quebra-cabeça em pixel art para o celular. **Sem anúncios, sem compras, sem esperar energia voltar**, e funciona até sem internet.

### A história

Numa noite sem lua, a **Dona Morte** passou pelo reino dos gatinhos com sua capa comprida e o saco de sempre. Ela é desorganizada: adora ordem, mas só consegue ver uma coisa de cada vez. Então, de cada mundo, levou um gatinho e o transformou em **fantasminha**, e o escondeu atrás de um tabuleiro bem enrolado.

Mas ela tem uma regra, porque a Dona Morte é muito certinha: **um gatinho por linha, por coluna e por cor, e ninguém encostando em ninguém.** Quem resolver o tabuleiro direitinho desfaz o feitiço, e o fantasminha volta a ser gatinho, com ronrom e tudo.

É aí que você entra. Fase por fase, você chega ao Boss de cada mundo, resolve o quebra-cabeça e resgata um gatinho. Dizem que a Dona Morte até torce um pouquinho para perder, só não conta pra ninguém. 🐾

### Como jogar

- **A regra:** um gatinho em cada linha, em cada coluna e em cada zona de cor. Dois gatinhos não podem se encostar, nem na diagonal.
- **No tabuleiro:**
  - Um **toque** marca um x (outro toque apaga).
  - **Toque duplo** ou **segurar** a casa coloca um gatinho.
  - **Arrastar** o dedo marca (ou apaga) vários x de uma vez.
  - Nos tabuleiros de 10x10 para cima, o botão da **lupa** aproxima, e **dois dedos** movem o tabuleiro.
- **Vidas:** são 3 por fase. Cada erro custa uma vida e 50 pontos. Perdeu? Tenta de novo, quantas vezes quiser.
- **Ajudas:** **Revelar** (50 moedas) coloca um gatinho no lugar certo, e a **Borracha** (20 moedas, grátis se não há nada para apagar) tira os x errados. Se preferir, ligue **marcar os x pra mim** nas Opções.
- **Sequência:** vitórias seguidas, sem perder nenhuma fase, aumentam moedas e peixes ganhos. São +5%, +10%, +15% e +20% (o máximo) com 2, 4, 8 e 10 vitórias.

### O que o jogo tem

- **Mundos** que começam fáceis, vão crescendo e terminam num **Boss** (tabuleiros de até 12x12) com um fantasminha esperando. Vença o Boss e ele volta a ser gatinho, numa pequena cerimônia com muito confete.
- **Um mapa por mundo:** seu gatinho anda pelo caminho (e responde se você tocar nele!). Os caminhos têm formas diferentes, e os mundos têm biomas (campo e praia) de noite, de dia e de tarde.
- **Coleção e lojinha:** escolha seu gatinho entre os que você resgatou ou comprou. A lojinha tem um rodízio diário de 4 gatinhos, comprados com peixes.
- **Moedas e peixes só jogando.** Não existe outro jeito, e nunca vai existir.
- **Músicas e sons** feitos no próprio navegador, com chaves separadas para a música e para os efeitos.
- **Português e inglês**, e modo noturno ou diurno.
- **Backup por código:** copie o código nas Opções e cole em outro aparelho.

### Instalar como app

Abra o jogo uma vez com internet, e ele passa a funcionar sem ela.

- **Android (Chrome):** menu ⋮ → **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**.

Algumas coisas que vale saber:

- **Seu progresso fica só no aparelho,** sem servidor nenhum. Para levar para outro, use o **código de backup** nas Opções. No iPhone, o Safari pode apagar os dados de sites que ficam muito tempo sem abrir, e instalar o jogo na tela inicial evita isso.
- **Atualizações:** quando sai uma versão nova, aparece um pontinho coral no botão **Opções** do menu. Dentro das Opções, toque em **Atualizar o jogo**. Seu progresso fica salvo. O botão não aparece com uma fase aberta.

### Precisa de ajuda: testadores de iPhone 🐱

O jogo é feito e testado no Android, e ninguém no projeto tem um iPhone. Se você tem, uns minutinhos no Safari ajudam muito:

1. Abra o link, resolva a fase 1 e **instale** na tela inicial. Depois ligue o **modo avião** e abra o jogo: ele deve carregar e funcionar.
2. **Toque** numa casa vazia (aparece um x), e toque no x (some).
3. **Toque duplo** numa casa e **segure** outra: as duas devem receber um gatinho.
4. Segurar uma casa **não** pode abrir menu, lupa nem selecionar texto.
5. Chegue na fase 5 (9x9) e **arraste** o dedo por uma linha: todas as casas ganham um x de uma vez, e a página não rola nem dá zoom.
6. Os gatinhos estão nítidos, sem borrão?

Abra uma [issue](https://github.com/tabskey/nekodoku/issues) com o modelo do iPhone, a versão do iOS e o que funcionou ou não. Print ou uma gravação de tela curta são muito bem-vindos. Obrigado!

### Para quem quer mexer

Tudo é estático: **React 19 + TypeScript + Vite**, testes com **Vitest**, **ESLint** e **Prettier**. Sem backend, sem contas, sem rastreamento. O deploy é pelo GitHub Actions para o GitHub Pages.

```sh
npm install
npm run dev            # servidor local
npm test               # testes (Vitest)
npm run test:coverage  # testes com cobertura (lcov)
npm run lint           # ESLint
npm run build          # build de produção em dist/
npm run preview        # abre o build
```

No contêiner (Docker ou Podman, só para desenvolvimento):

```sh
docker build -t nekodoku-dev .
docker run --rm -it -p 5173:5173 -v "$PWD":/app:Z -v /app/node_modules nekodoku-dev npm run dev -- --host
```

Como o código é organizado:

| Pasta | O que tem |
| --- | --- |
| `src/game/` | Regras, solver, gerador e progressão: TypeScript puro, sem React nem navegador. **Todo tabuleiro gerado tem exatamente uma solução**, e há testes para isso |
| `src/state/` | Reducers e contextos (perfil e nível) |
| `src/storage/` | O único lugar que toca o `localStorage`: salvamento versionado, migrações e código de backup |
| `src/components/`, `src/pages/` | Interface em atomic design (átomos, moléculas, organismos) e as telas |
| `src/i18n/` | Textos em português e inglês |
| `src/audio/` | Sons e músicas sintetizados com Web Audio, como dados |
| `src/pwa/`, `src/sw.js` | Service worker escrito à mão e a oferta de atualização |

Leia o **`AGENTS.md`** primeiro: ele resume como trabalhar aqui. A pasta `docs/` tem o resto:

- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): pilha, camadas, modelo de dados, salvamento, deploy
- [`GAME_RULES.md`](docs/GAME_RULES.md): regras, vidas, moedas, mundos e progressão
- [`DESIGN.md`](docs/DESIGN.md) e [`SPRITES.md`](docs/SPRITES.md): cores, telas e regras da pixel art
- [`ROADMAP.md`](docs/ROADMAP.md): as sete fases do projeto
- [`FUTURE_BACKEND.md`](docs/FUTURE_BACKEND.md): ideias para um servidor, **só ideias**

A arte atual é provisória. A arte final é desenhada à mão no Aseprite. Ideias e bugs são bem-vindos nas [issues](https://github.com/tabskey/nekodoku/issues).

## English

One cat per row, one per column, one per color... and nobody touching anybody! A pixel-art puzzle for your phone. **No ads, no purchases, no waiting for energy to refill**, and it even works offline.

### The story

On a moonless night, **Lady Death** wandered through the kingdom of the cats in her long cloak, with her usual sack. She loves order but can only look at one thing at a time. So from every world she took one cat, turned it into a little **ghost**, and hid it behind a very tangled board.

But she has a rule, because Lady Death is a stickler: **one cat per row, per column and per color, and nobody touching anybody.** Whoever solves the board properly breaks the spell, and the ghost turns back into a cat, purring and all.

That is where you come in. Level by level, you reach each world's Boss, solve the puzzle and rescue a cat. They say Lady Death secretly cheers a little for you to win. Don't tell anyone. 🐾

### How to play

- **The rule:** one cat in every row, every column and every color zone. Two cats cannot touch, not even diagonally.
- **On the board:**
  - A **tap** marks an x (another tap erases it).
  - A **double tap** or a **press and hold** places a cat.
  - **Dragging** a finger marks (or erases) many x at once.
  - On boards of 10x10 and up, the **magnifier** button zooms in, and **two fingers** move the board.
- **Lives:** 3 per level. Each mistake costs a life and 50 points. Lost? Try again, as many times as you like.
- **Helps:** **Reveal** (50 coins) puts one cat in the right place, and the **Eraser** (20 coins, free when there is nothing to erase) removes the wrong x. Or turn on **mark the x for me** in Options.
- **Win streak:** wins in a row, with no level lost, raise the coins and fish you earn: +5%, +10%, +15% and +20% (the most) at 2, 4, 8 and 10 wins.

### What it has

- **Worlds** that start easy, grow, and end with a **Boss** (boards up to 12x12) and a little ghost waiting. Beat the Boss and it turns back into a cat, in a small ceremony with a lot of confetti.
- **A map for each world:** your cat walks along the path (and answers if you tap it!). The paths have different shapes, and the worlds have biomes (meadow and beach) at night, by day and in the afternoon.
- **A collection and a shop:** pick your cat from the ones you rescued or bought. The shop has a daily rotation of 4 cats, bought with fish.
- **Coins and fish only by playing.** There is no other way, and there never will be.
- **Music and sounds** made in the browser itself, with separate switches for the music and the effects.
- **Portuguese and English**, and a night or day mode.
- **Backup by code:** copy the code in Options and paste it on another device.

### Install as an app

Open the game once with internet, and it keeps working without it.

- **Android (Chrome):** menu ⋮ → **Install app** (or **Add to Home screen**).
- **iPhone (Safari):** Share button → **Add to Home Screen**.

Good to know:

- **Your progress stays on the device only,** with no server. To move it to another one, use the **backup code** in Options. On iPhone, Safari may erase the data of sites that are not opened for a long time, and installing the game on the home screen avoids that.
- **Updates:** when a new version is out, a coral dot appears on the menu's **Options** button. Inside Options, tap **Update the game**. Your progress stays saved. The button is not shown with a level open.

### Help wanted: iPhone testers 🐱

The game is built and tested on Android, and nobody on the project has an iPhone. If you have one, a few minutes in Safari would help a lot:

1. Open the link, solve level 1 and **install** it to the home screen. Then turn on **airplane mode** and open the game: it should load and play.
2. **Tap** an empty cell (an x appears), and tap the x (it disappears).
3. **Double tap** a cell and **press and hold** another: both should place a cat.
4. Holding a cell must **not** open a menu, a magnifier or select text.
5. Reach level 5 (9x9) and **drag** a finger across a row: every cell gets an x in one stroke, and the page must not scroll or zoom.
6. Do the cats look sharp, not blurry?

Please open an [issue](https://github.com/tabskey/nekodoku/issues) with your iPhone model, iOS version, and what worked or did not. Screenshots or a short screen recording are very welcome. Thank you!

### For developers

Everything is static: **React 19 + TypeScript + Vite**, tested with **Vitest**, linted with **ESLint** and formatted with **Prettier**. No backend, no accounts, no tracking. It deploys through GitHub Actions to GitHub Pages.

```sh
npm install
npm run dev            # local dev server
npm test               # tests (Vitest)
npm run test:coverage  # tests with coverage (lcov)
npm run lint           # ESLint
npm run build          # production build into dist/
npm run preview        # serve the build
```

In the container (Docker or Podman, development only):

```sh
docker build -t nekodoku-dev .
docker run --rm -it -p 5173:5173 -v "$PWD":/app:Z -v /app/node_modules nekodoku-dev npm run dev -- --host
```

How the code is organized:

| Folder | What it holds |
| --- | --- |
| `src/game/` | Rules, solver, generator and progression: pure TypeScript, no React or browser. **Every generated board has exactly one solution**, and tests check it |
| `src/state/` | Reducers and contexts (profile and level) |
| `src/storage/` | The only place that touches `localStorage`: the versioned save, migrations and the backup code |
| `src/components/`, `src/pages/` | The interface in atomic design (atoms, molecules, organisms) and the screens |
| `src/i18n/` | The texts in Portuguese and English |
| `src/audio/` | Sounds and songs synthesized with Web Audio, as data |
| `src/pwa/`, `src/sw.js` | The hand-written service worker and the update offer |

Read **`AGENTS.md`** first: it sums up how to work here. The `docs/` folder has the rest:

- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): stack, layers, data model, saving, deploy
- [`GAME_RULES.md`](docs/GAME_RULES.md): rules, lives, coins, worlds and progression
- [`DESIGN.md`](docs/DESIGN.md) and [`SPRITES.md`](docs/SPRITES.md): colors, screens and pixel-art rules
- [`ROADMAP.md`](docs/ROADMAP.md): the seven phases of the project
- [`FUTURE_BACKEND.md`](docs/FUTURE_BACKEND.md): ideas for a server, **ideas only**

The current art is a placeholder. The final art is drawn by hand in Aseprite. Ideas and bugs are welcome in the [issues](https://github.com/tabskey/nekodoku/issues).

## License

[Apache License 2.0](LICENSE).
