// js/tools/coin-toss-simulator.js

// DOM Elements
let coinEl, tossBtn, resetBtn, resultMsgEl, headsCountEl, tailsCountEl;

// State
let headsCount = 0;
let tailsCount = 0;

function updateScoreboard() {
    headsCountEl.textContent = headsCount;
    tailsCountEl.textContent = tailsCount;
}

function handleToss() {
    // Disable button during animation
    tossBtn.disabled = true;
    resultMsgEl.textContent = 'Flipping...';

    // Add the flipping animation class
    coinEl.classList.add('flipping');

    // Determine the outcome
    const isHeads = Math.random() < 0.5;

    // Wait for the animation to finish
    setTimeout(() => {
        // Remove the animation class to reset for the next flip
        coinEl.classList.remove('flipping');

        // Set the final state of the coin based on the result
        if (isHeads) {
            coinEl.style.transform = 'rotateY(0deg)';
            resultMsgEl.textContent = 'It\'s Heads!';
            headsCount++;
        } else {
            coinEl.style.transform = 'rotateY(180deg)';
            resultMsgEl.textContent = 'It\'s Tails!';
            tailsCount++;
        }

        updateScoreboard();
        tossBtn.disabled = false;
    }, 1000); // This duration must match the CSS transition duration
}

function handleReset() {
    headsCount = 0;
    tailsCount = 0;
    updateScoreboard();
    resultMsgEl.textContent = 'Choose Heads or Tails!';
}

export function init() {
    coinEl = document.getElementById('coin');
    tossBtn = document.getElementById('toss-btn');
    resetBtn = document.getElementById('reset-score-btn');
    resultMsgEl = document.getElementById('result-message');
    headsCountEl = document.getElementById('heads-count');
    tailsCountEl = document.getElementById('tails-count');

    tossBtn.addEventListener('click', handleToss);
    resetBtn.addEventListener('click', handleReset);
}

export function cleanup() {
    tossBtn?.removeEventListener('click', handleToss);
    resetBtn?.removeEventListener('click', handleReset);
}