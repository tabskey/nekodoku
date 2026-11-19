// Updating the installed game. A new version of the service worker waits until
// every window of the app is closed, which on a phone can take weeks. So the
// page notices a waiting version and lets the player take it, when they choose
// (see "Offline" in docs/ARCHITECTURE.md).
import { useSyncExternalStore } from 'react';

let waiting: ServiceWorker | undefined;
// Set when the player asked for the update, so only that change reloads the
// page; the first install also changes the controller, and must not.
let updating = false;
const listeners = new Set<() => void>();

function setWaiting(worker: ServiceWorker) {
  waiting = worker;
  listeners.forEach((listener) => listener());
}

/** Registers the service worker and watches for a new version waiting. */
export function registerServiceWorker() {
  // Production only: in dev the worker would cache stale modules.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .then((registration) => {
      // A version already waiting when the page opens, behind a running one.
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
      }
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (
            installing.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setWaiting(installing);
          }
        });
      });
    })
    .catch(() => {
      // No offline mode, but the game itself still runs.
    });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updating) location.reload();
  });
}

/** Lets the waiting version take over; the page reloads when it has. */
export function applyUpdate() {
  if (!waiting) return;
  updating = true;
  waiting.postMessage('skip');
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True while a new version of the game is ready to take over. */
export function useUpdateReady(): boolean {
  return useSyncExternalStore(subscribe, () => waiting !== undefined);
}
