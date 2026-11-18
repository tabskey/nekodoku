import { useEffect } from 'react';

/**
 * Calls `onTick` once a second while `running` is true and the page is on
 * screen, so time spent with the app in the background does not count.
 */
export function useLevelTimer(running: boolean, onTick: () => void): void {
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) onTick();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, onTick]);
}
