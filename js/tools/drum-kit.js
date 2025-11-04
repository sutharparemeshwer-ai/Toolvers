// js/tools/drum-kit.js

const DRUM_SOUNDS = [
    // 💡 FIX: Changed file extensions from .wav to .mp3
    { key: 65, name: 'kick', file: 'kick.mp3' },    // A
    { key: 83, name: 'snare', file: 'snare.mp3' },  // S
    { key: 68, name: 'crash', file: 'crash.mp3' },  // D
    { key: 70, name: 'hihat-open', file: 'hihat-open.mp3' }, // F
    { key: 71, name: 'hihat-closed', file: 'hihat-closed.mp3' }, // G
    { key: 72, name: 'tom', file: 'tom.mp3' }       // H
];

let audioContainer;
let drumPads;
let audioElements = {}; // To store the loaded Audio objects

// --- Core Logic Functions ---

function playSound(key) {
    const audio = audioElements[key];
    const pad = document.querySelector(`.drum-pad[data-key="${key}"]`);

    if (!audio || !pad) return;

    // 1. Play the sound
    // Resetting currentTime allows the sound to be played multiple times quickly
    audio.currentTime = 0; 
    audio.play();

    // 2. Add visual feedback
    pad.classList.add('playing');
}

function removeTransition(e) {
    // Remove the 'playing' class only after the CSS transition finishes
    if (e.propertyName !== 'transform') return;
    this.classList.remove('playing');
}

// --- Event Handlers ---

function handleKeydown(e) {
    // We check for key down events globally, but we only react if the key is a drum key.
    const key = e.keyCode;
    
    // Find if the pressed key is a defined drum key
    if (DRUM_SOUNDS.some(sound => sound.key === key)) {
        // Prevent default browser action (like scrolling if spacebar was used in a game)
        e.preventDefault(); 
        playSound(key);
    }
}

function handlePadClick(e) {
    const pad = e.currentTarget;
    const key = parseInt(pad.dataset.key);
    playSound(key);
}

// --- Initialization and Cleanup ---

function loadAudio() {
    audioContainer = document.getElementById('audio-container');
    if (!audioContainer) return;

    DRUM_SOUNDS.forEach(sound => {
        // Create audio element
        const audio = document.createElement('audio');
        
        // Use the .mp3 file name
        audio.src = `assets/audio/${sound.file}`; 
        
        // 💡 FIX: Set the audio type to mp3
        audio.type = 'audio/mp3'; 
        
        audio.preload = 'auto';
        
        audioContainer.appendChild(audio);
        audioElements[sound.key] = audio;
    });
}


export function init() {
    // 1. Load audio files
    loadAudio();
    
    // 2. Get DOM elements and attach click listeners
    drumPads = document.querySelectorAll('.drum-pad');
    
    drumPads.forEach(pad => {
        pad.addEventListener('click', handlePadClick);
        // Add listener for CSS transition end to remove 'playing' class
        pad.addEventListener('transitionend', removeTransition); 
    });

    // 3. Attach keyboard listener to the whole document
    document.addEventListener('keydown', handleKeydown);
}

export function cleanup() {
    // 1. Remove keyboard listener
    document.removeEventListener('keydown', handleKeydown);

    // 2. Remove click and transition listeners
    if (drumPads) {
        drumPads.forEach(pad => {
            pad.removeEventListener('click', handlePadClick);
            pad.removeEventListener('transitionend', removeTransition);
            pad.classList.remove('playing'); // Ensure no lingering styles
        });
    }

    // 3. Clear audio elements
    if (audioContainer) {
        audioContainer.innerHTML = '';
        audioElements = {};
    }
}