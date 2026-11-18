import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { loadSave, writeSave } from '../storage/save';
import { resolveLanguage, resolveTheme } from './options';
import { ProfileContext, type ProfileValue } from './profileContext';
import { profileReducer } from './profileReducer';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * Loads the profile once, saves it after every change, and applies the
 * options that live on the page: the theme (data-theme) and the language
 * (lang), both on <html>.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(profileReducer, undefined, () =>
    loadSave(),
  );
  const { theme, language } = profile.options;

  // If storage is unavailable the write fails quietly and the game runs on.
  useEffect(() => {
    writeSave(profile);
  }, [profile]);

  // Layout effects run before paint, so the page never flashes the wrong theme.
  useLayoutEffect(() => {
    const media = window.matchMedia(LIGHT_QUERY);
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(
        theme,
        media.matches,
      );
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.lang =
      resolveLanguage(language, navigator.language) === 'en' ? 'en' : 'pt-BR';
  }, [language]);

  const value = useMemo<ProfileValue>(() => ({ profile, dispatch }), [profile]);
  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
