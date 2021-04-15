// const APP_PREFIX = 'FoodFest-';     
// const VERSION = 'version_01';
// const CACHE_NAME = APP_PREFIX + VERSION;
const APP_PREFIX = 'budget_tracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// list of files we will be caching
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./js/index.js",
    "./js/idb.js",
    "./css/styles.css",
    "./icons/icon-192x192.png"

]
//Add the event waitUntil() function shown in the following code as the callback function of the install event listener:
// install the service worker
self.addEventListener('install', function (event) {
    //console.log('Service worker activate event!');
    event.waitUntil(
        // find a specific cache by name then add every file in the FILES_TO_CACHE array to the cache
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache: ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

// Activate service worker and delete old data from cache
// Activate Service-Worker
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keyList) {
            let keepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            keepList.push(CACHE_NAME);
            return Promise.all(
                keyList.map(function (key, i) {
                    if (keepList.indexOf(key) === -1) {
                        console.log('Deleting old :' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
})
// get fetch requests
self.addEventListener('fetch', function (event) {

    event.respondWith(

        caches
            .match(event.request)
            .then(function (request) {

                if (request) {
                    return request;
                } else {

                    console.log('file is not cached, fetching: ' + event.request.url)
                    return fetch(event.request)
                }
            })
    )
})