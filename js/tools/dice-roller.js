// js/tools/dice-roller.js

let countInput, rollBtn, resultsContainer, totalEl;

const DICE_FACES = ['one', 'two', 'three', 'four', 'five', 'six'];

function rollDice() {
    const count = parseInt(countInput.value);
    if (isNaN(count) || count < 1 || count > 10) {
        alert('Please enter a number of dice between 1 and 10.');
        return;
    }

    resultsContainer.innerHTML = '';
    let total = 0;

    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        total += roll;

        const dieEl = document.createElement('i');
        dieEl.className = `fa-solid fa-dice-${DICE_FACES[roll - 1]} fs-1 text-primary`;
        resultsContainer.appendChild(dieEl);
    }

    totalEl.textContent = total;
}

export function init() {
    countInput = document.getElementById('dice-count');
    rollBtn = document.getElementById('roll-dice-btn');
    resultsContainer = document.getElementById('dice-results-container');
    totalEl = document.getElementById('dice-total');

    rollBtn.addEventListener('click', rollDice);

    // Initial roll on load
    rollDice();
}

export function cleanup() {
    rollBtn?.removeEventListener('click', rollDice);
}