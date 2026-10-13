// Cache dell'app per l'uso senza rete.
// Regola importante: la pagina principale e i file non "impronta" si chiedono SEMPRE prima alla rete (nell'app Android
// la "rete" è il pacchetto appena installato), così dopo un aggiornamento si vede subito la versione nuova.
// I file in /assets/ hanno il nome che cambia a ogni versione: quelli si possono tenere in cache.
const CACHE_NAME = 'che-cucino-oggi-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      const hadOldVersion = names.some((name) => name !== CACHE_NAME);
      await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
      await self.clients.claim();
      // Si arriva da una versione precedente che mostrava la pagina vecchia: si ricarica una volta sola per mostrare quella nuova
      if (hadOldVersion) {
        const windows = await self.clients.matchAll({ type: 'window' });
        windows.forEach((client) => client.navigate(client.url).catch(() => undefined));
      }
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;
  const url = new URL(request.url);
  // Il servizio dei pagamenti, l'accesso e le funzioni non passano dalla cache
  if (url.pathname.startsWith('/__/') || url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/assets/')) {
    // File con la versione nel nome: prima la cache, poi la rete
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Tutto il resto (pagina, manifest…): prima la rete; la cache serve solo se non c'è connessione
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html'))),
  );
});
