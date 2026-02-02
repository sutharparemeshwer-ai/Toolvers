// js/tools/hangman.js

const WORDS = ["DEVELOPER", "JAVASCRIPT", "INTERFACE", "TERMINAL", "SOFTWARE", "CODING", "DATABASE"];
let secret = "", guessed = [], wrong = 0;
const PARTS = ['head','body','larm','rarm','lleg','rleg'];

function setup() {
    secret = WORDS[Math.floor(Math.random()*WORDS.length)];
    guessed = [];
    wrong = 0;
    
    document.getElementById('hm-msg').textContent = "";
    document.getElementById('hm-restart').classList.add('d-none');
    document.getElementById('wrong-count').textContent = "0";
    
    PARTS.forEach(p => document.getElementById(`h-${p}`).classList.add('d-none'));
    
    renderKeyboard();
    renderWord();
}

function renderWord() {
    const display = secret.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
    document.getElementById('word-display').textContent = display;
    
    if(!display.includes('_')) endGame(true);
}

function renderKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(l => `
        <button class="btn btn-sm btn-dark border border-white-10 text-white kb-btn" onclick="window.guess('${l}')" id="key-${l}">${l}</button>
    `).join('');
}

window.guess = (l) => {
    if(guessed.includes(l) || wrong >= 6) return;
    guessed.push(l);
    document.getElementById(`key-${l}`).disabled = true;
    
    if(secret.includes(l)) {
        renderWord();
    } else {
        document.getElementById(`h-${PARTS[wrong]}`).classList.remove('d-none');
        wrong++;
        document.getElementById('wrong-count').textContent = wrong;
        if(wrong >= 6) endGame(false);
    }
};

function endGame(win) {
    const msg = document.getElementById('hm-msg');
    msg.textContent = win ? "PERFECT! You survived." : `TERMINATED. Word was: ${secret}`;
    msg.className = `h5 mt-4 fw-bold ${win ? 'text-success' : 'text-danger'}`;
    document.getElementById('hm-restart').classList.remove('d-none');
}

export function init() {
    document.getElementById('hm-restart').onclick = setup;
    setup();
}

export function cleanup() {
    window.guess = undefined;
}