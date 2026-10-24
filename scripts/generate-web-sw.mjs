import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('dist');
const publicFiles = [];

// Keep the web app's own traffic same-origin. In particular, a later app code
// change cannot silently start sending coordinates to an external endpoint.
await writeFile(path.join(output, 'register-service-worker.js'), `if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Offline cache registration failed', error)));\n`);

async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await collect(absolute, relative);
    else if (relative !== 'sw.js') publicFiles.push(relative.replaceAll('\\', '/'));
  }
}

await collect(output);
publicFiles.sort();
const manifest = await Promise.all(publicFiles.map(async (file) => ({
  url: `/${file}`,
  revision: createHash('sha256').update(await readFile(path.join(output, file))).digest('hex'),
})));

// Compute a deterministic cache generation so a new deployment replaces old
// precached assets while retaining working offline behavior between releases.
const cacheVersion = createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 16);
const worker = `const CACHE_NAME = 'nightfall-${cacheVersion}';
const PRECACHE_URLS = ${JSON.stringify(publicFiles.map((file) => `/${file}`))};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('nightfall-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/')) || (await caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});
`;

await writeFile(path.join(output, 'sw.js'), worker);
const htmlPath = path.join(output, 'index.html');
let html = await readFile(htmlPath, 'utf8');
const headAdditions = `\n<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; form-action 'self'" />\n<link rel="manifest" href="/manifest.json" />\n<meta name="theme-color" content="#080d14" />\n<script src="/register-service-worker.js" defer></script>\n`;
if (!html.includes('rel="manifest"')) html = html.replace('</head>', `${headAdditions}</head>`);
await writeFile(htmlPath, html);
console.log(`Offline web cache generated for ${publicFiles.length} files (cache ${cacheVersion}).`);
