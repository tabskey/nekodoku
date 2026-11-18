import { createContext, useContext } from 'react';
import { DEFAULT_OPTIONS, type Options } from './options';

export interface OptionsValue {
  options: Options;
  setOption: <K extends keyof Options>(key: K, value: Options[K]) => void;
}

export const OptionsContext = createContext<OptionsValue>({
  options: DEFAULT_OPTIONS,
  setOption: () => {},
});

/** The player's options and a setter. */
export function useOptions(): OptionsValue {
  return useContext(OptionsContext);
}
