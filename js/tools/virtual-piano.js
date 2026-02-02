// js/tools/virtual-piano.js

const NOTES = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F', 
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B', 'k': 'C2'
};

const audioPool = {};

function loadAudio() {
    // Map note names to file names if different, assumes standard C.mp3 etc.
    const uniqueNotes = new Set(Object.values(NOTES));
    uniqueNotes.forEach(note => {
        // Fix sharp filenames (C# -> C_s.mp3 or similar depending on assets)
        // Assuming standard naming convention from previous tool analysis
        let file = note.replace('#', '%23'); // Encoding for URL
        if(note === 'C2') file = 'C'; // Fallback for high C if missing, or use high C sample
        
        const audio = new Audio(`assets/sounds/piano/${file}.mp3`);
        audioPool[note] = audio;
    });
}

function play(note) {
    const audio = audioPool[note];
    const key = document.querySelector(`.key[data-note="${note}"]`);
    
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
    
    if(key) {
        key.classList.add('active');
        setTimeout(() => key.classList.remove('active'), 150);
    }
}

function handleKey(e) {
    if(NOTES[e.key]) {
        play(NOTES[e.key]);
    }
}

export function init() {
    loadAudio();
    document.addEventListener('keydown', handleKey);
    
    document.querySelectorAll('.key').forEach(k => {
        k.addEventListener('mousedown', () => play(k.dataset.note));
    });
}

export function cleanup() {
    document.removeEventListener('keydown', handleKey);
}