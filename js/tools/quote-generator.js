// js/tools/quote-generator.js

// New API: Advice Slip
const API_URL = 'https://api.adviceslip.com/advice'; 
// The API structure is different, so we must adjust the fetching logic too!
// ...
// DOM Elements
let quoteTextEl, quoteAuthorEl, newQuoteBtnEl;

// --- Core Logic ---

// Updated fetchQuote for Advice Slip API
async function fetchQuote() {
    quoteTextEl.textContent = "Fetching advice...";
    quoteAuthorEl.textContent = "Loading...";
    newQuoteBtnEl.disabled = true;

    try {
        // We use a timestamp to ensure the browser doesn't return a cached quote
        const response = await fetch(`${API_URL}?t=${Date.now()}`); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // --- KEY CHANGE: Accessing the 'advice' property ---
        const advice = data.slip.advice;
        
        // Update the content
        quoteTextEl.textContent = advice;
        quoteAuthorEl.textContent = "Anonymous Advice"; // This API doesn't provide an author

    } catch (error) {
        console.error("Error fetching advice:", error);
        quoteTextEl.textContent = "Failed to load advice. Check network connection or try Live Server.";
        quoteAuthorEl.textContent = "Error";
    } finally {
        newQuoteBtnEl.disabled = false;
    }
}
// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    quoteTextEl = document.getElementById('quote-text');
    quoteAuthorEl = document.getElementById('quote-author');
    newQuoteBtnEl = document.getElementById('new-quote-btn');

    // 2. Attach listeners
    if (newQuoteBtnEl) {
        newQuoteBtnEl.addEventListener('click', fetchQuote);
    }
    
    // 3. Fetch the first quote when the tool loads
    fetchQuote();
}

export function cleanup() {
    // Remove listeners
    if (newQuoteBtnEl) {
        newQuoteBtnEl.removeEventListener('click', fetchQuote);
    }
}