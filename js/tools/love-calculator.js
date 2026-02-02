// js/tools/love-calculator.js

function hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function calc(e) {
    e.preventDefault();
    const n1 = document.getElementById('name1').value.trim().toLowerCase();
    const n2 = document.getElementById('name2').value.trim().toLowerCase();
    
    if(!n1 || !n2) return;

    // Deterministic Score
    const combined = [n1, n2].sort().join('');
    const score = Math.abs(hash(combined) % 101);

    const card = document.getElementById('result-card');
    const scoreEl = document.getElementById('score');
    const bar = document.getElementById('score-bar');
    const msg = document.getElementById('msg');

    card.classList.remove('d-none');
    
    // Animate
    let current = 0;
    const interval = setInterval(() => {
        if(current >= score) {
            clearInterval(interval);
            setMsg(score, msg);
        } else {
            current++;
            scoreEl.textContent = current + '%';
            bar.style.width = current + '%';
        }
    }, 15);
}

function setMsg(score, el) {
    if(score > 90) el.textContent = "Soulmates! ❤️";
    else if(score > 70) el.textContent = "Great Match! 🔥";
    else if(score > 40) el.textContent = "Good potential. 🤔";
    else el.textContent = "It might be tough... 😬";
}

export function init() {
    document.getElementById('love-form').addEventListener('submit', calc);
}
export function cleanup() {}
