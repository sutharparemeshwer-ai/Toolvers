// js/tools/word-generator.js

// A sample array of common and interesting words (You can expand this list!)
const WORD_LIST = [
    "algorithm", "function", "variable", "database", "server", "frontend", 
    "backend", "interface", "protocol", "framework", "component", "render",
    "deploy", "iterate", "optimize", "responsive", "cascade", "scripting",
    "promise", "asynchronous", "callback", "closure", "inheritance", "polymorphism",
    "abstraction", "encapsulation", "architecture", "debugging", "validation", "instance",
    "terminal", "repository", "migration", "testing", "deployment", "virtual",
    "keyboard", "monitor", "application", "browser", "network", "security",
    "synergy", "paradigm", "velocity", "agile", "scrum", "container",
    "cloud", "storage", "analytics", "microservice"
];

// DOM Elements
let wordDisplayEl, generateWordBtnEl;

// --- Core Logic ---

/**
 * Selects a random word from the list and updates the display.
 */
function generateRandomWord() {
    // 1. Get a random index
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    
    // 2. Select the word
    const randomWord = WORD_LIST[randomIndex].toUpperCase();
    
    // 3. Update the DOM
    wordDisplayEl.textContent = randomWord;
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    wordDisplayEl = document.getElementById('word-display');
    generateWordBtnEl = document.getElementById('generate-word-btn');

    // 2. Attach listeners
    if (generateWordBtnEl) {
        generateWordBtnEl.addEventListener('click', generateRandomWord);
    }
    
    // 3. Display an initial word (or START)
    // If you want a random word immediately, uncomment the line below:
    // generateRandomWord(); 
}

export function cleanup() {
    // Remove listeners
    if (generateWordBtnEl) {
        generateWordBtnEl.removeEventListener('click', generateRandomWord);
    }
}