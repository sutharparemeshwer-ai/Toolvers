// js/tools/color-changer.js

// DOM Elements
let cardEl;
let outputEl;
let buttonEl;

/**
 * Generates a random RGB color string.
 * @returns {string} A string like "rgb(255, 100, 50)"
 */
function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    // Use the standard spaced format for display
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Changes the background color of the card element.
 */
function changeColor() {
    const newColor = generateRandomColor();
    
    // Apply the new background color to the main card
    if (cardEl) {
        cardEl.style.backgroundColor = newColor;
    }

    // Update the text output to show the new color code
    if (outputEl) {
        outputEl.textContent = `Current Color: ${newColor.toUpperCase()}`;
        
        // Optional: Check brightness to ensure text is readable
        const rgbValues = newColor.match(/\d+/g);
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        outputEl.style.color = (brightness > 125) ? '#333' : '#fff'; 
        outputEl.style.backgroundColor = newColor;
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    cardEl = document.getElementById('color-changer-card');
    outputEl = document.getElementById('color-output');
    buttonEl = document.getElementById('change-color-btn');

    // 2. Attach listener
    if (buttonEl) {
        buttonEl.addEventListener('click', changeColor);
    }
    
    // Set initial state
    changeColor();
}

export function cleanup() {
    // 1. Remove listener
    if (buttonEl) {
        buttonEl.removeEventListener('click', changeColor);
    }
    
    // 2. IMPORTANT: Reset the card background when leaving the tool
    // This uses a dark color from your style.css: #2c302f
    if (cardEl) {
        cardEl.style.backgroundColor = '#2c302f';
    }
}