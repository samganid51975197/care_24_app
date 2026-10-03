// Authenticated pages and API responses must never be retained by the PWA cache.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('care24-')).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
