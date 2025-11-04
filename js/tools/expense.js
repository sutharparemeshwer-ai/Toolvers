// js/tools/expense-tracker.js

let balanceEl, moneyPlusEl, moneyMinusEl, listEl, formEl, textEl, amountEl;

const localStorageKey = 'expenseTrackerTransactions';
// Get transactions from local storage, or use an empty array
let transactions = JSON.parse(localStorage.getItem(localStorageKey)) || [];

// --- Core Logic Functions ---

// 1. Update the UI (Balance, Income, Expense)
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    // Calculate Total Balance
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    
    // Calculate Income (Positive amounts)
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    // Calculate Expense (Absolute value of Negative amounts)
    const expense = (amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1)
        .toFixed(2);

    // Update DOM elements
    balanceEl.textContent = `$${total}`;
    moneyPlusEl.textContent = `+$${income}`;
    moneyMinusEl.textContent = `-$${expense}`;
    
    // Highlight balance based on sign
    balanceEl.classList.remove('text-success', 'text-danger');
    if (total >= 0) {
        balanceEl.classList.add('text-success');
    } else {
        balanceEl.classList.add('text-danger');
    }
}

// 2. Add Transaction to DOM
function addTransactionDOM(transaction) {
    // Determine sign and class
    const sign = transaction.amount < 0 ? '-' : '+';
    const itemClass = transaction.amount < 0 ? 'text-danger' : 'text-success';
    
    // Create the new list item
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    listItem.innerHTML = `
        <span>${transaction.text}</span>
        <div>
            <span class="${itemClass}">${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="delete-btn btn btn-sm btn-danger ms-2" data-id="${transaction.id}">x</button>
        </div>
    `;

    listEl.appendChild(listItem);
    
    // Hide 'No transactions yet' message
    const noTransEl = document.getElementById('no-transactions');
    if (noTransEl) noTransEl.style.display = 'none';
}

// 3. Remove Transaction
function removeTransaction(id) {
    // Filter out the transaction with the given id
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();
    initTransactions(); // Re-render the list and update totals
}

// 4. Update Local Storage
function updateLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
}

// 5. Initialize/Re-render Transactions
function initTransactions() {
    // Clear the current list
    listEl.innerHTML = '<li class="list-group-item text-center text-muted small" id="no-transactions" style="display:none;">No transactions yet.</li>';

    // Add transactions to DOM
    transactions.forEach(addTransactionDOM);
    
    if (transactions.length === 0) {
         const noTransEl = document.getElementById('no-transactions');
         if (noTransEl) noTransEl.style.display = 'block';
    }

    updateValues(); // Update balance and summary
}

// --- Event Handlers ---

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const text = textEl.value.trim();
    const amount = parseFloat(amountEl.value);

    if (text === '' || isNaN(amount)) {
        alert('Please add a valid description and amount (e.g., -20.50 or 100.00)');
        return;
    }

    const transaction = {
        id: generateID(),
        text,
        amount
    };

    transactions.push(transaction);

    // addTransactionDOM(transaction); // Don't add directly, let init handle re-render
    updateLocalStorage();
    initTransactions();

    textEl.value = '';
    amountEl.value = '';
}

function handleDeleteClick(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        removeTransaction(id);
    }
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    balanceEl = document.getElementById('balance');
    moneyPlusEl = document.getElementById('money-plus');
    moneyMinusEl = document.getElementById('money-minus');
    listEl = document.getElementById('list');
    formEl = document.getElementById('form');
    textEl = document.getElementById('text');
    amountEl = document.getElementById('amount');

    // 2. Attach listeners
    formEl.addEventListener('submit', handleFormSubmit);
    listEl.addEventListener('click', handleDeleteClick);

    // 3. Load existing transactions and render UI
    initTransactions();
}

export function cleanup() {
    // Remove listeners
    if (formEl) formEl.removeEventListener('submit', handleFormSubmit);
    if (listEl) listEl.removeEventListener('click', handleDeleteClick);
    
    // Reset global state if needed (though transactions are persisted via localStorage)
    // We keep 'transactions' in scope so it naturally resets if the page reloads.
}