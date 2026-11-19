import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import {
  catPalette,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { PixelIcon } from '../../components/atoms/PixelIcon/PixelIcon';
import { Scenery } from '../../components/atoms/Scenery/Scenery';
import { bossScenery } from '../../components/atoms/Scenery/sceneries';
import ghostUrl from '../../assets/ghost-cat.svg';
import { worldScene } from '../../game/biomes';
import { HelpButton } from '../../components/molecules/HelpButton/HelpButton';
import { HudBar } from '../../components/molecules/HudBar/HudBar';
import { ProgressStrip } from '../../components/molecules/ProgressStrip/ProgressStrip';
import { Board } from '../../components/organisms/Board/Board';
import { OptionsPage } from '../OptionsPage/OptionsPage';
import { useLevelAudio } from './useLevelAudio';
import type { ClearSummaryProps } from '../../components/molecules/ClearSummary/ClearSummary';
import { WinOverlay } from '../../components/organisms/WinOverlay/WinOverlay';
import { LostOverlay } from '../../components/organisms/LostOverlay/LostOverlay';
import { Restoration } from '../../components/organisms/Restoration/Restoration';
import { RulesPopover } from '../../components/organisms/RulesPopover/RulesPopover';
import { helpCost, type Help } from '../../game/helps';
import {
  levelConfig,
  startingCatCells,
  worldCat,
} from '../../game/progression';
import { STREAK_STEPS, type Reward } from '../../game/rewards';
import { LIVES_PER_LEVEL } from '../../game/scoring';
import type { SolvedPuzzle } from '../../game/types';
import { formatTime } from '../../i18n/formatTime';
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
  /** The part of `reward` that came from the win streak. */
  bonus?: Reward;
  /** The win streak after the win, the bonus it paid and whether it is the most. */
  streak?: { count: number; percent: number; max: boolean };
  /** Called once when the level is lost: the win streak starts over. */
  onLost: () => void;
  onNextLevel: () => void;
  onOpenMenu: () => void;
  /** Leaves the level for the world map, after a Boss's restoration. */
  onOpenMap: () => void;
}

type LevelProps = Omit<GamePageProps, 'level' | 'onOpenMenu'> & {
  /** Stops the timer, e.g. while Options is open over the level. */
  paused: boolean;
  /** Set on a Boss level: the world whose scenery and ghost to show. */
  bossWorld?: number;
  /** Plays the restoration on a win: the Boss is beaten for the first time. */
  restores: boolean;
  puzzle: SolvedPuzzle;
  /** Cells that open with a fixed, correct cat. */
  givens: number[];
};

const HELP_ACTIONS = { reveal: 'useReveal', eraser: 'useEraser' } as const;
const ZOOM_FROM_SIZE = 10;

// Placeholder 9x9 pixel icons, drawn at 2x by PixelIcon: the Options gear
// and the zoom magnifier, whose lens holds a + or a - (v marks the + only).
const GEAR = [
  '...ooo...',
  '.o.ooo.o.',
  '..ooooo..',
  'oooo.oooo',
  'ooo...ooo',
  'oooo.oooo',
  '..ooooo..',
  '.o.ooo.o.',
  '...ooo...',
];
const MAGNIFIER = [
  '.ooooo...',
  'o.....o..',
  'o..v..o..',
  'o.ooo.o..',
  'o..v..o..',
  'o.....o..',
  '.oooooo..',
  '......oo.',
  '.......oo',
];

