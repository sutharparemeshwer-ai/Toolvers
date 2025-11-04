// js/tools/crypto-price-tracker.js

// DOM Elements
let cryptoListEl, loadingEl;

// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';
let updateInterval;

/**
 * Fetches crypto data and renders it.
 */
async function fetchAndRenderCrypto() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const coins = await response.json();

        // Clear the list (but keep the loading element template)
        cryptoListEl.innerHTML = '';
        loadingEl.classList.add('d-none');

        coins.forEach(coin => {
            const priceChange = coin.price_change_percentage_24h;
            const changeClass = priceChange >= 0 ? 'text-success' : 'text-danger';
            const changeIcon = priceChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';

            const coinEl = document.createElement('div');
            coinEl.className = 'list-group-item d-flex justify-content-between align-items-center';
            coinEl.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${coin.image}" alt="${coin.name}" style="width: 30px; height: 30px;" class="me-3">
                    <div>
                        <h5 class="mb-0">${coin.name} <span class="text-muted small text-uppercase">${coin.symbol}</span></h5>
                    </div>
                </div>
                <div class="text-end">
                    <h5 class="mb-0">$${coin.current_price.toLocaleString()}</h5>
                    <small class="${changeClass}">
                        <i class="fa-solid ${changeIcon}"></i> ${priceChange.toFixed(2)}%
                    </small>
                </div>
            `;
            cryptoListEl.appendChild(coinEl);
        });

    } catch (error) {
        console.error('Crypto Fetch Error:', error);
        cryptoListEl.innerHTML = ''; // Clear list
        loadingEl.classList.remove('d-none');
        loadingEl.innerHTML = `<p class="text-danger text-center">Failed to load crypto data. ${error.message}</p>`;
    }
}

// --- Router Hooks ---

export function init() {
    cryptoListEl = document.getElementById('crypto-list');
    loadingEl = document.getElementById('crypto-loading');

    // Show loading indicator immediately
    loadingEl.classList.remove('d-none');
    cryptoListEl.innerHTML = '';
    cryptoListEl.appendChild(loadingEl);

    // Fetch data immediately, then set an interval to update every 60 seconds
    fetchAndRenderCrypto();
    updateInterval = setInterval(fetchAndRenderCrypto, 60000);
}

export function cleanup() {
    // Clear the interval when the user navigates away to prevent background requests
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}