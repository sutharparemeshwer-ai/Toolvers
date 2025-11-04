// js/tools/expenses-splitter-app.js

// DOM Elements
let newPersonInputEl, addPersonBtnEl, peopleListEl, emptyPeopleMsgEl;
let expenseNameEl, expenseAmountEl, expensePaidByEl, addExpenseBtnEl, expensesListEl, emptyExpenseMsgEl;
let calculateBtnEl, balancesListEl, settlementListEl, clearAllBtnEl, summarySectionEl;

// App State
let people = [];
let expenses = [];
const STORAGE_KEY = 'expensesSplitterData';

// --- Local Storage Functions ---

/**
 * Loads people and expenses from Local Storage.
 */
function loadData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        const data = JSON.parse(storedData);
        people = data.people || [];
        expenses = data.expenses || [];
    }
}

/**
 * Saves current state to Local Storage.
 */
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ people, expenses }));
}

// --- People Management ---

/**
 * Adds a new person.
 */
function addPerson() {
    const name = newPersonInputEl.value.trim();
    if (name && !people.includes(name)) {
        people.push(name);
        newPersonInputEl.value = '';
        saveData();
        renderPeople();
        renderExpenseForm();
        // Clear summary as data changed
        clearSummary(); 
    }
}

/**
 * Removes a person and associated expenses.
 */
function removePerson(name) {
    if (confirm(`Are you sure you want to remove ${name}? All their associated expenses will also be removed.`)) {
        people = people.filter(p => p !== name);
        expenses = expenses.filter(e => e.paidBy !== name);
        
        saveData();
        renderPeople();
        renderExpenses();
        renderExpenseForm();
        clearSummary();
    }
}

/**
 * Renders the list of people tags.
 */
function renderPeople() {
    peopleListEl.innerHTML = '';
    
    if (people.length === 0) {
        emptyPeopleMsgEl.classList.remove('d-none');
        addExpenseBtnEl.disabled = true; // Cannot add expense without people
        return;
    }
    emptyPeopleMsgEl.classList.add('d-none');
    addExpenseBtnEl.disabled = false;

    people.forEach(name => {
        const tag = document.createElement('span');
        tag.className = 'person-tag badge';
        tag.textContent = name;
        tag.addEventListener('click', () => removePerson(name));
        peopleListEl.appendChild(tag);
    });
}

// --- Expense Management ---

/**
 * Populates the 'Paid by' dropdown options.
 */
function renderExpenseForm() {
    expensePaidByEl.innerHTML = '<option value="">Paid by...</option>';
    people.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        expensePaidByEl.appendChild(option);
    });
}

/**
 * Adds a new expense.
 */
function addExpense() {
    const name = expenseNameEl.value.trim();
    const amount = parseFloat(expenseAmountEl.value);
    const paidBy = expensePaidByEl.value;

    if (!name || isNaN(amount) || amount <= 0 || !paidBy) {
        alert("Please enter a valid description, amount, and payer.");
        return;
    }

    const newExpense = {
        id: Date.now(),
        name: name,
        amount: amount,
        paidBy: paidBy
    };

    expenses.push(newExpense);
    
    // Reset form
    expenseNameEl.value = '';
    expenseAmountEl.value = '';
    expensePaidByEl.value = '';

    saveData();
    renderExpenses();
    clearSummary();
}

/**
 * Removes an expense.
 */
function removeExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
    renderExpenses();
    clearSummary();
}

/**
 * Renders the list of recorded expenses.
 */
