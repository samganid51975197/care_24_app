const CACHE_NAME = "pcec-static-v2";
const CACHE_PREFIX = "pcec-static-";
const SHELL = ["./index.html", "./manifest.webmanifest", "./app-icon.svg", "./home-course-catalog.js"];
const PRIVATE_PATH = /(?:^|\/)(?:api|admin|exam-applicants|exam-roster|exam-enrollment|exam-operations|practicum-admin|practicum-submit|certificate-admin|certificate-verify)(?:\/|\.|$)/i;
const LARGE_FILE = /\.(?:mp4|webm|pdf|mp3|wav|ogg|m4a|aac)$/i;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

async function storePublicResponse(cache, request, response) {
  if (!response.ok || response.type === "opaque") return response;
  const contentType = response.headers.get("content-type") || "";
  if (/video\/|audio\/|application\/pdf/i.test(contentType)) return response;
  await cache.put(request, response.clone());
  const entries = await cache.keys();
  if (entries.length > 120) await cache.delete(entries[0]);
  return response;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search || PRIVATE_PATH.test(url.pathname) || LARGE_FILE.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(async response => {
      const cache = await caches.open(CACHE_NAME);
      return storePublicResponse(cache, request, response);
    }).catch(async () => (await caches.match(request)) || caches.match(new URL("./index.html", self.registration.scope))));
    return;
  }

  if (!/^(?:script|style|image|font|manifest)$/.test(request.destination)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(async response => {
    const cache = await caches.open(CACHE_NAME);
    return storePublicResponse(cache, request, response);
  })));
});

