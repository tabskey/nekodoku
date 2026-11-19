import { describe, expect, it } from 'vitest';
import { catName } from './catName';
import { en } from './en';
import { pt } from './pt';

describe('catName', () => {
  it('keeps the named cats their own names', () => {
    expect(catName(pt, 'orange')).toBe('Caramelo');
    expect(catName(en, 'orange')).toBe('Caramel');
  });

  it('names generated cats from the list, in order, wrapping around', () => {
    expect(catName(pt, 'w4')).toBe('Pipoca');
    expect(catName(en, 'w5')).toBe('Cookie');
    expect(catName(pt, `w${4 + pt.generatedCatNames.length}`)).toBe('Pipoca');
  });
});

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
