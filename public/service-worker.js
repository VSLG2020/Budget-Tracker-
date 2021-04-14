// const APP_PREFIX = 'FoodFest-';     
// const VERSION = 'version_01';
// const CACHE_NAME = APP_PREFIX + VERSION;
const CACHE_NAME = 'budget_tracker';
const VERSION = 'version_01';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    '/manifest.json',
    "/js/index.js",
    "/css/styles.css",
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', function (e) {

})

//Add the event waitUntil() function shown in the following code as the callback function of the install event listener:

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Activate service worker and delete old data from cache
self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        let cacheKeeplist = keyList.filter(function (key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function (key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
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
