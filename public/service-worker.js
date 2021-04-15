// const APP_PREFIX = 'FoodFest-';     
// const VERSION = 'version_01';
// const CACHE_NAME = APP_PREFIX + VERSION;
const CACHE_NAME = 'budget_tracker';
const VERSION = 'version_01';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "./js/idb.js",
    "/css/styles.css"
   
];


//Add the event waitUntil() function shown in the following code as the callback function of the install event listener:

self.addEventListener('install', function (event) {
    console.log('Service worker activate event!');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  
})

// Activate service worker and delete old data from cache
// Activate Service-Worker
self.addEventListener('activate', function (event) {
    event.waitUntil (
        caches.keys().then(keyList => {
            return Promise.all (
                keyList.map(key => {
                    if (CACHE_NAME.indexOf(VERSION) === -1) {
                        console.log('Deleting old' + CACHE_NAME + 'cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

  // get fetch requests
  self.addEventListener('fetch', function (event) {
    
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches
        .open(VERSION)
        .then(cache => {
            return fetch(event.request)
              .then(response => {
                if (response.status === 200){
                  cache.put(event.request.url, response.clone())
                }
                return response
              })
              .catch(err => {
                return cache.match(event.request); 
              })
          })
          .catch(err => console.log(err))
      ) 
      return;
    }
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else if (event.request.headers.get('accept').includes('text/html')) {
                    // return the cached home page for all requests for html pages
                    return caches.match('/');
                }
            });
        })
    );
});
