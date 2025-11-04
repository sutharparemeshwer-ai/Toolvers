// js/tools/password-generator.js

// Character Sets
const CHAR_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHAR_NUMBERS = '0123456789';
const CHAR_SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

// DOM Elements
let formEl, lengthSliderEl, lengthValueEl, passwordOutputEl, copyBtnEl, feedbackEl;
let uppercaseEl, numbersEl, symbolsEl;

// --- Core Logic ---

/**
 * Generates a password based on current form criteria.
 */
function generatePassword() {
    const length = parseInt(lengthSliderEl.value);
    const includeUpper = uppercaseEl.checked;
    const includeNums = numbersEl.checked;
    const includeSymbols = symbolsEl.checked;

    let allowedChars = CHAR_LOWERCASE; // Always include lowercase for minimum security

    if (includeUpper) allowedChars += CHAR_UPPERCASE;
    if (includeNums) allowedChars += CHAR_NUMBERS;
    if (includeSymbols) allowedChars += CHAR_SYMBOLS;

    // Validation: At least one option must be selected (beyond default lowercase)
    if (allowedChars.length === CHAR_LOWERCASE.length && !includeUpper && !includeNums && !includeSymbols) {
        showFeedback("Please select at least one character type (Uppercase, Numbers, or Symbols).");
        return null;
    }
    
    showFeedback(""); // Clear previous errors

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        password += allowedChars[randomIndex];
    }
    
    return password;
}

/**
 * Handles form submission and updates the output field.
 */
function handleGenerate(e) {
    e.preventDefault();
    const newPassword = generatePassword();
    if (newPassword) {
        passwordOutputEl.value = newPassword;
        showFeedback("Password generated!", false);
    }
}

/**
 * Copies the password to the user's clipboard.
 */
function handleCopy() {
    passwordOutputEl.select(); // Select the text field
    passwordOutputEl.setSelectionRange(0, 99999); // For mobile devices

    // Use modern Clipboard API
    navigator.clipboard.writeText(passwordOutputEl.value)
        .then(() => {
            showFeedback("Password copied to clipboard!", false);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            showFeedback("Failed to copy. Try selecting manually.", true);
        });
}

/**
 * Updates the displayed password length value next to the slider.
 */
function updateLengthValue() {
    lengthValueEl.textContent = lengthSliderEl.value;
}

// --- Utility Functions ---

function showFeedback(message, isError = false) {
    feedbackEl.textContent = message;
    feedbackEl.classList.remove('d-none');
    feedbackEl.classList.toggle('text-danger', isError);
    feedbackEl.classList.toggle('text-info', !isError);
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('generator-form');
    lengthSliderEl = document.getElementById('length-slider');
    lengthValueEl = document.getElementById('length-value');
    passwordOutputEl = document.getElementById('password-output');
    copyBtnEl = document.getElementById('copy-btn');
    feedbackEl = document.getElementById('feedback');
    uppercaseEl = document.getElementById('include-uppercase');
    numbersEl = document.getElementById('include-numbers');
    symbolsEl = document.getElementById('include-symbols');

    // 2. Attach listeners
    if (formEl) formEl.addEventListener('submit', handleGenerate);
    if (copyBtnEl) copyBtnEl.addEventListener('click', handleCopy);
    if (lengthSliderEl) lengthSliderEl.addEventListener('input', updateLengthValue);
    
    // 3. Initial Setup
    updateLengthValue();
    handleGenerate({preventDefault: () => {}}); // Generate an initial password on load
}

export function cleanup() {
    // Remove listeners
    if (formEl) formEl.removeEventListener('submit', handleGenerate);
    if (copyBtnEl) copyBtnEl.removeEventListener('click', handleCopy);
    if (lengthSliderEl) lengthSliderEl.removeEventListener('input', updateLengthValue);
    
    // Clear output and feedback
    if (passwordOutputEl) passwordOutputEl.value = 'Click Generate';
    if (feedbackEl) feedbackEl.classList.add('d-none');
}