function renderExpenses() {
    expensesListEl.innerHTML = '';
    
    if (expenses.length === 0) {
        emptyExpenseMsgEl.classList.remove('d-none');
        return;
    }
    emptyExpenseMsgEl.classList.add('d-none');

    expenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item border rounded';
        
        const details = document.createElement('div');
        details.className = 'expense-details';
        details.innerHTML = `
            <strong>${expense.name}</strong> 
            <span class="text-muted small">($${expense.amount.toFixed(2)})</span><br>
            <span class="small">Paid by: ${expense.paidBy}</span>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger ms-3';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener('click', () => removeExpense(expense.id));

        item.appendChild(details);
        item.appendChild(deleteBtn);
        expensesListEl.appendChild(item);
    });
}

// --- Calculation Logic ---

/**
 * Calculates the final balance (net amount) for each person.
 * Positive balance = amount owed TO them. Negative balance = amount they OWE.
 */
function calculateBalances() {
    if (people.length === 0 || expenses.length === 0) {
        alert("Please add people and expenses before calculating.");
        return;
    }

    const balances = people.reduce((acc, name) => {
        acc[name] = 0; // Initialize balance to 0
        return acc;
    }, {});

    expenses.forEach(expense => {
        const amount = expense.amount;
        const paidBy = expense.paidBy;
        const share = amount / people.length;

        // 1. Payer gets credit for the full amount
        balances[paidBy] += amount;

        // 2. Everyone (including the payer) is debited their share
        people.forEach(person => {
            balances[person] -= share;
        });
    });

    // Round the balances to two decimal places
    for (const name in balances) {
        balances[name] = parseFloat(balances[name].toFixed(2));
    }

    return balances;
}

/**
 * Calculates the minimal settlement plan (who pays whom).
 * This uses a simple debt-matching algorithm.
 */
function calculateSettlement(balances) {
    const debtors = [];
    const creditors = [];

    // Separate people into debtors (owe money, balance < 0) and creditors (owed money, balance > 0)
    for (const name in balances) {
        if (balances[name] < 0) {
            debtors.push({ name: name, amount: Math.abs(balances[name]) });
        } else if (balances[name] > 0) {
            creditors.push({ name: name, amount: balances[name] });
        }
    }

    const settlements = [];
    let i = 0; // Debtors pointer
    let j = 0; // Creditors pointer

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what is owed and what is due
        const settlementAmount = Math.min(debtor.amount, creditor.amount);

        settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount: settlementAmount
        });

        // Update remaining balances
        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;

        // Move to the next debtor or creditor if their balance is settled
        if (debtor.amount === 0) {
            i++;
        }
        if (creditor.amount === 0) {
            j++;
        }
    }

    return settlements;
}

// --- Summary Rendering ---

/**
 * Clears the summary section.
 */
function clearSummary() {
    balancesListEl.innerHTML = '';
    settlementListEl.innerHTML = '';
}

/**
 * Renders the final calculated summary.
 */
function renderSummary() {
    clearSummary();
    
    const balances = calculateBalances();
    const settlements = calculateSettlement(balances);
    
    // 1. Render Balances
    for (const name in balances) {
        const balance = balances[name];
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';

        if (balance > 0) {
            item.classList.add('positive');
            item.textContent = `${name} is owed:`;
            item.innerHTML += `<span class="fw-bold text-success">$${balance.toFixed(2)}</span>`;
        } else if (balance < 0) {
            item.classList.add('negative');
            item.textContent = `${name} owes:`;
            item.innerHTML += `<span class="fw-bold text-danger">$${Math.abs(balance).toFixed(2)}</span>`;
        } else {
            item.textContent = `${name} settled up.`;
            item.innerHTML += `<span class="text-muted">$0.00</span>`;
        }
        balancesListEl.appendChild(item);
    }
    
    // 2. Render Settlement Plan
    if (settlements.length > 0) {
        settlements.forEach(s => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.innerHTML = `
                <i class="fa-solid fa-arrow-right"></i> 
                <strong>${s.from}</strong> pays 
                <strong class="text-primary">$${s.amount.toFixed(2)}</strong> to 
                <strong>${s.to}</strong>
            `;
            settlementListEl.appendChild(item);
        });
    } else if (people.length > 0) {
        const item = document.createElement('li');
        item.className = 'list-group-item text-center';
        item.textContent = "Everyone is already settled up!";
        settlementListEl.appendChild(item);
    }
}

/**
 * Clears all data (people, expenses, and local storage).
 */
function clearAllData() {
    if (confirm("Are you sure you want to clear ALL people and expense data?")) {
        people = [];
        expenses = [];
        localStorage.removeItem(STORAGE_KEY);
        
        // Re-render UI
        renderPeople();
        renderExpenses();
        renderExpenseForm();
        clearSummary();
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    newPersonInputEl = document.getElementById('new-person-input');
    addPersonBtnEl = document.getElementById('add-person-btn');
    peopleListEl = document.getElementById('people-list');
    emptyPeopleMsgEl = document.getElementById('empty-people-msg');
    expenseNameEl = document.getElementById('expense-name');
    expenseAmountEl = document.getElementById('expense-amount');
    expensePaidByEl = document.getElementById('expense-paid-by');
    addExpenseBtnEl = document.getElementById('add-expense-btn');
    expensesListEl = document.getElementById('expenses-list');
    emptyExpenseMsgEl = document.getElementById('empty-expense-msg');
    calculateBtnEl = document.getElementById('calculate-btn');
    balancesListEl = document.getElementById('balances-list');
    settlementListEl = document.getElementById('settlement-list');
    clearAllBtnEl = document.getElementById('clear-all-btn');
    
    // 2. Load data and initial render
    loadData();
    renderPeople();
    renderExpenses();
    renderExpenseForm();
    clearSummary(); // Start with a clear summary

    // 3. Attach listeners
    if (addPersonBtnEl) addPersonBtnEl.addEventListener('click', addPerson);
    if (newPersonInputEl) newPersonInputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPerson(); });
    if (addExpenseBtnEl) addExpenseBtnEl.addEventListener('click', addExpense);
    if (calculateBtnEl) calculateBtnEl.addEventListener('click', renderSummary);
    if (clearAllBtnEl) clearAllBtnEl.addEventListener('click', clearAllData);
}

export function cleanup() {
    if (addPersonBtnEl) addPersonBtnEl.removeEventListener('click', addPerson);
    if (newPersonInputEl) newPersonInputEl.removeEventListener('keypress', addPerson);
    if (addExpenseBtnEl) addExpenseBtnEl.removeEventListener('click', addExpense);
    if (calculateBtnEl) calculateBtnEl.removeEventListener('click', renderSummary);
    if (clearAllBtnEl) clearAllBtnEl.removeEventListener('click', clearAllData);
}