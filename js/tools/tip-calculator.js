// js/tools/tip-calculator.js

// DOM Elements
let formEl, resultsAreaEl, errorEl;
let billAmountEl, tipPercentEl, numPeopleEl;
let totalTipEl, totalBillEl, tipPerPersonEl, totalPerPersonEl;

// --- Calculation Logic ---

/**
 * Handles form submission, performs tip calculation, and displays results.
 */
function calculateTip(e) {
    e.preventDefault();

    // 1. Get and validate input values
    const billAmount = parseFloat(billAmountEl.value);
    const tipPercent = parseFloat(tipPercentEl.value);
    const numPeople = parseInt(numPeopleEl.value);

    // Basic validation
    if (isNaN(billAmount) || billAmount <= 0 || isNaN(tipPercent) || isNaN(numPeople) || numPeople < 1) {
        showError("Please enter valid positive numbers for all fields.");
        return;
    }
    
    hideError();

    // 2. Perform calculations
    const tipDecimal = tipPercent / 100;
    const totalTip = billAmount * tipDecimal;
    const totalBill = billAmount + totalTip;
    
    const tipPerPerson = totalTip / numPeople;
    const totalPerPerson = totalBill / numPeople;

    // 3. Format currency and display results
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    totalTipEl.textContent = currencyFormatter.format(totalTip);
    totalBillEl.textContent = currencyFormatter.format(totalBill);
    tipPerPersonEl.textContent = currencyFormatter.format(tipPerPerson);
    totalPerPersonEl.textContent = currencyFormatter.format(totalPerPerson);

    // Show the results area
    resultsAreaEl.classList.remove('d-none');
}

// --- Utility Functions ---

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
    resultsAreaEl.classList.add('d-none');
}

function hideError() {
    errorEl.classList.add('d-none');
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('tip-calculator-form');
    resultsAreaEl = document.getElementById('results-area');
    errorEl = document.getElementById('error-message');

    billAmountEl = document.getElementById('bill-amount');
    tipPercentEl = document.getElementById('tip-percent');
    numPeopleEl = document.getElementById('num-people');
    
    totalTipEl = document.getElementById('total-tip');
    totalBillEl = document.getElementById('total-bill');
    tipPerPersonEl = document.getElementById('tip-per-person');
    totalPerPersonEl = document.getElementById('total-per-person');

    // 2. Attach listener
    if (formEl) formEl.addEventListener('submit', calculateTip);
    
    // Hide results and error on initial load
    if (resultsAreaEl) resultsAreaEl.classList.add('d-none');
    if (errorEl) errorEl.classList.add('d-none');
}

export function cleanup() {
    // Remove listener
    if (formEl) formEl.removeEventListener('submit', calculateTip);
    
    // Clean up visibility
    if (resultsAreaEl) resultsAreaEl.classList.add('d-none');
    if (errorEl) errorEl.classList.add('d-none');
}