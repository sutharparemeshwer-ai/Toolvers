// js/tools/pomodoro-timer-app.js

// DOM Elements
let timerDisplayEl, statusMessageEl, startPauseBtnEl, resetBtnEl;
let pomodoroModeBtnEl, breakModeBtnEl;

// App Configuration
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60;    // 5 minutes in seconds

// App State
let currentTime = POMODORO_DURATION;
let isRunning = false;
let currentMode = 'pomodoro'; // 'pomodoro' or 'break'
let timerInterval = null;

// --- Helper Functions ---

/**
 * Formats seconds into MM:SS string.
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Pad with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Updates the timer display in the DOM.
 */
function updateDisplay() {
    timerDisplayEl.textContent = formatTime(currentTime);
    document.title = `${formatTime(currentTime)} | ${currentMode === 'pomodoro' ? 'Focus' : 'Break'}`;
    resetBtnEl.disabled = (currentTime === getDuration(currentMode) && !isRunning);
}

// --- Mode Management ---

/**
 * Gets the total seconds for the current mode.
 */
function getDuration(mode) {
    return mode === 'pomodoro' ? POMODORO_DURATION : BREAK_DURATION;
}

/**
 * Sets the timer to a new mode.
 */
function setMode(newMode) {
    if (isRunning) return; // Prevent mode change while running

    currentMode = newMode;
    currentTime = getDuration(newMode);
    
    // Update button visual state
    pomodoroModeBtnEl.classList.remove('active');
    breakModeBtnEl.classList.remove('active');
    document.querySelector(`[data-mode="${newMode}"]`).classList.add('active');

    // Update status message
    statusMessageEl.textContent = newMode === 'pomodoro' ? 'Time to focus!' : 'Time for a break.';
    
    // Update control button text and style
    startPauseBtnEl.textContent = 'START';
    startPauseBtnEl.classList.remove('btn-warning');
    startPauseBtnEl.classList.add('btn-success');
    
    updateDisplay();
}

// --- Timer Control Functions ---

/**
 * The main timer function called every second.
 */
function tick() {
    if (currentTime > 0) {
        currentTime--;
    } else {
        // Timer reached zero
        clearInterval(timerInterval);
        isRunning = false;
        
        // Play an alert sound (optional: requires an <audio> element or a library)
        // console.log("Time's up!");

        // Automatically switch mode
        if (currentMode === 'pomodoro') {
            setMode('break');
        } else {
            setMode('pomodoro');
        }
        
        // Restart automatically after the switch
        startTimer();
    }
    updateDisplay();
}

/**
 * Starts or pauses the timer.
 */
function toggleStartPause() {
    if (isRunning) {
        // Pause logic
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtnEl.textContent = 'RESUME';
        startPauseBtnEl.classList.remove('btn-warning');
        startPauseBtnEl.classList.add('btn-success');
    } else {
        // Start/Resume logic
        startTimer();
    }
}

/**
 * Starts the timer interval.
 */
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startPauseBtnEl.textContent = 'PAUSE';
    startPauseBtnEl.classList.remove('btn-success');
    startPauseBtnEl.classList.add('btn-warning');
    
    // Start the interval (1000ms = 1 second)
    timerInterval = setInterval(tick, 1000);
}

/**
 * Resets the timer to the beginning of the current mode.
 */
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    currentTime = getDuration(currentMode);

    startPauseBtnEl.textContent = 'START';
    startPauseBtnEl.classList.remove('btn-warning');
    startPauseBtnEl.classList.add('btn-success');
    
    updateDisplay();
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    timerDisplayEl = document.getElementById('timer-display');
    statusMessageEl = document.getElementById('status-message');
    startPauseBtnEl = document.getElementById('start-pause-btn');
    resetBtnEl = document.getElementById('reset-btn');
    pomodoroModeBtnEl = document.getElementById('pomodoro-mode-btn');
    breakModeBtnEl = document.getElementById('break-mode-btn');

    // 2. Initial Setup
    // Ensure pomodoro is the initial mode
    setMode('pomodoro'); 

    // 3. Attach listeners
    if (startPauseBtnEl) startPauseBtnEl.addEventListener('click', toggleStartPause);
    if (resetBtnEl) resetBtnEl.addEventListener('click', resetTimer);
    
    if (pomodoroModeBtnEl) {
        pomodoroModeBtnEl.addEventListener('click', () => setMode('pomodoro'));
    }
    if (breakModeBtnEl) {
        breakModeBtnEl.addEventListener('click', () => setMode('break'));
    }
    
    // Add event listeners to change mode on click, but not while running
    const modeButtons = document.querySelectorAll('.d-flex.justify-content-center button');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!isRunning) {
                setMode(this.dataset.mode);
            }
        });
    });
}

export function cleanup() {
    // Stop the interval on cleanup
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Remove listeners
    if (startPauseBtnEl) startPauseBtnEl.removeEventListener('click', toggleStartPause);
    if (resetBtnEl) resetBtnEl.removeEventListener('click', resetTimer);
    if (pomodoroModeBtnEl) pomodoroModeBtnEl.removeEventListener('click', () => setMode('pomodoro'));
    if (breakModeBtnEl) breakModeBtnEl.removeEventListener('click', () => setMode('break'));
    
    // Clean up document title
    document.title = 'Tools Portfolio'; 
    isRunning = false;
    currentMode = 'pomodoro';
}