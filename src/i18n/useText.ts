import { en } from './en';
import { pt, type Text } from './pt';

/**
 * The strings for the current language. Follows the device for now
 * (English if it asks for English, Portuguese otherwise).
 */
// shortcut: ignores options.language, which arrives with the Options screen
// in Phase 5; read it from the profile then.
export function useText(): Text {
  return navigator.language.toLowerCase().startsWith('en') ? en : pt;
}
