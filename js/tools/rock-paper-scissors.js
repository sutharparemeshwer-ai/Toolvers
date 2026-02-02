// js/tools/rock-paper-scissors.js

const MAP = { rock: '👊', paper: '✋', scissors: '✌️' };
let pScore = 0, cScore = 0;

function play(choice) {
    const pEl = document.getElementById('p-choice');
    const cEl = document.getElementById('c-choice');
    const resEl = document.getElementById('rps-result');
    const opts = ['rock', 'paper', 'scissors'];
    const cpu = opts[Math.floor(Math.random() * 3)];

    // Reset
    pEl.textContent = '👊';
    cEl.textContent = '👊';
    pEl.classList.add('shake');
    cEl.classList.add('shake');
    resEl.textContent = 'Fighting...';

    setTimeout(() => {
        pEl.classList.remove('shake');
        cEl.classList.remove('shake');
        
        pEl.textContent = MAP[choice];
        cEl.textContent = MAP[cpu];

        if(choice === cpu) {
            resEl.textContent = "Draw!";
            resEl.className = 'h4 text-warning fw-bold mb-5';
        } else if (
            (choice === 'rock' && cpu === 'scissors') ||
            (choice === 'paper' && cpu === 'rock') ||
            (choice === 'scissors' && cpu === 'paper')
        ) {
            resEl.textContent = "You Win!";
            resEl.className = 'h4 text-success fw-bold mb-5';
            pScore++;
        } else {
            resEl.textContent = "You Lose!";
            resEl.className = 'h4 text-danger fw-bold mb-5';
            cScore++;
        }
        
        document.getElementById('score-val').textContent = `${pScore} - ${cScore}`;
    }, 500);
}

export function init() {
    document.querySelectorAll('.rps-btn').forEach(b => {
        b.onclick = () => play(b.dataset.choice);
    });
}
export function cleanup() {}
