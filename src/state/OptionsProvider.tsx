import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_OPTIONS,
  resolveLanguage,
  resolveTheme,
  type Options,
} from './options';
import { OptionsContext, type OptionsValue } from './optionsContext';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * Holds the options and applies the ones that live on the page: the theme
 * (data-theme on <html>) and the language (lang on <html>).
 */
// shortcut: options live in memory and reset on reload; the Phase 6 profile
// saves them through src/storage.
export function OptionsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const setOption = useCallback(
    <K extends keyof Options>(key: K, value: Options[K]) => {
      setOptions((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  // Layout effects run before paint, so the page never flashes the wrong theme.
  useLayoutEffect(() => {
    const media = window.matchMedia(LIGHT_QUERY);
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(
        options.theme,
        media.matches,
      );
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [options.theme]);

  useLayoutEffect(() => {
    const language = resolveLanguage(options.language, navigator.language);
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
  }, [options.language]);

  const value = useMemo<OptionsValue>(
    () => ({ options, setOption }),
    [options, setOption],
  );
  return (
    <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>
  );
}
