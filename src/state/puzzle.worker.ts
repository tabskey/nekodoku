// Generates a level's puzzle off the main thread, so large boards never
// freeze the interface. Receives a level number, posts back its SolvedPuzzle.
import { generatePuzzle } from '../game/generator';

self.onmessage = (event: MessageEvent<number>) => {
  self.postMessage(generatePuzzle(event.data));
};