/** One level, from loading to solved. */
export function GamePage({ level, onOpenMenu, ...levelProps }: GamePageProps) {
  const text = useText();
  const puzzle = usePuzzle(level);
  const { world, levelInWorld, isBoss, startingCats } = levelConfig(level);
  const [rulesOpen, setRulesOpen] = useState(false);
  // Options opens over the level, which stays mounted underneath: a level in
  // progress is never saved, so leaving it would lose it.
  const [optionsOpen, setOptionsOpen] = useState(false);
  // Read once: winning updates the profile, but the restoration still plays.
  const { profile } = useProfile();
  const [firstClear] = useState(() => level > profile.levelsCleared);

  return (
    <>
      {optionsOpen && (
        <OptionsPage onBack={() => setOptionsOpen(false)} inLevel />
      )}
      <main className="game-page" hidden={optionsOpen}>
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
          <button
            type="button"
            className="game-page-icon-button game-page-menu"
            aria-label={text.optionsButton}
            onClick={() => setOptionsOpen(true)}
          >
            <PixelIcon rows={GEAR} pixelSize={2} />
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
            paused={optionsOpen}
            bossWorld={isBoss ? world : undefined}
            restores={isBoss && firstClear}
            {...levelProps}
          />
        ) : (
          <p className="game-page-status">{text.loading}</p>
        )}
      </main>
    </>
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
  bonus,
  streak,
  onLost,
  paused,
  bossWorld,
  restores,
  onOpenMap,
}: LevelProps) {
  const text = useText();
  const { options } = useOptions();
  const palette = catPalette(useProfile().profile.selectedCat);
  // Auto-mark starts as the option says, and follows it if it changes in
  // Options mid-level (see the effect below).
  const [state, dispatch] = useReducer(levelReducer, puzzle, (p) =>
    createLevel(p, options.autoMark, givens),
  );
  const tick = useCallback(() => dispatch({ type: 'tick' }), []);
  // Nothing happens on the first run: the reducer sees an unchanged setting.
  useEffect(() => {
    dispatch({ type: 'setAutoMark', autoMark: options.autoMark });
  }, [options.autoMark]);
  useLevelTimer(state.status === 'playing' && !paused, tick);
  const placed = state.marks.filter((mark) => mark === 'cat').length;
  // 10x10 and up: cells are too small to tap, so the board can zoom in.
  const canZoom = puzzle.size >= ZOOM_FROM_SIZE;
  const [zoomed, setZoomed] = useState(false);
  const playing = state.status === 'playing';
  // A different message from time to time: the clock stops at the end of the
  // level, so it is steady while the message is shown, and needs no random
  // number.
  const lostMessage =
    text.lostMessages[state.elapsedSeconds % text.lostMessages.length];
  const wonMessage =
    text.wonMessages[state.elapsedSeconds % text.wonMessages.length];
  const audio = useLevelAudio(state, {
    music: options.music,
    boss: bossWorld !== undefined,
    restoring: state.status === 'won' && restores,
  });

  // What the clear paid and the win streak, shown on the win screen and on
  // the Boss restoration once the profile has them.
  const summary: ClearSummaryProps | undefined =
    reward && streak
      ? {
          coins: reward.coins - (bonus?.coins ?? 0),
          coinsBonus: bonus?.coins ?? 0,
          fish: reward.fish - (bonus?.fish ?? 0),
          fishBonus: bonus?.fish ?? 0,
          rewardLabel: text.reward(reward.coins, reward.fish),
          noReward: text.noReward,
          streak: {
            count: streak.count,
            steps: STREAK_STEPS.map((step) => ({
              wins: step.wins,
              label: text.streakStep(step.percent),
            })),
            label: text.streakLabel(streak.count, streak.percent),
            banner: text.streakBanner(streak.count, streak.percent, streak.max),
          },
        }
      : undefined;

  // Report a loss once too, so the win streak starts over; trying again and
  // losing again is a new loss.
  const lossReported = useRef(false);
  useEffect(() => {
    if (state.status !== 'lost') {
      lossReported.current = false;
      return;
    }
    if (lossReported.current) return;
    lossReported.current = true;
    onLost();
  }, [state.status, onLost]);

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
    const action = { type: HELP_ACTIONS[help] } as const;
    audio.playHelp(levelReducer(state, action) !== state);
    dispatch(action);
  }

  return (
    <>
      {bossWorld !== undefined && (
        <BossStrip world={bossWorld} won={state.status === 'won'} />
      )}
      <HudBar
        lives={state.lives}
        maxLives={LIVES_PER_LEVEL}
        score={state.score}
        time={formatTime(state.elapsedSeconds)}
        livesLabel={text.lives(state.lives)}
        scoreLabel={text.score(state.score)}
        timeLabel={text.time(
          Math.floor(state.elapsedSeconds / 60),
          state.elapsedSeconds % 60,
        )}
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
        zoomed={canZoom && zoomed}
        // Lives drop by one per mistake, so they tell mistakes apart.
        shake={
          state.lastMistake === undefined
            ? undefined
            : { index: state.lastMistake, id: state.lives }
        }
        celebrate={state.status === 'won'}
      />
      {canZoom && zoomed && <p className="game-page-hint">{text.zoomHint}</p>}
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
          {canZoom && (
            <button
              type="button"
              className="help-button"
              aria-label={zoomed ? text.zoomOut : text.zoomIn}
              aria-pressed={zoomed}
              onClick={() => setZoomed((z) => !z)}
            >
              <PixelIcon
                rows={MAGNIFIER}
                pixelSize={2}
                drawn={zoomed ? 'o' : 'ov'}
              />
            </button>
          )}
        </div>
      )}
      {state.status === 'won' && restores && bossWorld !== undefined && (
        <Restoration
          palette={catPalette(worldCat(bossWorld))}
          name={text.catNames[worldCat(bossWorld)]}
          title={text.restoredTitle}
          message={text.restoredMessage(bossWorld)}
          yay={text.restoredYay}
          summary={summary}
          catLabel={text.restoredCatLabel(text.catNames[worldCat(bossWorld)])}
          backLabel={text.backToMap}
          replayLabel={text.replayRestoration}
          onBack={onOpenMap}
          onReplay={audio.replayRestoration}
        />
      )}
      {state.status === 'won' && !restores && summary && (
        <WinOverlay
          title={wonMessage.title}
          line={wonMessage.line}
          score={text.finalScore(state.score)}
          summary={summary}
          nextLabel={text.nextLevel}
          onNext={onNextLevel}
        />
      )}
      {state.status === 'lost' && (
        <LostOverlay
          title={lostMessage.title}
          line={lostMessage.line}
          retryLabel={text.retry}
          onRetry={() => dispatch({ type: 'restart' })}
        />
      )}
    </>
  );
}

/** The Boss's scenery, with the ghost waiting until the level is won. */
function BossStrip({ world, won }: { world: number; won: boolean }) {
  const text = useText();
  const { rows, palette } = bossScenery(world, worldScene(world).time);
  return (
    <div className="game-page-scenery" role="img" aria-label={text.bossScene}>
      <Scenery rows={rows} palette={palette} />
      <span className="game-page-scenery-ghost">
        {won ? (
          <CatSprite palette={catPalette(worldCat(world))} />
        ) : (
          // 12x14 sprite at 4x.
          <img src={ghostUrl} width={48} height={56} alt="" draggable={false} />
        )}
      </span>
    </div>
  );
}
