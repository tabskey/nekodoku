import { catLook } from '../game/progression';
import type { Text } from './pt';

/** The name of the cat with a saved id: its own, or one from the generated list. */
export function catName(text: Text, id: string): string {
  const { generated } = catLook(id);
  if (generated === undefined) return text.catNames[id] ?? id;
  const names = text.generatedCatNames;
  return names[generated % names.length];
}
