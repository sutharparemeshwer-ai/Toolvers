// js/tools/stock-portfolio-tracker.js

// --- Configuration ---
// 🚨 IMPORTANT: Get your free API key from https://finnhub.io/ and replace 'YOUR_API_KEY'
const API_KEY = 'd3mveahr01qmso35kdh0d3mveahr01qmso35kdhg';
const API_BASE_URL = 'https://finnhub.io/api/v1/quote';

// --- DOM Elements ---
let tbody, form, modalInstance, emptyMessage;
let totalValueEl, totalGainEl, dayGainEl;

// --- State ---
let portfolio = [];
const STORAGE_KEY = 'stockPortfolioData';

// --- Local Storage ---
const loadPortfolio = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    portfolio = stored ? JSON.parse(stored) : [];
};

const savePortfolio = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
};

// --- API ---
async function fetchQuote(symbol) {
    if (API_KEY === 'YOUR_API_KEY') {
        throw new Error("API Key not configured. Please add your Finnhub API key.");
    }
    const url = `${API_BASE_URL}?symbol=${symbol.toUpperCase()}&token=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}`);
    }
    return response.json();
}

// --- Rendering ---

function formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function renderGainLoss(value) {
    const colorClass = value >= 0 ? 'text-success' : 'text-danger';
    const sign = value >= 0 ? '+' : '';
    return `<span class="${colorClass}">${sign}${formatCurrency(value)}</span>`;
}

async function renderPortfolio() {
    tbody.innerHTML = '';
    if (portfolio.length === 0) {
        emptyMessage.classList.remove('d-none');
        totalValueEl.textContent = formatCurrency(0);
        totalGainEl.innerHTML = formatCurrency(0);
        dayGainEl.innerHTML = formatCurrency(0);
        return;
    }
    emptyMessage.classList.add('d-none');

    let overallTotalValue = 0;
    let overallTotalCost = 0;
    let overallDayGain = 0;

    // Use Promise.all to fetch all quotes in parallel
    const quotePromises = portfolio.map(stock => fetchQuote(stock.symbol).catch(e => ({ error: e, symbol: stock.symbol })));
    const quotes = await Promise.all(quotePromises);

    portfolio.forEach((stock, index) => {
        const quote = quotes[index];
        const row = document.createElement('tr');
        
        let currentPrice = 0, dayChange = 0, totalValue = 0, totalGain = 0;
        let currentPriceText = '<span class="text-muted">Loading...</span>';
        let dayChangeText = '<span class="text-muted">--</span>';

        if (quote && !quote.error && quote.c) { // 'c' is current price from Finnhub
            currentPrice = quote.c;
            dayChange = quote.d * stock.shares;
            totalValue = currentPrice * stock.shares;
            totalGain = totalValue - (stock.purchasePrice * stock.shares);

            overallTotalValue += totalValue;
            overallTotalCost += stock.purchasePrice * stock.shares;
            overallDayGain += dayChange;

            currentPriceText = formatCurrency(currentPrice);
            dayChangeText = renderGainLoss(dayChange);
        } else {
            currentPriceText = `<span class="text-danger" title="${quote.error?.message || 'Unknown error'}">Error</span>`;
        }

        row.innerHTML = `
            <td class="fw-bold">${stock.symbol.toUpperCase()}</td>
            <td>${stock.shares}</td>
            <td>${formatCurrency(stock.purchasePrice)}</td>
            <td>${currentPriceText}</td>
            <td>${dayChangeText}</td>
            <td>${formatCurrency(totalValue)}</td>
            <td>${renderGainLoss(totalGain)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-stock-btn" data-symbol="${stock.symbol}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update summary
    totalValueEl.textContent = formatCurrency(overallTotalValue);
    totalGainEl.innerHTML = renderGainLoss(overallTotalValue - overallTotalCost);
    dayGainEl.innerHTML = renderGainLoss(overallDayGain);
}

// --- Event Handlers ---

const handleFormSubmit = (event) => {
    event.preventDefault();
    const symbol = form.querySelector('#stock-symbol').value.trim().toUpperCase();
    const shares = parseFloat(form.querySelector('#stock-shares').value);
    const purchasePrice = parseFloat(form.querySelector('#stock-purchase-price').value);

    if (!symbol || isNaN(shares) || isNaN(purchasePrice) || shares <= 0 || purchasePrice < 0) {
        alert('Please enter valid stock details.');
        return;
    }

    // Check if stock already exists to prevent duplicates
    if (portfolio.some(s => s.symbol === symbol)) {
        alert(`${symbol} is already in your portfolio. Please delete the existing entry to add a new one.`);
        return;
    }

    portfolio.push({ symbol, shares, purchasePrice });
    savePortfolio();
    renderPortfolio();
    modalInstance.hide();
    form.reset();
};

const handleTableClick = (event) => {
    const target = event.target.closest('.delete-stock-btn');
    if (!target) return;

    const symbolToDelete = target.dataset.symbol;
    if (confirm(`Are you sure you want to remove ${symbolToDelete} from your portfolio?`)) {
        portfolio = portfolio.filter(stock => stock.symbol !== symbolToDelete);
        savePortfolio();
        renderPortfolio();
    }
};

// --- Router Hooks ---

export function init() {
    tbody = document.getElementById('portfolio-tbody');
    form = document.getElementById('stock-form');
    emptyMessage = document.getElementById('empty-portfolio-message');
    totalValueEl = document.getElementById('portfolio-total-value');
    totalGainEl = document.getElementById('portfolio-total-gain');
    dayGainEl = document.getElementById('portfolio-day-gain');
    const modalEl = document.getElementById('stock-form-modal');
    modalInstance = new bootstrap.Modal(modalEl);

    loadPortfolio();
    renderPortfolio();

    form.addEventListener('submit', handleFormSubmit);
    tbody.addEventListener('click', handleTableClick);
}

export function cleanup() {
    form.removeEventListener('submit', handleFormSubmit);
    tbody.removeEventListener('click', handleTableClick);
    if (modalInstance) {
        modalInstance.dispose();
    }
}