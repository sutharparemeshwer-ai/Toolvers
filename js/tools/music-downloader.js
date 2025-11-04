// js/tools/music-downloader.js

// --- Configuration ---
// 🚨 IMPORTANT: Get your free API key from https://freesound.org/docs/api/authentication.html and replace 'YOUR_API_KEY'
const FREESOUND_API_KEY = "GOmKdVpiFnZ7oAnKqI5Kfy0laMHssbh3gAFtp7Fn";
const API_ENDPOINT = "https://freesound.org/apiv2/search/text/";

// --- DOM Elements ---
let searchInput, searchBtn, statusEl, resultsList;

// --- State ---
let currentAudio = null;

/**
 * Displays a status message to the user.
 * @param {string} message - The text to display.
 * @param {boolean} isError - If true, formats the message as an error.
 */
function showStatus(message, isError = false) {
  resultsList.innerHTML = "";
  statusEl.innerHTML = `<p class="my-0 ${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
}

/**
 * Renders the list of music tracks.
 * @param {Array} tracks - An array of track objects from the Freesound API.
 */
function renderTracks(tracks) {
  resultsList.innerHTML = "";
  statusEl.innerHTML = "";

  if (tracks.length === 0) {
    showStatus("No music found for your search term.", true);
    return;
  }

  tracks.forEach((track) => {
    const trackElement = document.createElement("div");
    trackElement.className =
      "list-group-item d-flex justify-content-between align-items-center";
    const duration = Math.round(track.duration);
    trackElement.innerHTML = `
            <div>
                <h6 class="mb-1">${track.name}</h6>
                <small class="">Duration: ${Math.floor(
                  duration / 60
                )}:${String(duration % 60).padStart(2, "0")} | User: ${
      track.username
    }</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary play-pause-btn" data-src="${
                  track.previews["preview-hq-mp3"]
                }">
                    <i class="fa-solid fa-play"></i>
                </button>
                <a href="${track.download}" download="${
      track.name
    }.mp3" class="btn btn-sm btn-outline-success ms-2" title="Download">
                    <i class="fa-solid fa-download"></i>
                </a>
            </div>
        `;
    resultsList.appendChild(trackElement);
  });
}

/**
 * Handles the search functionality.
 */
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  if (FREESOUND_API_KEY === "YOUR_API_KEY") {
    showStatus(
      "Please add your Freesound API key to js/tools/music-downloader.js to use this tool.",
      true
    );
    return;
  }

  showStatus("Searching for sounds...");

  try {
    // Freesound API requires the token in the Authorization header
    const response = await fetch(
      `${API_ENDPOINT}?query=${encodeURIComponent(
        query
      )}&fields=id,name,previews,duration,username,download&token=${FREESOUND_API_KEY}`
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    renderTracks(data.results);
  } catch (error) {
    console.error("Music search failed:", error);
    showStatus(`Error: ${error.message}`, true);
  }
}

/**
 * Handles play/pause button clicks.
 */
function handlePlayPause(event) {
  const button = event.target.closest(".play-pause-btn");
  if (!button) return;

  const audioSrc = button.dataset.src;

  if (currentAudio && currentAudio.src === audioSrc && !currentAudio.paused) {
    currentAudio.pause();
    button.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    if (currentAudio) currentAudio.pause();
    document
      .querySelectorAll(".play-pause-btn")
      .forEach((btn) => (btn.innerHTML = '<i class="fa-solid fa-play"></i>'));

    currentAudio = new Audio(audioSrc);
    currentAudio.play();
    button.innerHTML = '<i class="fa-solid fa-pause"></i>';
    currentAudio.onended = () =>
      (button.innerHTML = '<i class="fa-solid fa-play"></i>');
  }
}

// --- Router Hooks ---

export function init() {
  searchInput = document.getElementById("music-search-input");
  searchBtn = document.getElementById("music-search-btn");
  statusEl = document.getElementById("music-status");
  resultsList = document.getElementById("music-results-list");

  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && handleSearch()
  );
  resultsList.addEventListener("click", handlePlayPause);
}

export function cleanup() {
  if (currentAudio) currentAudio.pause();
  currentAudio = null;
}
