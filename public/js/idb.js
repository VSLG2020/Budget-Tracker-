// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `newBudgetEntry`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('newBudgetEntry', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadAction() function to send all local db data to api
    if (navigator.onLine) {
        
        uploadAction();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['newBudgetEntry'], 'readwrite');

    // access the object store for `newBudgetEntry`
    const storeEntry = transaction.objectStore('newBudgetEntry');

    // add record to your store with add method
    storeEntry.add(record);
}

// Create a function that will handle collecting all of the data from the newBudgetEntry object store in IndexedDB and POST it to the server
function uploadAction() {
    // Open a new transaction to the database to read the data.
    const transaction = db.transaction(['newBudgetEntry'], 'readwrite');

    // access object store
    const storeEntry = transaction.objectStore('newBudgetEntry');

    // Get all records from store and set to variable
    const getAll = storeEntry.getAll();


    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['newBudgetEntry'], 'readwrite');
                    // access the newBudgetEntry object store
                    const storeEntry = transaction.objectStore('newBudgetEntry');
                    // clear all items in your store
                    storeEntry.clear();

                    alert('All saved transaction has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

// listen for app coming back online
// window.addEventListener('online', uploadPizza);
// Listen for if the app comes back online
window.addEventListener('online', uploadAction);
