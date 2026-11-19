import { describe, expect, it } from 'vitest';
import { en } from './en';
import { pt } from './pt';

describe('generatedCatNames', () => {
  it('has one English name for each Portuguese one', () => {
    expect(en.generatedCatNames).toHaveLength(pt.generatedCatNames.length);
  });

  it('never repeats a name', () => {
    for (const names of [pt.generatedCatNames, en.generatedCatNames]) {
      expect(new Set(names).size).toBe(names.length);
    }
  });
});
