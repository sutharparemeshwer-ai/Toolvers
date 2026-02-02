// js/tools/personal-finance-dashboard.js

let items = [];
const KEY = 'toolverse_finance_v2';
let chart = null;

function load() {
    items = JSON.parse(localStorage.getItem(KEY)) || [];
    render();
}

function save() {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
}

function render() {
    const list = document.getElementById('accounts-list');
    list.innerHTML = items.map((item, i) => `
        <div class="p-3 border-bottom border-white-10 d-flex justify-content-between align-items-center">
            <div>
                <div class="text-white fw-bold">${item.name}</div>
                <span class="badge ${item.type === 'asset' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${item.type === 'asset' ? 'text-success' : 'text-danger'} border border-opacity-25" style="font-size: 0.65rem;">${item.type.toUpperCase()}</span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white fw-bold">$${item.val.toLocaleString()}</span>
                <i class="fa-solid fa-trash text-secondary cursor-pointer hover-text-danger" onclick="window.delFin(${i})"></i>
            </div>
        </div>
    `).join('');

    // Summary
    const assets = items.filter(i => i.type === 'asset').reduce((s, i) => s + i.val, 0);
    const liabs = items.filter(i => i.type === 'liability').reduce((s, i) => s + i.val, 0);
    
    document.getElementById('assets-total').textContent = '$' + assets.toLocaleString();
    document.getElementById('liab-total').textContent = '$' + liabs.toLocaleString();
    document.getElementById('nw-total').textContent = '$' + (assets - liabs).toLocaleString();

    updateChart(assets, liabs);
}

function updateChart(assets, liabs) {
    if(!window.Chart) return;
    const ctx = document.getElementById('allocation-chart');
    
    if(chart) chart.destroy();
    
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Assets', 'Liabilities'],
            datasets: [{
                data: [assets, liabs],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '70%'
        }
    });
}

function add(e) {
    e.preventDefault();
    const name = document.getElementById('fin-name').value;
    const type = document.getElementById('fin-type').value;
    const val = parseFloat(document.getElementById('fin-val').value);

    if(name && val) {
        items.push({ name, type, val });
        save();
        e.target.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
        modal.hide();
    }
}

window.delFin = (i) => {
    items.splice(i, 1);
    save();
};

export function init() {
    document.getElementById('finance-form').addEventListener('submit', add);
    load();
}

export function cleanup() {
    window.delFin = undefined;
    if(chart) chart.destroy();
}
