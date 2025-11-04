// js/tools/meditation-timer.js

// --- DOM Elements ---
let displayEl,
  startPauseBtn,
  resetBtn,
  durationInput,
  startSoundCheck,
  endSoundCheck,
  startSound,
  endSound,
  ambientSoundSelect,
  ambientVolumeSlider,
  ambientSound;

// --- State ---
let timerInterval = null;
let totalDuration = 10 * 60; // Default 10 minutes in seconds
let currentTime = totalDuration;
let isRunning = false;

const AMBIENT_SOUNDS = {
  none: "",
  rain: "assets/audio/rain.mp3",
  forest: "assets/audio/forest.mp3",
  ocean: "assets/audio/ocean.mp3",
};

// --- Helper Functions ---

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function updateDisplay() {
  displayEl.textContent = formatTime(currentTime);
  document.title = `${formatTime(currentTime)} - Meditation Timer`;
}

function playSound(soundElement) {
  soundElement.currentTime = 0;
  soundElement.play().catch((e) => console.warn("Audio playback failed:", e));
}

// --- Timer Logic ---

function tick() {
  if (currentTime > 0) {
    currentTime--;
    updateDisplay();
  } else {
    // Timer finished
    clearInterval(timerInterval);
    isRunning = false;
    if (endSoundCheck.checked) {
      playSound(endSound);
    }
    ambientSound.pause();
    resetTimer();
    alert("Meditation session complete!");
  }
}

function toggleTimer() {
  // Handle ambient sound
  handleAmbientSound();

  if (isRunning) {
    // Pause
    clearInterval(timerInterval);
    isRunning = false;
    startPauseBtn.textContent = "Resume";
  } else {
    // Start or Resume
    if (currentTime === totalDuration && startSoundCheck.checked) {
      playSound(startSound);
    }
    isRunning = true;
    if (ambientSound.src && ambientSound.paused) {
      ambientSound.play();
    }
    startPauseBtn.textContent = "Pause";
    timerInterval = setInterval(tick, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  currentTime = totalDuration;
  ambientSound.pause();
  ambientSound.currentTime = 0;
  updateDisplay();
  startPauseBtn.textContent = "Start";
}

function handleDurationChange() {
  const newMinutes = parseInt(durationInput.value, 10);
  if (newMinutes > 0) {
    totalDuration = newMinutes * 60;
    if (!isRunning) {
      resetTimer();
    }
  }
}

function handleAmbientSound() {
  const selectedSound = ambientSoundSelect.value;
  const soundSrc = AMBIENT_SOUNDS[selectedSound];

  if (soundSrc) {
    if (ambientSound.src !== soundSrc) {
      ambientSound.src = soundSrc;
    }
    ambientSound.volume = ambientVolumeSlider.value;
  } else {
    ambientSound.pause();
    ambientSound.src = "";
  }
}

const handleVolumeChange = () =>
  (ambientSound.volume = ambientVolumeSlider.value);

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  displayEl = document.getElementById("meditation-timer-display");
  startPauseBtn = document.getElementById("meditation-start-pause-btn");
  resetBtn = document.getElementById("meditation-reset-btn");
  durationInput = document.getElementById("meditation-duration-input");
  startSoundCheck = document.getElementById("start-sound-check");
  endSoundCheck = document.getElementById("end-sound-check");
  startSound = document.getElementById("start-bell-sound");
  endSound = document.getElementById("end-bell-sound");
  ambientSoundSelect = document.getElementById("ambient-sound-select");
  ambientVolumeSlider = document.getElementById("ambient-volume-slider");
  ambientSound = document.getElementById("ambient-sound");

  // Initial setup
  handleDurationChange();
  handleAmbientSound();

  // Attach event listeners
  startPauseBtn.addEventListener("click", toggleTimer);
  resetBtn.addEventListener("click", resetTimer);
  durationInput.addEventListener("change", handleDurationChange);
  ambientSoundSelect.addEventListener("change", handleAmbientSound);
  ambientVolumeSlider.addEventListener("input", handleVolumeChange);
}

export function cleanup() {
  // Clear interval and remove listeners to prevent memory leaks
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (startPauseBtn) {
    startPauseBtn.removeEventListener("click", toggleTimer);
  }
  if (resetBtn) {
    resetBtn.removeEventListener("click", resetTimer);
  }
  if (durationInput) {
    durationInput.removeEventListener("change", handleDurationChange);
  }
  if (ambientSoundSelect) {
    ambientSoundSelect.removeEventListener("change", handleAmbientSound);
  }
  if (ambientVolumeSlider) {
    ambientVolumeSlider.removeEventListener("input", handleVolumeChange);
  }
  document.title = "Tools Portfolio"; // Reset document title
}
