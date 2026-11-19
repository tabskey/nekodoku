// Service worker: caches every built file on install so the game runs offline.
// The build plugin in vite.config.ts fills in CACHE and FILES; see "Offline" in
// docs/ARCHITECTURE.md.
const CACHE = '__CACHE__';
const FILES = __FILES__;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

// No skipWaiting on its own: a new version takes over only once every open
// copy of the game is closed, so a running game never loses the chunks it was
// built with. The page can ask for it earlier, from Options, outside a level.
self.addEventListener('message', (event) => {
  // Only pages of this site can ask; check where the message came from.
  if (event.origin !== self.location.origin) return;
  if (event.data === 'skip') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true })
      .then((hit) => hit ?? fetch(event.request)),
  );
});
