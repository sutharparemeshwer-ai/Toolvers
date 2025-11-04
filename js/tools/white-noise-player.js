// js/tools/white-noise-player.js

// --- DOM Elements ---
let soundButtonsContainer,
  playPauseBtn,
  volumeSlider,
  audioPlayer,
  currentSoundDisplay;

// --- State ---
let isPlaying = false;
let currentSound = null;

const SOUND_SOURCES = {
  rain: { src: "assets/audio/rain.mp3", name: "Rain" },
  forest: { src: "assets/audio/forest.mp3", name: "Forest" },
};

// --- Core Functions ---

function playAudio() {
  if (!currentSound) return;
  isPlaying = true;
  audioPlayer.play().catch((e) => console.error("Audio play failed:", e));
  playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

function pauseAudio() {
  isPlaying = false;
  audioPlayer.pause();
  playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function selectSound(soundKey) {
  currentSound = soundKey;
  const soundData = SOUND_SOURCES[soundKey];

  currentSoundDisplay.textContent = `Playing: ${soundData.name}`;
  audioPlayer.src = soundData.src;
  playPauseBtn.disabled = false;

  // Update active button style
  document.querySelectorAll(".sound-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.sound === soundKey) {
      btn.classList.add("active");
    }
  });

  playAudio();
}

// --- Event Handlers ---

function handleSoundButtonClick(event) {
  const button = event.target.closest(".sound-btn");
  if (!button) return;

  const soundKey = button.dataset.sound;
  if (soundKey !== currentSound) {
    selectSound(soundKey);
  }
}

function handlePlayPauseClick() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function handleVolumeChange() {
  audioPlayer.volume = volumeSlider.value;
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  soundButtonsContainer = document.getElementById("sound-buttons-container");
  playPauseBtn = document.getElementById("play-pause-btn");
  volumeSlider = document.getElementById("volume-slider");
  audioPlayer = document.getElementById("audio-player");
  currentSoundDisplay = document.getElementById("current-sound-display");

  // Set initial volume
  audioPlayer.volume = volumeSlider.value;

  // Attach event listeners
  soundButtonsContainer.addEventListener("click", handleSoundButtonClick);
  playPauseBtn.addEventListener("click", handlePlayPauseClick);
  volumeSlider.addEventListener("input", handleVolumeChange);
}

export function cleanup() {
  // Stop audio and remove listeners
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.src = "";
  }
  if (soundButtonsContainer) {
    soundButtonsContainer.removeEventListener("click", handleSoundButtonClick);
  }
  if (playPauseBtn) {
    playPauseBtn.removeEventListener("click", handlePlayPauseClick);
  }
  if (volumeSlider) {
    volumeSlider.removeEventListener("input", handleVolumeChange);
  }
  isPlaying = false;
  currentSound = null;
}
