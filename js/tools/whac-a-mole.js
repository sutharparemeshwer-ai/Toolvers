// js/tools/whac-a-mole.js

let grid, scoreEl, timeEl, btn;
let score = 0, time = 30, timer, moleTimer;
let activeIndex = -1, activeKey = '';
const KEYS = 'QWEASDZXC'; // 3x3 layout keys

function createGrid() {
    grid.innerHTML = '';
    for(let i=0; i<9; i++) {
        const div = document.createElement('div');
        div.className = 'mole-cell';
        div.dataset.i = i;
        grid.appendChild(div);
    }
}

function spawn() {
    // Clear old
    if(activeIndex !== -1) {
        grid.children[activeIndex].classList.remove('active');
        grid.children[activeIndex].textContent = '';
    }
    
    // New
    activeIndex = Math.floor(Math.random() * 9);
    activeKey = KEYS[activeIndex];
    
    const cell = grid.children[activeIndex];
    cell.classList.add('active');
    cell.textContent = activeKey;
}

function start() {
    score = 0;
    time = 30;
    scoreEl.textContent = 0;
    timeEl.textContent = 30;
    btn.disabled = true;
    
    spawn();
    timer = setInterval(() => {
        time--;
        timeEl.textContent = time;
        if(time <= 0) end();
    }, 1000);
    
    moleTimer = setInterval(spawn, 800); // Speed
}

function end() {
    clearInterval(timer);
    clearInterval(moleTimer);
    btn.disabled = false;
    if(activeIndex !== -1) {
        grid.children[activeIndex].classList.remove('active');
        grid.children[activeIndex].textContent = '';
    }
    alert(`Game Over! Score: ${score}`);
}

function handleKey(e) {
    if(time <= 0 || !activeKey) return;
    if(e.key.toUpperCase() === activeKey) {
        score++;
        scoreEl.textContent = score;
        spawn(); // Instant spawn on hit
        clearInterval(moleTimer);
        moleTimer = setInterval(spawn, 800); // Reset timer
    }
}

export function init() {
    grid = document.getElementById('mole-grid');
    scoreEl = document.getElementById('w-score');
    timeEl = document.getElementById('w-time');
    btn = document.getElementById('start-btn');
    
    createGrid();
    btn.onclick = start;
    document.addEventListener('keydown', handleKey);
}

export function cleanup() {
    clearInterval(timer);
    clearInterval(moleTimer);
    document.removeEventListener('keydown', handleKey);
}
