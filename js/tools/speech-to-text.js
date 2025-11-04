// js/tools/speech-to-text-app.js

// DOM Elements
let startBtnEl, stopBtnEl, transcriptOutputEl, statusMessageEl, apiSupportAlertEl, clearBtnEl;

// Web Speech API Variables
let recognition = null;
let isListening = false;

// --- API Initialization ---

/**
 * Checks for API support and initializes the recognition object.
 */
function initializeRecognition() {
    // Check for browser support of the Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        apiSupportAlertEl.classList.remove('d-none');
        startBtnEl.disabled = true;
        statusMessageEl.textContent = 'Browser not supported.';
        return;
    }

    // Create the recognition object
    recognition = new SpeechRecognition();
    
    // Configure settings
    recognition.continuous = true; // Keep listening after a pause
    recognition.interimResults = true; // Get results while the user is speaking
    recognition.lang = 'en-US'; // Set language

    // --- Event Listeners for Recognition ---

    recognition.onstart = function() {
        isListening = true;
        startBtnEl.classList.add('listening', 'd-none');
        stopBtnEl.classList.remove('d-none');
        statusMessageEl.textContent = 'Listening... Speak clearly into your microphone.';
        statusMessageEl.classList.remove('text-muted');
        statusMessageEl.classList.add('text-success', 'fw-bold');
    };

    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Append final transcript to the output area
        if (finalTranscript) {
            transcriptOutputEl.value += finalTranscript;
        }
        
        // Display interim results separately, or update the status for real-time feedback
        statusMessageEl.textContent = 'Listening... (' + interimTranscript.trim() + ')';
    };

    recognition.onerror = function(event) {
        console.error('Speech Recognition Error:', event.error);
        statusMessageEl.textContent = `Error: ${event.error}. Click Start again.`;
        statusMessageEl.classList.remove('text-success', 'fw-bold');
        statusMessageEl.classList.add('text-danger');
        
        // Stop listening and reset controls on error
        stopListening(); 
    };

    recognition.onend = function() {
        // This event fires when recognition stops, either manually or due to an error/timeout.
        // We just need to ensure the UI is reset to the "stopped" state.
        isListening = false;
        startBtnEl.classList.remove('listening', 'd-none');
        stopBtnEl.classList.add('d-none');
        statusMessageEl.textContent = 'Stopped. Click "Start Listening" to begin again.';
    };
}

// --- Control Functions ---

/**
 * Starts the speech recognition process.
 */
function startListening() {
    if (recognition && !isListening) {
        transcriptOutputEl.focus(); // Focus on textarea for better UX
        recognition.start();
    }
}

/**
 * Stops the speech recognition process.
 */
function stopListening() {
    // This will trigger the 'onend' event handler.
    if (recognition && isListening) {
        isListening = false;
        recognition.stop();
        startBtnEl.classList.remove('listening', 'd-none');
        stopBtnEl.classList.add('d-none');
    }
}

/**
 * Clears the output area.
 */
function clearTranscript() {
    transcriptOutputEl.value = '';
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    startBtnEl = document.getElementById('start-btn');
    stopBtnEl = document.getElementById('stop-btn');
    transcriptOutputEl = document.getElementById('transcript-output');
    statusMessageEl = document.getElementById('status-message');
    apiSupportAlertEl = document.getElementById('api-support-alert');
    clearBtnEl = document.getElementById('clear-btn');
    
    // 2. Initialize API
    initializeRecognition();

    // 3. Attach listeners
    if (startBtnEl) startBtnEl.addEventListener('click', startListening);
    if (stopBtnEl) stopBtnEl.addEventListener('click', stopListening);
    if (clearBtnEl) clearBtnEl.addEventListener('click', clearTranscript);
}

export function cleanup() {
    // 1. Ensure recognition is stopped
    stopListening();
    
    // 2. Remove listeners
    if (startBtnEl) startBtnEl.removeEventListener('click', startListening);
    if (stopBtnEl) stopBtnEl.removeEventListener('click', stopListening);
    if (clearBtnEl) clearBtnEl.removeEventListener('click', clearTranscript);

    // 3. Cleanup state
    isListening = false;
    recognition = null;
}