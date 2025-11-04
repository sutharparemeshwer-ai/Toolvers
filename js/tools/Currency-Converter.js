// js/tools/Currency-Converter.js

// --- DOM Elements ---
let fromSelect, toSelect, amountInput, resultOutput, swapBtn, rateDisplay;

// --- API & State ---
const API_URL = "https://api.exchangerate-api.com/v4/latest/";
let exchangeRates = {};

// A curated list of common currencies
const CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "NZD",
  "INR",
];

// --- Helper Functions ---

function populateCurrencies() {
  CURRENCIES.forEach((currency) => {
    const option1 = document.createElement("option");
    option1.value = currency;
    option1.textContent = currency;
    fromSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = currency;
    option2.textContent = currency;
    toSelect.appendChild(option2);
  });

  // Set default values
  fromSelect.value = "USD";
  toSelect.value = "INR";
}

async function fetchRates(baseCurrency = "USD") {
  try {
    const response = await fetch(`${API_URL}${baseCurrency}`);
    if (!response.ok) throw new Error("Network response was not ok.");
    const data = await response.json();
    exchangeRates = data.rates;
    convertCurrency(); // Perform initial conversion after fetching
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    rateDisplay.textContent = "Could not load exchange rates.";
    rateDisplay.classList.add("text-danger");
  }
}

// --- Core Logic ---

function convertCurrency() {
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || !exchangeRates[toCurrency]) {
    resultOutput.value = "";
    rateDisplay.textContent = "Enter an amount to see the conversion rate.";
    return;
  }

  const rate = exchangeRates[toCurrency];
  const result = (amount * rate).toFixed(2);

  resultOutput.value = result;
  rateDisplay.textContent = `1 ${fromCurrency} = ${rate.toFixed(
    4
  )} ${toCurrency}`;
  rateDisplay.classList.remove("text-danger");
}

// --- Event Handlers ---

function handleSwap() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  // After swapping, we need to fetch rates for the new 'from' currency
  fetchRates(fromSelect.value);
}

function handleFromCurrencyChange() {
  fetchRates(fromSelect.value);
}

function handleToCurrencyChange() {
  convertCurrency();
}

function handleAmountChange() {
  convertCurrency();
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  fromSelect = document.getElementById("from-currency");
  toSelect = document.getElementById("to-currency");
  amountInput = document.getElementById("amount-input");
  resultOutput = document.getElementById("result-output");
  swapBtn = document.getElementById("swap-btn");
  rateDisplay = document.getElementById("rate-display");

  // Initial setup
  populateCurrencies();
  fetchRates(fromSelect.value);

  // Attach event listeners
  fromSelect.addEventListener("change", handleFromCurrencyChange);
  toSelect.addEventListener("change", handleToCurrencyChange);
  amountInput.addEventListener("input", handleAmountChange);
  swapBtn.addEventListener("click", handleSwap);
}

export function cleanup() {
  // Remove event listeners
  if (fromSelect)
    fromSelect.removeEventListener("change", handleFromCurrencyChange);
  if (toSelect) toSelect.removeEventListener("change", handleToCurrencyChange);
  if (amountInput) amountInput.removeEventListener("input", handleAmountChange);
  if (swapBtn) swapBtn.removeEventListener("click", handleSwap);
}
