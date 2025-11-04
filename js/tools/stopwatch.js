// js/tools/stopwatch.js

let stopwatchInterval;
let totalSeconds = 0;
let isRunning = false;

// DOM Elements
let stopwatchDisplay, statusMessage;
let startBtn, pauseBtn, resetBtn;

// --- Core Logic Functions ---

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Pad with zero (e.g., 5 -> 05)
    const displayHours = String(hours).padStart(2, '0');
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');
    
    return `${displayHours}:${displayMinutes}:${displaySeconds}`;
}

function updateDisplay() {
    stopwatchDisplay.textContent = formatTime(totalSeconds);
}

function startStopwatch() {
    if (isRunning) return;
    
    isRunning = true;
    statusMessage.textContent = 'Running...';
    
    // Button States
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Start the interval
    stopwatchInterval = setInterval(() => {
        totalSeconds++;
        updateDisplay();
    }, 1000);
}

function pauseStopwatch() {
    if (!isRunning) return;
    
    clearInterval(stopwatchInterval);
    isRunning = false;
    statusMessage.textContent = 'Paused ⏸️';
    
    // Button States
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    isRunning = false;
    totalSeconds = 0;
    
    updateDisplay();
    
    statusMessage.textContent = 'Ready';

    // Button States
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    stopwatchDisplay = document.getElementById('stopwatch-display');
    statusMessage = document.getElementById('stopwatch-status');
    startBtn = document.getElementById('start-btn');
    pauseBtn = document.getElementById('pause-btn');
    resetBtn = document.getElementById('reset-btn');

    // 2. Attach Listeners
    startBtn.addEventListener('click', startStopwatch);
    pauseBtn.addEventListener('click', pauseStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    
    // 3. Initialize state
    resetStopwatch();
}

export function cleanup() {
    // 1. Clear any running interval
    clearInterval(stopwatchInterval);
    isRunning = false;
    totalSeconds = 0;
    
    // 2. Remove listeners
    if (startBtn) startBtn.removeEventListener('click', startStopwatch);
    if (pauseBtn) pauseBtn.removeEventListener('click', pauseStopwatch);
    if (resetBtn) resetBtn.removeEventListener('click', resetStopwatch);
    
    // 3. Clear display if needed
    if(stopwatchDisplay) stopwatchDisplay.textContent = '00:00:00';
    if(statusMessage) statusMessage.textContent = '';
}