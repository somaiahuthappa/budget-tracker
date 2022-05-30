// variable to hold db connection
let db;
// connect to IndexedDb database
const request = indexedDB.open('budget_tracker_db', 1);

// emits if daabase version connects
request.onupgradeneeded = function (event) {
    const db = event.target.resultl
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// on success finalize connection to the database
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

// if error send message
request.onerror = function (event) {
    console.log(event.target.errorCode)
};

// execute if no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
    alert('Transaction added.')
}

// collect info from object store in indexedDB and POST to server
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('transactions');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
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

            // open a transaction
            const transaction = db.transaction(['new_transaction'], 'readwrite');

            const transactionObjectStore = transaction.objectStore('new_transaction');

            transactionObjectStore.clear();

            alert('All cached transactions saved');
        })
        .catch(err => {
            console.leg(err);
        });

    
        }
    };
}

window.addEventListener('online', uploadTransaction);