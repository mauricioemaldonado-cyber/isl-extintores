/* Service worker ISL Extintores
 * - Cachea solo el "cascarón" de la app (HTML, logo, íconos) para que abra rápido
 *   y cumpla el requisito de instalación.
 * - Los datos (Apps Script) NUNCA se cachean: siempre van a la red, para que los
 *   vencimientos y estados sean los reales.
 * Al publicar una versión nueva de index.html, subir el número de CACHE_VERSION. */
const CACHE_VERSION = 'isl-ext-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo-isl.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Datos y librerías externas: directo a la red, sin cache
  if (url.origin !== self.location.origin) return;

  // Página principal: red primero (para ver siempre la última versión), cache si no hay conexión
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Resto de archivos propios (logo, íconos): cache primero
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
