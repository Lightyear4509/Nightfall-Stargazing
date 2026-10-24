import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(projectRoot, 'dist');
const workerSource = fs.readFileSync(path.join(distRoot, 'sw.js'), 'utf8');
const origin = 'https://stargazing.test';
const baseUrl = process.env.NIGHTFALL_WEB_BASE_URL?.replace(/\/+$/, '') ?? '';
assert.ok(!baseUrl || (baseUrl.startsWith('/') && !baseUrl.includes('..')), 'base URL is a safe absolute path prefix');
const appRootUrl = `${baseUrl}/`;
const cacheStore = new Map();
const listeners = new Map();
let networkAvailable = true;
let skippedWaiting = false;
let clientsClaimed = false;

function cacheKey(input) {
  const url = typeof input === 'string' ? new URL(input, origin) : new URL(input.url);
  return `${url.pathname}${url.search}`;
}

function makeCache(name) {
  const entries = new Map();
  return {
    name,
    async addAll(urls) {
      for (const url of urls) {
        const response = await networkFetch(new URL(url, origin).href);
        if (!response.ok) throw new Error(`Could not precache ${url}: ${response.status}`);
        entries.set(cacheKey(url), response.clone());
      }
    },
    async put(request, response) { entries.set(cacheKey(request), response.clone()); },
    async match(request) { return entries.get(cacheKey(request))?.clone(); },
  };
}

async function networkFetch(input) {
  if (!networkAvailable) throw new TypeError('Network is offline');
  const url = new URL(typeof input === 'string' ? input : input.url, origin);
  let requestPath = decodeURIComponent(url.pathname);
  if (baseUrl) {
    if (requestPath === baseUrl) requestPath = '/';
    else if (requestPath.startsWith(`${baseUrl}/`)) requestPath = requestPath.slice(baseUrl.length);
    else return new Response('Not found', { status: 404 });
  }
  const relative = requestPath.replace(/^\/+/, '') || 'index.html';
  const absolute = path.resolve(distRoot, relative);
  if (!absolute.startsWith(`${distRoot}${path.sep}`) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(fs.readFileSync(absolute), { status: 200, headers: { 'Content-Type': 'application/octet-stream' } });
}

const caches = {
  async open(name) {
    if (!cacheStore.has(name)) cacheStore.set(name, makeCache(name));
    return cacheStore.get(name);
  },
  async keys() { return [...cacheStore.keys()]; },
  async delete(name) { return cacheStore.delete(name); },
  async match(request) {
    for (const cache of cacheStore.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return undefined;
  },
};
cacheStore.set('nightfall-stale', makeCache('nightfall-stale'));
cacheStore.set('unrelated-cache', makeCache('unrelated-cache'));

const self = {
  location: { origin },
  clients: { async claim() { clientsClaimed = true; } },
  async skipWaiting() { skippedWaiting = true; },
  addEventListener(type, listener) { listeners.set(type, listener); },
};
const context = { caches, fetch: networkFetch, self, URL, Request, Response, TypeError };
const workerMetadata = vm.runInNewContext(`${workerSource}\n;({ CACHE_NAME, PRECACHE_URLS })`, context);
assert.ok(workerMetadata.CACHE_NAME.startsWith('nightfall-'), 'worker uses a versioned app cache');
assert.ok(workerMetadata.PRECACHE_URLS.includes(`${baseUrl}/index.html`), 'precache includes the app entry page under the configured base URL');
const exportedHtml = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8');
assert.match(exportedHtml, /http-equiv="Content-Security-Policy"[^>]*connect-src 'self'/, 'web page restricts outbound connections to its own origin');
assert.doesNotMatch(exportedHtml, /<script>(?!\s*\/>)/, 'web page does not need inline scripts under the restrictive script policy');
assert.ok(exportedHtml.includes(`${baseUrl}/manifest.json`), 'web page links to its manifest under the configured base URL');
const exportedManifest = JSON.parse(fs.readFileSync(path.join(distRoot, 'manifest.json'), 'utf8'));
assert.equal(exportedManifest.start_url, appRootUrl, 'PWA start URL matches the configured base URL');
assert.equal(exportedManifest.scope, appRootUrl, 'PWA scope matches the configured base URL');

let installPromise;
listeners.get('install')({ waitUntil(promise) { installPromise = promise; } });
await installPromise;
assert.equal(skippedWaiting, true, 'installed worker activates without waiting for an old tab');
const appCache = cacheStore.get(workerMetadata.CACHE_NAME);
assert.ok(appCache, 'install creates the versioned cache');
for (const url of workerMetadata.PRECACHE_URLS) assert.ok(await appCache.match(url), `precache contains ${url}`);

let activatePromise;
listeners.get('activate')({ waitUntil(promise) { activatePromise = promise; } });
await activatePromise;
assert.equal(clientsClaimed, true, 'activated worker claims existing tabs');
assert.equal(cacheStore.has('nightfall-stale'), false, 'activation deletes stale app caches');
assert.equal(cacheStore.has('unrelated-cache'), true, 'activation leaves unrelated caches intact');

networkAvailable = false;
let navigationResponse;
listeners.get('fetch')({
  request: { method: 'GET', mode: 'navigate', url: `${origin}${appRootUrl}?offline-check=1` },
  respondWith(promise) { navigationResponse = promise; },
});
const offlinePage = await navigationResponse;
assert.equal(offlinePage.status, 200, 'offline navigation falls back to the cached app page');
assert.match(await offlinePage.text(), /<html/i, 'offline fallback serves HTML');

const bundleUrl = workerMetadata.PRECACHE_URLS.find((url) => url.endsWith('.js'));
assert.ok(bundleUrl, 'precache includes the JavaScript bundle');
let assetResponse;
listeners.get('fetch')({
  request: { method: 'GET', mode: 'cors', url: `${origin}${bundleUrl}` },
  respondWith(promise) { assetResponse = promise; },
});
const offlineBundle = await assetResponse;
assert.equal(offlineBundle.status, 200, 'offline asset request is served from the precache');
assert.ok((await offlineBundle.text()).length > 1000, 'cached bundle contains application code');

console.log(`Offline service-worker checks passed for ${workerMetadata.PRECACHE_URLS.length} precached files (${workerMetadata.CACHE_NAME}).`);
