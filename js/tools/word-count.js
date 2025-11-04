// js/tools/word-counter-app.js

// DOM Elements
let textInputEl, wordCountEl, charCountEl, sentenceCountEl, clearBtnEl;

// --- Core Logic ---

/**
 * Counts words, characters, and sentences from the input text and updates the DOM.
 */
function updateCounts() {
    const text = textInputEl.value.trim();

    // 1. Character Count (Easy: Length of the text, excluding leading/trailing whitespace)
    const charCount = text.length;
    
    // 2. Word Count
    // Split the string by any sequence of one or more whitespace characters
    // Then filter out any empty strings that result from extra spaces
    const words = text.length > 0 ? text.split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;

    // 3. Sentence Count
    // Use a regular expression to match sentence-ending punctuation 
    // (., ?, !) followed by whitespace or end of string.
    const sentenceRegex = /[.?!]+(\s|$)/g;
    const sentences = text.match(sentenceRegex) || [];
    
    // If there is any content, but no recognized punctuation, assume it's one sentence.
    let sentenceCount = sentences.length;
    if (text.length > 0 && sentenceCount === 0) {
        sentenceCount = 1;
    }


    // 4. Update the UI
    wordCountEl.textContent = wordCount;
    charCountEl.textContent = charCount;
    sentenceCountEl.textContent = sentenceCount;
}

/**
 * Clears the text area and resets the counts.
 */
function handleClear() {
    textInputEl.value = '';
    updateCounts(); // Run updateCounts to reset the numbers to zero
    textInputEl.focus();
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    textInputEl = document.getElementById('text-input');
    wordCountEl = document.getElementById('word-count');
    charCountEl = document.getElementById('char-count');
    sentenceCountEl = document.getElementById('sentence-count');
    clearBtnEl = document.getElementById('clear-btn');
    
    // 2. Attach listeners
    if (textInputEl) {
        // Update counts on every key press/input change (real-time)
        textInputEl.addEventListener('input', updateCounts);
        
        // Initial count when the app loads (for pre-filled text or reset)
        updateCounts(); 
    }

    if (clearBtnEl) {
        clearBtnEl.addEventListener('click', handleClear);
    }
}

export function cleanup() {
    // 1. Remove listeners
    if (textInputEl) {
        textInputEl.removeEventListener('input', updateCounts);
    }
    if (clearBtnEl) {
        clearBtnEl.removeEventListener('click', handleClear);
    }

    // 2. Reset Text Area (optional, depends on your router's cleanup needs)
    if (textInputEl) {
        textInputEl.value = '';
        updateCounts(); // Reset numbers to 0
    }
}