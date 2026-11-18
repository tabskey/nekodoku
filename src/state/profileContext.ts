import { createContext, useContext, type Dispatch } from 'react';
import { defaultSave, type Options, type SaveData } from '../storage/save';
import type { ProfileAction } from './profileReducer';

export interface ProfileValue {
  profile: SaveData;
  dispatch: Dispatch<ProfileAction>;
}

export const ProfileContext = createContext<ProfileValue>({
  profile: defaultSave(),
  dispatch: () => {},
});

/** The saved profile and its dispatch. */
export function useProfile(): ProfileValue {
  return useContext(ProfileContext);
}

/** The player's options and a setter, from the profile. */
export function useOptions(): {
  options: Options;
  setOption: <K extends keyof Options>(key: K, value: Options[K]) => void;
} {
  const { profile, dispatch } = useProfile();
  return {
    options: profile.options,
    setOption: (key, value) =>
      dispatch({ type: 'setOption', key, value } as ProfileAction),
  };
}
