// js/tools/range-slider.js

let rangeInput;
let numberInput;
let valueDisplay;
const MIN_VAL = 0;
const MAX_VAL = 100;

// --- Core Logic Functions ---

function updateDisplay(value) {
    valueDisplay.textContent = value;
}

// Handler for the range slider input
function handleRangeInput() {
    const value = parseInt(rangeInput.value);
    
    // Sync the number input
    numberInput.value = value;
    
    // Update the large display
    updateDisplay(value);
}

// Handler for the number input field
function handleNumberInput() {
    let value = parseInt(numberInput.value);
    
    // Clamp the value to the defined min/max range
    if (isNaN(value) || value < MIN_VAL) {
        value = MIN_VAL;
    } else if (value > MAX_VAL) {
        value = MAX_VAL;
    }

    // Update the input field with the clamped value
    numberInput.value = value;
    
    // Sync the range slider
    rangeInput.value = value;
    
    // Update the large display
    updateDisplay(value);
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    rangeInput = document.getElementById('custom-range');
    numberInput = document.getElementById('number-input');
    valueDisplay = document.getElementById('slider-value-display');
    
    // 2. Set min/max properties for safety (though already in HTML)
    rangeInput.min = MIN_VAL;
    rangeInput.max = MAX_VAL;
    numberInput.min = MIN_VAL;
    numberInput.max = MAX_VAL;
    
    // 3. Attach listeners
    if (rangeInput) {
        // 'input' event fires continuously while dragging
        rangeInput.addEventListener('input', handleRangeInput);
    }
    if (numberInput) {
        // 'input' event fires immediately on key press
        numberInput.addEventListener('input', handleNumberInput);
    }
    
    // 4. Set initial display value
    updateDisplay(rangeInput.value);
}

export function cleanup() {
    // Remove listeners
    if (rangeInput) {
        rangeInput.removeEventListener('input', handleRangeInput);
    }
    if (numberInput) {
        numberInput.removeEventListener('input', handleNumberInput);
    }
    
    // Reset display
    if (valueDisplay) valueDisplay.textContent = '--';
}