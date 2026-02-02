// js/tools/cookie-clicker.js

const BUILDINGS = [
    { id: 'cursor', name: 'Cursor', baseCost: 15, cps: 0.1, icon: '👆' },
    { id: 'grandma', name: 'Grandma', baseCost: 100, cps: 1, icon: '👵' },
    { id: 'farm', name: 'Farm', baseCost: 1100, cps: 8, icon: '🚜' },
    { id: 'mine', name: 'Mine', baseCost: 12000, cps: 47, icon: '⛏️' },
    { id: 'factory', name: 'Factory', baseCost: 130000, cps: 260, icon: '🏭' },
    { id: 'bank', name: 'Bank', baseCost: 1400000, cps: 1400, icon: '🏦' },
    { id: 'temple', name: 'Temple', baseCost: 20000000, cps: 7800, icon: '🏯' }
];

let state = {
    cookies: 0,
    totalCookies: 0,
    clicks: 0,
    buildings: {},
    startTime: Date.now()
};

// Initialize building counts
BUILDINGS.forEach(b => {
    if(!state.buildings[b.id]) state.buildings[b.id] = 0;
});

let timer;
let clickValue = 1;

function getCost(id) {
    const b = BUILDINGS.find(x => x.id === id);
    const count = state.buildings[id] || 0;
    return Math.ceil(b.baseCost * Math.pow(1.15, count));
}

function getCPS() {
    let cps = 0;
    BUILDINGS.forEach(b => {
        cps += (state.buildings[b.id] || 0) * b.cps;
    });
    return cps;
}

function update() {
    const cps = getCPS();
    const earned = cps / 10; // Running at 10 ticks per second for smoothness
    state.cookies += earned;
    state.totalCookies += earned;
    render();
    save();
}

function render() {
    document.getElementById('cookie-count').textContent = Math.floor(state.cookies).toLocaleString();
    document.getElementById('cps-display').textContent = getCPS().toFixed(1);
    
    // Stats
    document.getElementById('stat-total').textContent = Math.floor(state.totalCookies).toLocaleString();
    document.getElementById('stat-clicks').textContent = state.clicks.toLocaleString();
    document.getElementById('stat-buildings').textContent = Object.values(state.buildings).reduce((a,b)=>a+b, 0);

    // Update Store
    BUILDINGS.forEach(b => {
        const el = document.getElementById(`store-${b.id}`);
        const cost = getCost(b.id);
        const count = state.buildings[b.id];
        
        el.querySelector('.cost-val').textContent = cost.toLocaleString();
        el.querySelector('.count-val').textContent = count;
        
        if(state.cookies >= cost) {
            el.classList.remove('locked');
            el.classList.add('bg-success', 'bg-opacity-10');
        } else {
            el.classList.add('locked');
            el.classList.remove('bg-success', 'bg-opacity-10');
        }
    });
}

function createStore() {
    const container = document.getElementById('store-container');
    container.innerHTML = BUILDINGS.map(b => `
        <div id="store-${b.id}" class="store-item locked" onclick="window.buyBuilding('${b.id}')">
            <div class="icon">${b.icon}</div>
            <div class="flex-grow-1">
                <div class="fw-bold text-white">${b.name}</div>
                <div class="small text-success fw-bold"><i class="fa-solid fa-cookie-bite"></i> <span class="cost-val">0</span></div>
            </div>
            <div class="display-6 fw-bold text-white-50 count-val">0</div>
        </div>
    `).join('');
}

window.buyBuilding = (id) => {
    const cost = getCost(id);
    if(state.cookies >= cost) {
        state.cookies -= cost;
        state.buildings[id]++;
        render();
    }
};

function handleClick(e) {
    state.cookies += clickValue;
    state.totalCookies += clickValue;
    state.clicks++;
    
    // Visual FX
    const floater = document.createElement('div');
    floater.className = 'floating-text';
    floater.textContent = `+${clickValue}`;
    floater.style.left = `${e.clientX}px`;
    floater.style.top = `${e.clientY - 20}px`;
    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 1000);

    render();
    
    // Cookie bounce scale
    const cookie = document.getElementById('big-cookie');
    cookie.style.transform = 'scale(0.95)';
    setTimeout(() => cookie.style.transform = 'scale(1)', 50);
}

function save() {
    localStorage.setItem('toolverse_cookie_save', JSON.stringify(state));
}

function load() {
    const data = JSON.parse(localStorage.getItem('toolverse_cookie_save'));
    if(data) {
        // Merge defaults
        state = { ...state, ...data };
        // Ensure buildings object integrity
        BUILDINGS.forEach(b => {
            if(state.buildings[b.id] === undefined) state.buildings[b.id] = 0;
        });
    }
}

export function init() {
    createStore();
    load();
    render();
    
    document.getElementById('big-cookie').addEventListener('mousedown', handleClick);
    
    if(timer) clearInterval(timer);
    timer = setInterval(update, 100); // 10 times a second
}

export function cleanup() {
    clearInterval(timer);
    window.buyBuilding = undefined;
    save();
}
