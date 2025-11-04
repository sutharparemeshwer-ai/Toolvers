// js/tools/timer.js

let timerInterval;
let totalSeconds = 0;
let isRunning = false;
let initialMinutes = 5;
let initialSeconds = 0;

// DOM Elements
let minInput, secInput, timerDisplay, statusMessage;
let startBtn, pauseBtn, resetBtn;

// --- Core Logic Functions ---

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Pad with zero (e.g., 5 -> 05)
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');
    
    return `${displayMinutes}:${displaySeconds}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(totalSeconds);
    
    if (totalSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        
        // Show completion message
        statusMessage.textContent = "TIME'S UP! 🔔";
        timerDisplay.style.color = 'red';
        
        // Disable pause, enable start/reset
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        
        // Optional: Play a sound or trigger animation here
    }
}

function startTimer() {
    if (isRunning) return;
    
    // Get initial time from inputs
    const minutes = parseInt(minInput.value) || 0;
    const seconds = parseInt(secInput.value) || 0;
    
    if (totalSeconds === 0) {
        totalSeconds = (minutes * 60) + seconds;
        initialMinutes = minutes; // Save initial settings for full reset
        initialSeconds = seconds;
    }
    
    if (totalSeconds <= 0) {
        statusMessage.textContent = 'Please set a time greater than zero.';
        return;
    }
    
    isRunning = true;
    timerDisplay.style.color = 'black';
    statusMessage.textContent = 'Counting down...';
    
    // Button States
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Start the interval
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    statusMessage.textContent = 'Paused ⏸️';
    
    // Button States
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    totalSeconds = (initialMinutes * 60) + initialSeconds; // Reset to the initial input values
    
    // Reset inputs to initial saved state
    minInput.value = initialMinutes;
    secInput.value = initialSeconds;
    
    updateDisplay();
    
    statusMessage.textContent = 'Ready to start.';
    timerDisplay.style.color = 'black';

    // Button States
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function handleInputUpdate() {
    // Stop the timer if running, and update totalSeconds based on new input
    if (isRunning) pauseTimer();
    
    const minutes = parseInt(minInput.value) || 0;
    const seconds = parseInt(secInput.value) || 0;
    
    // Only update initial values if total time is 0 (first load or full reset)
    if (totalSeconds === 0 || totalSeconds === (initialMinutes * 60) + initialSeconds) {
        initialMinutes = minutes;
        initialSeconds = seconds;
        totalSeconds = (minutes * 60) + seconds;
        updateDisplay(); // Update display immediately
    } else {
        // If timer was paused, keep paused totalSeconds, but update initial for next reset
        initialMinutes = minutes;
        initialSeconds = seconds;
    }
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    minInput = document.getElementById('minutes');
    secInput = document.getElementById('seconds');
    timerDisplay = document.getElementById('timer-display');
    statusMessage = document.getElementById('timer-status');
    startBtn = document.getElementById('start-btn');
    pauseBtn = document.getElementById('pause-btn');
    resetBtn = document.getElementById('reset-btn');

    // 2. Attach Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Update display when input changes
    minInput.addEventListener('input', handleInputUpdate);
    secInput.addEventListener('input', handleInputUpdate);
    
    // 3. Initialize state
    resetTimer(); // Calls updateDisplay()
}

export function cleanup() {
    // 1. Clear any running interval
    clearInterval(timerInterval);
    isRunning = false;
    totalSeconds = 0;
    
    // 2. Remove listeners
    startBtn.removeEventListener('click', startTimer);
    pauseBtn.removeEventListener('click', pauseBtn);
    resetBtn.removeEventListener('click', resetTimer);
    minInput.removeEventListener('input', handleInputUpdate);
    secInput.removeEventListener('input', handleInputUpdate);
    
    // 3. Clear display if needed
    if(timerDisplay) timerDisplay.textContent = '00:00';
    if(statusMessage) statusMessage.textContent = '';
}