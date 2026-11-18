

/* CONSTANTES DE ALMACENAMIENTO CACHE */
const CACHE = 'cache-3';
const CACHE_DINAMICO = 'dinamico-2';
const CACHE_ESTATICO = 'estatico-2';
const CACHE_INMUTABLE = 'inmutable-2';


/**************** INSTALACIÓN ****************/

self.addEventListener('install', evento => {

    const cacheBase = caches.open(CACHE)
        .then(cache => {
            return cache.addAll([
                './',
                './index.html',
                './manifest.json',
                './css/style.css',
                './img/main.jpg',
                './js/app.js',
                './pages/offline.html',
                './pages/pagina2.html',
                './img/sketch-192x192.png',
                './img/sketch-512x512.png'
            ]);
        });

    const cacheInmutable = caches.open(CACHE_INMUTABLE)
        .then(cache => {
            return cache.add(
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            );
        });

    evento.waitUntil(
        Promise.all([cacheBase, cacheInmutable])
    );

});


/**************** ACTIVACIÓN ****************/

self.addEventListener('activate', evento => {

    const cachePermitidos = [
        CACHE,
        CACHE_DINAMICO,
        CACHE_ESTATICO,
        CACHE_INMUTABLE
    ];

    evento.waitUntil(
        caches.keys().then(nombresCache => {
            return Promise.all(
                nombresCache.map(nombre => {
                    if (!cachePermitidos.includes(nombre)) {
                        return caches.delete(nombre);
                    }
                })
            );
        })
    );

});


/**************** LIMPIEZA DE CACHE ****************/

function limpiarCache(nombreCache, numeroItems) {

    return caches.open(nombreCache)
        .then(cache => {

            return cache.keys()
                .then(keys => {

                    if (keys.length > numeroItems) {

                        return cache.delete(keys[0])
                            .then(() => {
                                return limpiarCache(nombreCache, numeroItems);
                            });
                    }

                });
        });
}


/**************** ESTRATEGIA 2 ****************/
/* CACHE WITH NETWORK FALLBACK */

self.addEventListener('fetch', evento => {

    if (evento.request.method !== 'GET') return;

    const respuesta = caches.match(evento.request)
        .then(res => {

            if (res) return res;

            return fetch(evento.request)
                .then(resWeb => {

                    if (!resWeb || !resWeb.ok) {
                        return resWeb;
                    }

                    return caches.open(CACHE_DINAMICO)
                        .then(cache => {

                            cache.put(
                                evento.request,
                                resWeb.clone()
                            );

                            limpiarCache(CACHE_DINAMICO, 20);

                            return resWeb;
                        });
                });

        })
        .catch(err => {

            if (
                evento.request.headers.get('accept') &&
                evento.request.headers.get('accept').includes('text/html')
            ) {
                return caches.match('./pages/offline.html');
            }

            throw err;
        });

    evento.respondWith(respuesta);

});
