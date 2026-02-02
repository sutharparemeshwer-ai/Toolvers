// js/tools/music-downloader.js

// --- Configuration ---
const FREESOUND_API_KEY = "GOmKdVpiFnZ7oAnKqI5Kfy0laMHssbh3gAFtp7Fn";
const API_ENDPOINT = "https://freesound.org/apiv2/search/text/";

let searchInput, searchBtn, statusEl, resultsList, visualizer, titleEl;
let currentAudio = null;

function showStatus(message, isError = false) {
  resultsList.innerHTML = "";
  statusEl.innerHTML = `<p class="my-0 ${
    isError ? "text-danger" : "text-secondary"
  }">${message}</p>`;
}

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
      "list-group-item d-flex justify-content-between align-items-center bg-transparent border-bottom border-white-10 text-white";
    const duration = Math.round(track.duration);
    trackElement.innerHTML = `
            <div>
                <h6 class="mb-1 fw-bold">${track.name}</h6>
                <small class="text-secondary">Time: ${Math.floor(
                  duration / 60
                )}:${String(duration % 60).padStart(2, "0")} | By: ${
      track.username
    }</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary play-pause-btn" data-src="${
                  track.previews["preview-hq-mp3"]
                }" data-title="${track.name}">
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

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  if (FREESOUND_API_KEY === "YOUR_API_KEY") {
    showStatus("API Key Missing", true);
    return;
  }

  showStatus("Searching for sounds...");

  try {
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

function handlePlayPause(event) {
  const button = event.target.closest(".play-pause-btn");
  if (!button) return;

  const audioSrc = button.dataset.src;
  const trackTitle = button.dataset.title;

  if (currentAudio && currentAudio.src === audioSrc && !currentAudio.paused) {
    currentAudio.pause();
    button.innerHTML = '<i class="fa-solid fa-play"></i>';
    visualizer.classList.add('d-none');
  } else {
    if (currentAudio) currentAudio.pause();
    document
      .querySelectorAll(".play-pause-btn")
      .forEach((btn) => (btn.innerHTML = '<i class="fa-solid fa-play"></i>'));

    currentAudio = new Audio(audioSrc);
    currentAudio.play();
    button.innerHTML = '<i class="fa-solid fa-pause"></i>';
    
    // Show Visualizer
    visualizer.classList.remove('d-none');
    titleEl.textContent = trackTitle;

    currentAudio.onended = () => {
      button.innerHTML = '<i class="fa-solid fa-play"></i>';
      visualizer.classList.add('d-none');
    };
  }
}

export function init() {
  searchInput = document.getElementById("music-search-input");
  searchBtn = document.getElementById("music-search-btn");
  statusEl = document.getElementById("music-status");
  resultsList = document.getElementById("music-results-list");
  visualizer = document.getElementById("visualizer-container");
  titleEl = document.getElementById("now-playing-title");

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