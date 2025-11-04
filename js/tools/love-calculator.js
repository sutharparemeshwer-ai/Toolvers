// js/tools/love-calculator.js

// DOM Elements
let formEl, name1El, name2El, resultsAreaEl, percentageEl, messageEl, errorEl;

// --- Core Logic Functions ---

/**
 * Generates a love percentage based on name lengths and randomness.
 * @param {string} name1 
 * @param {string} name2 
 * @returns {number} The calculated percentage (0-100).
 */
function calculatePercentage(name1, name2) {
    // 1. Clean and combine names (remove spaces, convert to lowercase)
    const cleanName1 = name1.toLowerCase().replace(/\s/g, '');
    const cleanName2 = name2.toLowerCase().replace(/\s/g, '');
    
    // 2. Simple deterministic factor: combined length
    const combinedLength = cleanName1.length + cleanName2.length;
    
    // 3. Random factor: ensures results vary a bit
    const randomFactor = Math.floor(Math.random() * 40); // 0 to 39
    
    // 4. Algorithm: Combine length, random, and modulate
    // A longer combined length tends toward higher score
    let score = combinedLength * 2 + randomFactor; 
    
    // Ensure the score is between 40 and 100
    score = Math.max(40, score);
    score = Math.min(100, score); 

    // Final result should be an integer
    return Math.floor(score);
}

/**
 * Gets a fun, subjective message based on the percentage score.
 * @param {number} percentage 
 * @returns {string} The corresponding message.
 */
function getLoveMessage(percentage) {
    if (percentage >= 90) {
        return "A match made in heaven! Pure bliss! ✨";
    } else if (percentage >= 70) {
        return "Strong connection! Great potential for a long future. 💖";
    } else if (percentage >= 50) {
        return "Good compatibility. Keep working on that spark! 🔥";
    } else {
        return "It might take some effort, but love can conquer anything... maybe. 🤔";
    }
}

/**
 * Handles form submission and triggers the calculation.
 */
function handleCalculation(e) {
    e.preventDefault();

    const name1 = name1El.value.trim();
    const name2 = name2El.value.trim();

    if (!name1 || !name2) {
        showError("Please enter both names.");
        return;
    }
    
    hideError();

    // Perform calculation
    const percentage = calculatePercentage(name1, name2);
    const message = getLoveMessage(percentage);

    // Display results
    percentageEl.textContent = `${percentage}%`;
    messageEl.textContent = message;
    resultsAreaEl.classList.remove('d-none');
}

// --- Utility Functions ---

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
    resultsAreaEl.classList.add('d-none');
}

function hideError() {
    errorEl.classList.add('d-none');
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('love-calculator-form');
    name1El = document.getElementById('name1');
    name2El = document.getElementById('name2');
    resultsAreaEl = document.getElementById('results-area');
    percentageEl = document.getElementById('love-percentage');
    messageEl = document.getElementById('love-message');
    errorEl = document.getElementById('error-message');

    // 2. Attach listener
    if (formEl) formEl.addEventListener('submit', handleCalculation);
    
    // Hide results and error on initial load
    if (resultsAreaEl) resultsAreaEl.classList.add('d-none');
    if (errorEl) errorEl.classList.add('d-none');
}

export function cleanup() {
    // Remove listener
    if (formEl) formEl.removeEventListener('submit', handleCalculation);
}