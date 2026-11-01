const CACHE_NAME = 'harry-portfolio-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/dock-nav.css',
    '/assets/dock-island/dock-island.css',
    '/assets/dock-island/dock-island.js',
    '/assets/js/script.js',
    '/assets/js/dock-nav.js',
    '/about.js',
    '/about.css',
    '/site.webmanifest',
    '/assets/img/profile.webp',
    '/assets/img/chillen.webp',
    '/assets/img/nss.webp',
    '/assets/img/IoT.webp',
    '/assets/img/pfp1.webp',
    '/assets/img/gym.webp',
    '/assets/img/tech.webp',
    'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Inter:wght@300;400;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    if (
        !url.startsWith(self.location.origin) &&
        !url.includes('fonts') &&
        !url.includes('cdn.jsdelivr')
    ) {
        return;
    }

    // HTML + app scripts: network-first so deploys show up immediately
    const isAppShell =
        event.request.mode === 'navigate' ||
        url.endsWith('/index.html') ||
        url.endsWith('/about.js') ||
        url.endsWith('/about.css') ||
        url.endsWith('/script.js') ||
        url.endsWith('/dock-nav.js') ||
        url.endsWith('/dock-nav.css') ||
        url.includes('/dock-island/');

    if (isAppShell) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
