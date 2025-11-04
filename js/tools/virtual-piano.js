// js/tools/virtual-piano.js

// Map keyboard keys to their corresponding note.
const KEY_TO_NOTE_MAP = {
  a: "C",
  s: "D",
  d: "E",
  f: "F",
  g: "G",
  h: "A",
  j: "B", // White keys
  w: "C#",
  e: "D#",
  t: "F#",
  y: "G#",
  u: "A#", // Black keys
};

// DOM Elements
let allKeys;
let sustainIndicator;

// Store preloaded audio elements for each note to prevent re-loading.
const audioNotes = {};

// --- State for Sustain Pedal ---
let isSustainOn = false;
// Keep track of which physical keys are currently held down.
const activePhysicalKeys = new Set();

// --- Core Logic ---

/**
 * Plays the note and updates the key visual.
 * @param {string} note - The note to play (e.g., 'C', 'D#').
 * @param {HTMLElement} keyElement - The DOM element for the key being played.
 */
function playNote(note, keyElement) {
  const audio = audioNotes[note];
  if (!audio) {
    console.warn(`Audio for note ${note} not found.`);
    return;
  }

  // Stop any currently playing sound for this note before restarting.
  // This prevents overlapping sounds if sustain is off.
  if (!isSustainOn) {
    audio.pause();
  }

  // 1. Rewind the audio to the start to allow for rapid key presses.
  audio.currentTime = 0;

  // 2. Play the sound
  audio
    .play()
    .catch((e) => console.warn("Audio playback failed (usually harmless):", e));

  // 3. Set Active State for Visual Feedback
  if (keyElement) {
    keyElement.classList.add("active");
    // For clicks, we remove the active class after a short delay.
    // For keyboard, it's handled by keyup.
    if (!activePhysicalKeys.size) {
      setTimeout(() => keyElement.classList.remove("active"), 150);
    }
  }
}

/**
 * Handles mouse click on a piano key.
 */
function handleKeyClick(e) {
  const note = e.currentTarget.dataset.note;
  playNote(note, e.currentTarget);
}

/**
 * Handles keyboard key press down.
 */
function handleKeyDown(e) {
  const key = e.key.toLowerCase();

  // Handle Sustain Pedal
  if (key === " " && !isSustainOn) {
    e.preventDefault();
    isSustainOn = true;
    sustainIndicator?.classList.add("active");
  }

  const noteToPlay = KEY_TO_NOTE_MAP[key];

  if (noteToPlay) e.preventDefault();
  const keyElement = document.querySelector(`.key[data-note="${noteToPlay}"]`);

  // Check if the key is already being held down to prevent re-triggering
  if (keyElement && !activePhysicalKeys.has(key)) {
    const note = keyElement.dataset.note;
    activePhysicalKeys.add(key);
    playNote(note, keyElement);
  } else if (keyElement) {
    keyElement.classList.add("active"); // Ensure visual stays active if held
  }
}

/**
 * Handles keyboard key release.
 */
function handleKeyUp(e) {
  const key = e.key.toLowerCase();

  // Handle Sustain Pedal
  if (key === " ") {
    e.preventDefault();
    isSustainOn = false;
    sustainIndicator?.classList.remove("active");
    // Stop all notes that are not currently being held down
    Object.keys(KEY_TO_NOTE_MAP).forEach((k) => {
      if (!activePhysicalKeys.has(k)) {
        const noteToStop = KEY_TO_NOTE_MAP[k];
        const audio = audioNotes[noteToStop];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });
  }

  const noteToPlay = KEY_TO_NOTE_MAP[key];
  const keyElement = document.querySelector(`.key[data-note="${noteToPlay}"]`);
  if (keyElement) {
    keyElement.classList.remove("active");
    activePhysicalKeys.delete(key);
    // If sustain is off, stop the note immediately
    if (!isSustainOn) {
      const audio = audioNotes[noteToPlay];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }
}

/**
 * Preloads all necessary piano note audio files into the `audioNotes` object.
 */
function preloadNotes() {
  const notesToLoad = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const audioContainer = document.getElementById("piano-audio-container");
  if (!audioContainer) return;

  audioContainer.innerHTML = ""; // Clear any previous audio elements

  notesToLoad.forEach((note) => {
    // Encode the '#' character in note names to '%23' to ensure the URL is valid.
    const encodedNote = note.replace("#", "%23");
    const audio = new Audio(`assets/sounds/piano/${encodedNote}.mp3`);
    audio.preload = "auto";
    audioNotes[note] = audio;
    audioContainer.appendChild(audio);
  });
}

// --- Router Hooks ---

export function init() {
  // 1. Get DOM elements
  allKeys = document.querySelectorAll(".key");
  sustainIndicator = document.getElementById("sustain-pedal-indicator");
  preloadNotes();

  // 2. Attach listeners for mouse clicks
  allKeys.forEach((key) => {
    key.addEventListener("click", handleKeyClick);
  });

  // 3. Attach listeners for keyboard input
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

export function cleanup() {
  // Remove listeners
  allKeys.forEach((key) => {
    key.removeEventListener("click", handleKeyClick);
  });
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // Clear preloaded audio
  const audioContainer = document.getElementById("piano-audio-container");
  if (audioContainer) {
    audioContainer.innerHTML = "";
  }
  Object.keys(audioNotes).forEach((key) => delete audioNotes[key]);
  // Clear state
  isSustainOn = false;
  activePhysicalKeys.clear();
}
