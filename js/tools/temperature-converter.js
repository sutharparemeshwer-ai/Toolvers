// js/tools/temperature-converter-app.js

// DOM Elements
let celsiusInputEl, fahrenheitInputEl, clearBtnEl;

// --- Conversion Formulas ---

/**
 * Converts Celsius to Fahrenheit.
 */
function toFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

/**
 * Converts Fahrenheit to Celsius.
 */
function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// --- Event Handlers ---

/**
 * Handles input change in the Celsius field and updates Fahrenheit.
 */
function handleCelsiusChange() {
    const celsiusValue = parseFloat(celsiusInputEl.value);
    
    if (isNaN(celsiusValue)) {
        fahrenheitInputEl.value = ''; // Clear other field if input is not a number
    } else {
        const fahrenheitValue = toFahrenheit(celsiusValue);
        // Display result rounded to 2 decimal places
        fahrenheitInputEl.value = fahrenheitValue.toFixed(2);
    }
}

/**
 * Handles input change in the Fahrenheit field and updates Celsius.
 */
function handleFahrenheitChange() {
    const fahrenheitValue = parseFloat(fahrenheitInputEl.value);

    if (isNaN(fahrenheitValue)) {
        celsiusInputEl.value = ''; // Clear other field if input is not a number
    } else {
        const celsiusValue = toCelsius(fahrenheitValue);
        // Display result rounded to 2 decimal places
        celsiusInputEl.value = celsiusValue.toFixed(2);
    }
}

/**
 * Clears both input fields.
 */
function handleClear() {
    celsiusInputEl.value = '';
    fahrenheitInputEl.value = '';
    celsiusInputEl.focus(); // Set focus back to Celsius field
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    celsiusInputEl = document.getElementById('celsius-input');
    fahrenheitInputEl = document.getElementById('fahrenheit-input');
    clearBtnEl = document.getElementById('clear-btn');
    
    // 2. Attach listeners
    if (celsiusInputEl) {
        // 'input' event fires on every change (typing)
        celsiusInputEl.addEventListener('input', handleCelsiusChange);
    }
    
    if (fahrenheitInputEl) {
        fahrenheitInputEl.addEventListener('input', handleFahrenheitChange);
    }

    if (clearBtnEl) {
        clearBtnEl.addEventListener('click', handleClear);
    }
}

export function cleanup() {
    // 1. Remove listeners
    if (celsiusInputEl) {
        celsiusInputEl.removeEventListener('input', handleCelsiusChange);
    }
    if (fahrenheitInputEl) {
        fahrenheitInputEl.removeEventListener('input', handleFahrenheitChange);
    }
    if (clearBtnEl) {
        clearBtnEl.removeEventListener('click', handleClear);
    }
    
    // 2. Reset fields
    if (celsiusInputEl) celsiusInputEl.value = '';
    if (fahrenheitInputEl) fahrenheitInputEl.value = '';
}