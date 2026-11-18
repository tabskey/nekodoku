import { useReducer } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { CatSprite } from '../../components/atoms/CatSprite/CatSprite';
import {
  CAT_PALETTES,
  silhouettePalette,
} from '../../components/atoms/CatSprite/catSprites';
import { ProgressStrip } from '../../components/molecules/ProgressStrip/ProgressStrip';
import { Board } from '../../components/organisms/Board/Board';
import type { SolvedPuzzle } from '../../game/types';
import { useText } from '../../i18n/useText';
import { createLevel, levelReducer } from '../../state/levelReducer';
import { usePuzzle } from '../../state/usePuzzle';
import './GamePage.css';

// shortcut: always Mingau; the selected cat comes from the profile in Phase 6.
const PALETTE = CAT_PALETTES.white;
// SVG fill cannot read CSS variables, so the silhouette takes the text color.
const SILHOUETTE = silhouettePalette('currentColor');

interface GamePageProps {
  level: number;
  onNextLevel: () => void;
}

/** One level, from loading to solved. */
export function GamePage({ level, onNextLevel }: GamePageProps) {
  const text = useText();
  const puzzle = usePuzzle(level);

  return (
    <main className="game-page">
      <h1>{text.levelLabel(level)}</h1>
      {puzzle ? (
        <Level puzzle={puzzle} onNextLevel={onNextLevel} />
      ) : (
        <p className="game-page-status">{text.loading}</p>
      )}
    </main>
  );
}

function Level({
  puzzle,
  onNextLevel,
}: {
  puzzle: SolvedPuzzle;
  onNextLevel: () => void;
}) {
  const text = useText();
  const [state, dispatch] = useReducer(levelReducer, puzzle, createLevel);
  const placed = state.marks.filter((mark) => mark === 'cat').length;

  return (
    <>
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
        renderCat={(_, pixelSize) => (
          <CatSprite palette={PALETTE} pixelSize={pixelSize} />
        )}
        cellLabel={text.cellLabel}
        label={text.board}
        onCellTap={(index) => dispatch({ type: 'tapCell', index })}
        onPlaceCat={(index) => dispatch({ type: 'placeCat', index })}
        onStroke={(mode, indices) =>
          dispatch({ type: 'strokeCells', mode, indices })
        }
      />
      {state.status === 'won' && (
        <div className="game-page-won">
          <p className="game-page-status">{text.won}</p>
          <Button onClick={onNextLevel}>{text.nextLevel}</Button>
        </div>
      )}
    </>
  );
}
