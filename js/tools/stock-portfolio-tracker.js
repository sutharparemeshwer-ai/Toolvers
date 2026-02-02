// js/tools/stock-portfolio-tracker.js
import { Toast } from '../ui.js';

const KEY = 'd3mveahr01qmso35kdh0d3mveahr01qmso35kdhg'; // Finnhub
let stocks = [];
let table, totalEl;

async function updatePrices() {
    if(stocks.length === 0) return;
    
    let total = 0;
    const rows = [];

    // Fetch parallel
    const promises = stocks.map(async (s) => {
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s.sym}&token=${KEY}`);
            const data = await res.json();
            return { ...s, current: data.c || 0 };
        } catch(e) {
            return { ...s, current: 0 };
        }
    });

    const updatedStocks = await Promise.all(promises);

    updatedStocks.forEach((s, i) => {
        const val = s.current * s.shares;
        const cost = s.price * s.shares;
        const pl = val - cost;
        const plPct = cost > 0 ? (pl / cost) * 100 : 0;
        
        total += val;

        rows.push(`
            <tr>
                <td class="ps-4 fw-bold text-white">${s.sym}</td>
                <td class="text-end">$${s.current.toFixed(2)}</td>
                <td class="text-end">
                    <div class="text-white">${s.shares}</div>
                    <div class="small text-secondary">$${s.price.toFixed(2)} avg</div>
                </td>
                <td class="text-end fw-bold text-white">$${val.toFixed(2)}</td>
                <td class="text-end ${pl >= 0 ? 'text-success' : 'text-danger'}">
                    <div>${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</div>
                    <div class="small">${plPct.toFixed(2)}%</div>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-link text-secondary hover-text-danger" onclick="window.delStock(${i})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `);
    });

    table.innerHTML = rows.join('');
    totalEl.textContent = '$' + total.toLocaleString(undefined, {minimumFractionDigits: 2});
}

function add(e) {
    e.preventDefault();
    const sym = document.getElementById('symbol-in').value.toUpperCase();
    const shares = parseFloat(document.getElementById('shares-in').value);
    const price = parseFloat(document.getElementById('price-in').value);

    if(sym && shares > 0) {
        stocks.push({ sym, shares, price });
        localStorage.setItem('toolverse_portfolio', JSON.stringify(stocks));
        e.target.reset();
        updatePrices();
    }
}

window.delStock = (i) => {
    stocks.splice(i, 1);
    localStorage.setItem('toolverse_portfolio', JSON.stringify(stocks));
    updatePrices();
    if(stocks.length === 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-white-50">No positions open.</td></tr>';
        totalEl.textContent = '$0.00';
    }
};

export function init() {
    table = document.getElementById('stock-list');
    totalEl = document.getElementById('total-val');
    stocks = JSON.parse(localStorage.getItem('toolverse_portfolio')) || [];
    
    document.getElementById('add-stock-form').addEventListener('submit', add);
    
    if(stocks.length > 0) {
        table.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';
        updatePrices();
    } else {
        window.delStock(0); // Trigger empty state
    }
}

export function cleanup() {
    window.delStock = undefined;
}
