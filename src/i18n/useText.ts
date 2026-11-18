import { resolveLanguage } from '../state/options';
import { useOptions } from '../state/optionsContext';
import { en } from './en';
import { pt, type Text } from './pt';

/** The strings for the language chosen in Options, or the device's. */
export function useText(): Text {
  const { options } = useOptions();
  return resolveLanguage(options.language, navigator.language) === 'en'
    ? en
    : pt;
}
