// js/tools/expense.js

const localStorageKey = 'expenseTrackerTransactions_v2';
let transactions = JSON.parse(localStorage.getItem(localStorageKey)) || [];
let chartInstance = null;

// DOM
let balanceEl, moneyPlusEl, moneyMinusEl, listEl, formEl, textEl, amountEl, ctx;

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balanceEl.innerText = `$${total}`;
    moneyPlusEl.innerText = `+$${income}`;
    moneyMinusEl.innerText = `-$${expense}`;
    
    updateChart(income, expense);
}

function updateChart(income, expense) {
    if (!ctx) return;
    
    // Use global Chart (loaded in index.html)
    if (typeof Chart === 'undefined') return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'], // Tailwind Green-500, Red-500
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af' }
                }
            },
            cutout: '70%'
        }
    });
}

function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const itemClass = transaction.amount < 0 ? 'text-danger' : 'text-success';
    const item = document.createElement('li');
    
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-3');
    item.innerHTML = `
        <span>${transaction.text}</span>
        <div>
            <span class="${itemClass} fw-bold me-3">${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-danger delete-btn" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; font-size: .75rem;" onclick="window.removeExpense(${transaction.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    listEl.appendChild(item);
}

function initTransactions() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    
    if (transactions.length === 0) {
        document.getElementById('no-transactions').style.display = 'block';
    } else {
        document.getElementById('no-transactions').style.display = 'none';
    }
    
    updateValues();
}

function addTransaction(e) {
    e.preventDefault();
    if (textEl.value.trim() === '' || amountEl.value.trim() === '') return;

    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        text: textEl.value,
        amount: +amountEl.value
    };

    transactions.push(transaction);
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
    
    addTransactionDOM(transaction);
    updateValues();
    
    textEl.value = '';
    amountEl.value = '';
    document.getElementById('no-transactions').style.display = 'none';
}

// Global for inline onclick
window.removeExpense = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
    initTransactions();
};

export function init() {
    balanceEl = document.getElementById('balance');
    moneyPlusEl = document.getElementById('money-plus');
    moneyMinusEl = document.getElementById('money-minus');
    listEl = document.getElementById('list');
    formEl = document.getElementById('form');
    textEl = document.getElementById('text');
    amountEl = document.getElementById('amount');
    
    // Setup Canvas
    const canvas = document.getElementById('expense-chart');
    if(canvas) ctx = canvas.getContext('2d');

    formEl.addEventListener('submit', addTransaction);
    initTransactions();
}

export function cleanup() {
    if (formEl) formEl.removeEventListener('submit', addTransaction);
    if (chartInstance) chartInstance.destroy();
    window.removeExpense = undefined; // Cleanup global
}
