// js/tools/personal-finance-dashboard.js

let form, accountsList, noAccountsMsg, clearAllBtn;
let netWorthEl, totalAssetsEl, totalLiabilitiesEl;
let allocationChartInstance = null;

let financeItems = [];
const STORAGE_KEY = 'personalFinanceData';
const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

const loadData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    financeItems = stored ? JSON.parse(stored) : [];
};

const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(financeItems));
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const renderAccounts = () => {
    accountsList.innerHTML = '';
    if (financeItems.length === 0) {
        noAccountsMsg.classList.remove('d-none');
        return;
    }
    noAccountsMsg.classList.add('d-none');

    financeItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'd-flex justify-content-between align-items-center p-2 border-bottom';
        const valueColor = item.type === 'asset' ? 'text-success' : 'text-danger';
        itemEl.innerHTML = `
            <div>
                <p class="mb-0 fw-bold">${item.name}</p>
                <small class="text-muted">${item.category}</small>
            </div>
            <div class="text-end">
                <strong class="${valueColor}">${formatCurrency(item.value)}</strong>
                <button class="btn btn-sm btn-outline-danger ms-2 delete-item-btn" data-id="${item.id}">&times;</button>
            </div>
        `;
        accountsList.appendChild(itemEl);
    });
};

const updateSummary = () => {
    const totalAssets = financeItems.filter(i => i.type === 'asset').reduce((sum, i) => sum + i.value, 0);
    const totalLiabilities = financeItems.filter(i => i.type === 'liability').reduce((sum, i) => sum + i.value, 0);
    const netWorth = totalAssets - totalLiabilities;

    totalAssetsEl.textContent = formatCurrency(totalAssets);
    totalLiabilitiesEl.textContent = formatCurrency(totalLiabilities);
    netWorthEl.textContent = formatCurrency(netWorth);

    netWorthEl.classList.toggle('text-success', netWorth >= 0);
    netWorthEl.classList.toggle('text-danger', netWorth < 0);
};

const updateChart = () => {
    const ctx = document.getElementById('allocation-chart')?.getContext('2d');
    if (!ctx) return;

    const assetsByCategory = financeItems
        .filter(i => i.type === 'asset')
        .reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.value;
            return acc;
        }, {});

    const labels = Object.keys(assetsByCategory);
    const data = Object.values(assetsByCategory);

    if (allocationChartInstance) {
        allocationChartInstance.destroy();
    }

    allocationChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Asset Allocation',
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: '#444',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: 'white' }
                }
            }
        }
    });
};

const updateUI = () => {
    renderAccounts();
    updateSummary();
    updateChart();
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const type = document.getElementById('item-type').value;
    const category = document.getElementById('item-category').value;
    const value = parseFloat(document.getElementById('item-value').value);

    if (!name || isNaN(value)) return;

    financeItems.push({ id: Date.now(), name, type, category, value });
    saveData();
    updateUI();
    form.reset();
};

const handleListClick = (e) => {
    if (e.target.classList.contains('delete-item-btn')) {
        const id = parseInt(e.target.dataset.id);
        financeItems = financeItems.filter(item => item.id !== id);
        saveData();
        updateUI();
    }
};

const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all financial data? This cannot be undone.')) {
        financeItems = [];
        saveData();
        updateUI();
    }
};

export async function init() {
    await loadScript(CHART_JS_CDN);

    // DOM elements
    form = document.getElementById('finance-item-form');
    accountsList = document.getElementById('accounts-list');
    noAccountsMsg = document.getElementById('no-accounts-message');
    clearAllBtn = document.getElementById('clear-all-btn');
    netWorthEl = document.getElementById('net-worth-value');
    totalAssetsEl = document.getElementById('total-assets-value');
    totalLiabilitiesEl = document.getElementById('total-liabilities-value');

    // Event listeners
    form?.addEventListener('submit', handleFormSubmit);
    accountsList?.addEventListener('click', handleListClick);
    clearAllBtn?.addEventListener('click', handleClearAll);

    // Initial load
    loadData();
    updateUI();
}

export function cleanup() {
    form?.removeEventListener('submit', handleFormSubmit);
    accountsList?.removeEventListener('click', handleListClick);
    clearAllBtn?.removeEventListener('click', handleClearAll);

    if (allocationChartInstance) {
        allocationChartInstance.destroy();
        allocationChartInstance = null;
    }
    financeItems = [];
}