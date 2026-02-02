// js/tools/drum-kit.js

const SOUNDS = {
    65: 'kick',
    83: 'snare',
    68: 'crash',
    70: 'hihat-closed',
    71: 'hihat-open',
    72: 'tom'
};

const audioPool = {};

function loadAudio() {
    Object.keys(SOUNDS).forEach(key => {
        const audio = new Audio(`assets/audio/${SOUNDS[key]}.mp3`);
        audio.preload = 'auto';
        audioPool[key] = audio;
    });
}

function play(key) {
    const pad = document.querySelector(`.beat-pad[data-key="${key}"]`);
    const audio = audioPool[key];
    
    if(!pad || !audio) return;

    // Reset and play
    audio.currentTime = 0;
    audio.play();

    // Visuals
    pad.classList.add('playing');
    setTimeout(() => pad.classList.remove('playing'), 100);
}

function handleKey(e) {
    if(SOUNDS[e.keyCode]) {
        play(e.keyCode);
    }
}

function handleClick(e) {
    const key = e.currentTarget.dataset.key;
    play(parseInt(key));
}

export function init() {
    loadAudio();
    document.addEventListener('keydown', handleKey);
    document.querySelectorAll('.beat-pad').forEach(pad => {
        pad.addEventListener('click', handleClick);
    });
}

export function cleanup() {
    document.removeEventListener('keydown', handleKey);
}
