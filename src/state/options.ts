// Resolving the 'system' options to what the page shows. The options
// themselves are part of the saved profile (src/storage/save.ts).
import type { Options } from '../storage/save';

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
