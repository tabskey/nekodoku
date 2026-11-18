// Player options. Same shape as SaveData.options in docs/ARCHITECTURE.md,
// so the Phase 6 profile can take them over unchanged.

export interface Options {
  autoMark: boolean;
  theme: 'system' | 'light' | 'dark';
  language: 'system' | 'pt' | 'en';
  sound: boolean;
}

export const DEFAULT_OPTIONS: Options = {
  autoMark: false,
  theme: 'system',
  language: 'system',
  sound: true,
};

/** The language to show. 'system' follows the device, falling back to Portuguese. */
export function resolveLanguage(
  language: Options['language'],
  deviceLanguage: string,
): 'pt' | 'en' {
  if (language !== 'system') return language;
  return deviceLanguage.toLowerCase().startsWith('en') ? 'en' : 'pt';
}

/** The theme to show. 'system' follows the device's light or dark setting. */
export function resolveTheme(
  theme: Options['theme'],
  deviceIsLight: boolean,
): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return deviceIsLight ? 'light' : 'dark';
}
