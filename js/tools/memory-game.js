// js/tools/memory-game.js

const ICONS = ['fa-ghost', 'fa-dragon', 'fa-skull', 'fa-spider', 'fa-crow', 'fa-cat', 'fa-bolt', 'fa-meteor'];
let cards = [];
let flipped = [];
let matched = 0;
let moves = 0;
let locked = false;

function setup() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    document.getElementById('win-overlay').classList.add('d-none');
    
    // Create pairs
    const deck = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);
    
    deck.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.innerHTML = `
            <div class="mem-face mem-front"><i class="fa-solid ${icon}"></i></div>
            <div class="mem-face mem-back"><i class="fa-solid fa-question"></i></div>
        `;
        card.dataset.icon = icon;
        card.addEventListener('click', () => flip(card));
        grid.appendChild(card);
    });
    
    flipped = [];
    matched = 0;
    moves = 0;
    locked = false;
}

function flip(card) {
    if(locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    flipped.push(card);
    
    if(flipped.length === 2) {
        moves++;
        check();
    }
}

function check() {
    locked = true;
    const [c1, c2] = flipped;
    
    if(c1.dataset.icon === c2.dataset.icon) {
        c1.classList.add('matched');
        c2.classList.add('matched');
        matched++;
        flipped = [];
        locked = false;
        if(matched === ICONS.length) {
            document.getElementById('win-overlay').classList.remove('d-none');
            document.getElementById('final-moves').textContent = moves;
        }
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
            locked = false;
        }, 1000);
    }
}

export function init() {
    document.getElementById('restart-btn').addEventListener('click', setup);
    setup();
}
export function cleanup() {}
