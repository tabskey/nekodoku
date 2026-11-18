import { describe, expect, it } from 'vitest';
import { resolveLanguage, resolveTheme } from './options';

describe('resolveLanguage', () => {
  it('uses the chosen language over the device', () => {
    expect(resolveLanguage('en', 'pt-BR')).toBe('en');
    expect(resolveLanguage('pt', 'en-US')).toBe('pt');
  });

  it('follows the device, falling back to Portuguese', () => {
    expect(resolveLanguage('system', 'en-US')).toBe('en');
    expect(resolveLanguage('system', 'pt-BR')).toBe('pt');
    expect(resolveLanguage('system', 'fr-FR')).toBe('pt');
  });
});

describe('resolveTheme', () => {
  it('uses the chosen mode over the device', () => {
    expect(resolveTheme('dark', true)).toBe('dark');
    expect(resolveTheme('light', false)).toBe('light');
  });

  it('follows the device', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
  });
});
