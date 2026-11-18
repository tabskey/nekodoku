import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import { CurrencyBadge } from '../../components/atoms/CurrencyBadge/CurrencyBadge';
import {
  catPalette,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { HelpButton } from '../../components/molecules/HelpButton/HelpButton';
import { HudBar } from '../../components/molecules/HudBar/HudBar';
import { ProgressStrip } from '../../components/molecules/ProgressStrip/ProgressStrip';
import { Board } from '../../components/organisms/Board/Board';
import { RulesPopover } from '../../components/organisms/RulesPopover/RulesPopover';
import { helpCost, type Help } from '../../game/helps';
import { levelConfig, startingCatCells } from '../../game/progression';
import type { Reward } from '../../game/rewards';
import { LIVES_PER_LEVEL } from '../../game/scoring';
import type { SolvedPuzzle } from '../../game/types';
import { useText } from '../../i18n/useText';
import { createLevel, levelReducer } from '../../state/levelReducer';
import { useLevelTimer } from '../../state/useLevelTimer';
import { useOptions, useProfile } from '../../state/profileContext';
import { usePuzzle } from '../../state/usePuzzle';
import './GamePage.css';

// SVG fill cannot read CSS variables, so the silhouette takes the text color.
const SILHOUETTE = silhouettePalette('currentColor');

interface GamePageProps {
  level: number;
  coins: number;
  onSpendCoins: (amount: number) => void;
  /** Called once when the level is won, with the final score and time. */
  onCleared: (score: number, seconds: number) => void;
  /** What the win paid, once the profile has it. */
  reward?: Reward;
  onNextLevel: () => void;
  onOpenMenu: () => void;
}

type LevelProps = Omit<GamePageProps, 'level' | 'onOpenMenu'> & {
  puzzle: SolvedPuzzle;
  /** Cells that open with a fixed, correct cat. */
  givens: number[];
};

const HELP_ACTIONS = { reveal: 'useReveal', eraser: 'useEraser' } as const;

/** One level, from loading to solved. */
export function GamePage({ level, onOpenMenu, ...levelProps }: GamePageProps) {
  const text = useText();
  const puzzle = usePuzzle(level);
  const { world, levelInWorld, isBoss, startingCats } = levelConfig(level);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className="game-page">
      <header className="game-page-header">
        <button
          type="button"
          className="game-page-icon-button game-page-menu"
          aria-label={text.menuButton}
          onClick={onOpenMenu}
        >
          &lt;
        </button>
        <div>
          <p className="game-page-world">{text.worldLabel(world)}</p>
          <h1>{isBoss ? text.boss : text.levelLabel(levelInWorld)}</h1>
        </div>
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
        <Level
          puzzle={puzzle}
          givens={startingCatCells(puzzle, startingCats, level)}
          {...levelProps}
        />
      ) : (
        <p className="game-page-status">{text.loading}</p>
      )}
    </main>
  );
}

function Level({
  puzzle,
  givens,
  coins,
  onSpendCoins,
  onCleared,
  onNextLevel,
  reward,
}: LevelProps) {
  const text = useText();
  const { options } = useOptions();
  const palette = catPalette(useProfile().profile.selectedCat);
  // Auto-mark is read once, when the level starts; changing it means leaving
  // the level, which starts it again.
  const [state, dispatch] = useReducer(levelReducer, puzzle, (p) =>
    createLevel(p, options.autoMark, givens),
  );
  const tick = useCallback(() => dispatch({ type: 'tick' }), []);
  useLevelTimer(state.status === 'playing', tick);
  const placed = state.marks.filter((mark) => mark === 'cat').length;
  const playing = state.status === 'playing';

  // Report the win to the profile exactly once, even if this re-renders.
  const reported = useRef(false);
  useEffect(() => {
    if (state.status !== 'won' || reported.current) return;
    reported.current = true;
    onCleared(state.score, state.elapsedSeconds);
  }, [state.status, state.score, state.elapsedSeconds, onCleared]);

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
          palette={palette}
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
            palette={palette}
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
          <p className="game-page-score">{text.finalScore(state.score)}</p>
          {reward && <RewardLine reward={reward} />}
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

function RewardLine({ reward }: { reward: Reward }) {
  const text = useText();
  if (reward.coins === 0 && reward.fish === 0) {
    return <p className="game-page-status">{text.noReward}</p>;
  }
  return (
    <p
      className="game-page-reward"
      role="img"
      aria-label={text.reward(reward.coins, reward.fish)}
    >
      <CurrencyBadge amount={reward.coins} prefix="+" />
      {reward.fish > 0 && (
        <CurrencyBadge amount={reward.fish} currency="fish" prefix="+" />
      )}
    </p>
  );
}
