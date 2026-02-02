// js/tools/crypto-price-tracker.js

let listBody, loadingEl, errorEl;
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false';

async function fetchData() {
    try {
        loadingEl.classList.remove('d-none');
        errorEl.classList.add('d-none');
        listBody.innerHTML = '';

        const res = await fetch(API_URL);
        if(!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        render(data);
        loadingEl.classList.add('d-none');
    } catch (e) {
        console.error(e);
        loadingEl.classList.add('d-none');
        errorEl.classList.remove('d-none');
    }
}

function render(coins) {
    listBody.innerHTML = coins.map(coin => {
        const isUp = coin.price_change_percentage_24h >= 0;
        const changeColor = isUp ? 'text-success' : 'text-danger';
        const changeIcon = isUp ? 'fa-caret-up' : 'fa-caret-down';
        
        return `
        <tr class="align-middle">
            <td class="ps-4">
                <div class="d-flex align-items-center">
                    <span class="text-secondary me-3 small" style="width: 20px;">${coin.market_cap_rank}</span>
                    <img src="${coin.image}" class="coin-icon me-3" alt="${coin.symbol}">
                    <div>
                        <div class="fw-bold text-white">${coin.name}</div>
                        <div class="small text-secondary text-uppercase">${coin.symbol}</div>
                    </div>
                </div>
            </td>
            <td class="text-end fw-bold text-white">
                $${coin.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
            <td class="text-end">
                <span class="badge bg-opacity-10 ${isUp ? 'bg-success text-success' : 'bg-danger text-danger'} rounded-pill px-2">
                    <i class="fa-solid ${changeIcon} me-1"></i>
                    ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
            </td>
            <td class="text-end text-white">
                $${coin.high_24h.toLocaleString()}
            </td>
            <td class="text-end pe-4 text-secondary">
                $${(coin.market_cap / 1e9).toFixed(2)}B
            </td>
        </tr>
        `;
    }).join('');
}

export function init() {
    listBody = document.getElementById('crypto-list-body');
    loadingEl = document.getElementById('crypto-loading');
    errorEl = document.getElementById('crypto-error');
    
    fetchData();
}

export function cleanup() {}
