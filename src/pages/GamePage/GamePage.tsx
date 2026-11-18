import { useCallback, useReducer, useState } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import {
  CAT_PALETTES,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { HelpButton } from '../../components/molecules/HelpButton/HelpButton';
import { HudBar } from '../../components/molecules/HudBar/HudBar';
import { ProgressStrip } from '../../components/molecules/ProgressStrip/ProgressStrip';
import { Board } from '../../components/organisms/Board/Board';
import { RulesPopover } from '../../components/organisms/RulesPopover/RulesPopover';
import { helpCost, type Help } from '../../game/helps';
import { LIVES_PER_LEVEL } from '../../game/scoring';
import type { SolvedPuzzle } from '../../game/types';
import { useText } from '../../i18n/useText';
import { createLevel, levelReducer } from '../../state/levelReducer';
import { useLevelTimer } from '../../state/useLevelTimer';
import { useOptions } from '../../state/optionsContext';
import { usePuzzle } from '../../state/usePuzzle';
import './GamePage.css';

// shortcut: always Mingau; the selected cat comes from the profile in Phase 6.
const PALETTE = CAT_PALETTES.white;
// SVG fill cannot read CSS variables, so the silhouette takes the text color.
const SILHOUETTE = silhouettePalette('currentColor');

interface GamePageProps {
  level: number;
  coins: number;
  onSpendCoins: (amount: number) => void;
  onNextLevel: () => void;
  onOpenOptions: () => void;
}

type LevelProps = Omit<GamePageProps, 'level' | 'onOpenOptions'> & {
  puzzle: SolvedPuzzle;
};

const HELP_ACTIONS = { reveal: 'useReveal', eraser: 'useEraser' } as const;

/** One level, from loading to solved. */
export function GamePage({
  level,
  onOpenOptions,
  ...levelProps
}: GamePageProps) {
  const text = useText();
  const puzzle = usePuzzle(level);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className="game-page">
      <header className="game-page-header">
        <h1>{text.levelLabel(level)}</h1>
        <button
          type="button"
          className="game-page-icon-button game-page-options"
          aria-label={text.optionsButton}
          onClick={onOpenOptions}
        >
          ⚙
        </button>
        <button
          type="button"
          className="game-page-icon-button game-page-rules"
          aria-label={text.rulesButton}
          onClick={() => setRulesOpen(true)}
        >
          !
        </button>
      </header>
      <RulesPopover
        open={rulesOpen}
        title={text.rulesTitle}
        rules={text.rules}
        closeHint={text.closeHint}
        onClose={() => setRulesOpen(false)}
      />
      {puzzle ? (
        <Level puzzle={puzzle} {...levelProps} />
      ) : (
        <p className="game-page-status">{text.loading}</p>
      )}
    </main>
  );
}

function Level({ puzzle, coins, onSpendCoins, onNextLevel }: LevelProps) {
  const text = useText();
  const { options } = useOptions();
  // Auto-mark is read once, when the level starts; changing it means leaving
  // the level, which starts it again.
  const [state, dispatch] = useReducer(levelReducer, puzzle, (p) =>
    createLevel(p, options.autoMark),
  );
  const tick = useCallback(() => dispatch({ type: 'tick' }), []);
  useLevelTimer(state.status === 'playing', tick);
  const placed = state.marks.filter((mark) => mark === 'cat').length;
  const playing = state.status === 'playing';

  function buyHelp(help: Help) {
    const cost = helpCost(help, puzzle, state.marks);
    if (!playing || cost > coins) return;
    onSpendCoins(cost);
    dispatch({ type: HELP_ACTIONS[help] });
  }

  return (
    <>
      <HudBar
        lives={state.lives}
        maxLives={LIVES_PER_LEVEL}
        score={state.score}
        elapsedSeconds={state.elapsedSeconds}
        livesLabel={text.lives(state.lives)}
        scoreLabel={text.score(state.score)}
        timeLabel={text.time}
        coins={coins}
        coinsLabel={text.coins(coins)}
      />
      <div className="game-page-progress">
        <ProgressStrip
          placed={placed}
          total={puzzle.size}
          palette={PALETTE}
          silhouette={SILHOUETTE}
          label={text.progress(placed, puzzle.size)}
        />
      </div>
      <Board
        size={puzzle.size}
        zones={puzzle.zones}
        marks={state.marks}
        renderCat={(index, pixelSize) => (
          <CatSprite
            palette={PALETTE}
            pixelSize={pixelSize}
            happy={index === state.lastCorrectCat}
          />
        )}
        cellLabel={text.cellLabel}
        label={text.board}
        onCellTap={(index) => dispatch({ type: 'tapCell', index })}
        onPlaceCat={(index) => dispatch({ type: 'placeCat', index })}
        onStroke={(mode, indices) =>
          dispatch({ type: 'strokeCells', mode, indices })
        }
      />
      {playing && (
        <div className="game-page-helps">
          {(['reveal', 'eraser'] as const).map((help) => {
            const cost = helpCost(help, puzzle, state.marks);
            return (
              <HelpButton
                key={help}
                name={text[help]}
                cost={cost}
                disabled={cost > coins}
                label={text.helpLabel(text[help], cost)}
                onUse={() => buyHelp(help)}
              />
            );
          })}
        </div>
      )}
      {state.status === 'won' && (
        <div className="game-page-end">
          <p className="game-page-status">{text.won}</p>
          <Button onClick={onNextLevel}>{text.nextLevel}</Button>
        </div>
      )}
      {state.status === 'lost' && (
        <div className="game-page-end">
          <p className="game-page-status">{text.lost}</p>
          <Button onClick={() => dispatch({ type: 'restart' })}>
            {text.retry}
          </Button>
        </div>
      )}
    </>
  );
}
