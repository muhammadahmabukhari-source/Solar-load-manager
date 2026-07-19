// Solar Load Manager - minimal service worker
// Purpose: satisfies the "has a service worker" requirement for the browser
// to treat this as an installable PWA (custom icon + splash screen on
// Add to Home Screen, true full-screen standalone mode on Android), and
// caches the app shell so the UI still loads instantly even on a flaky
// connection. Live data always comes fresh from Firebase over the network -
// this does NOT cache or work offline for live readings, only the app's
// own HTML/CSS/JS shell.

const CACHE_NAME = 'solar-load-manager-v2';
const APP_SHELL = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for everything (this is a live-data app); fall back to
  // cached app shell only if the network request fails (e.g. briefly offline).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
