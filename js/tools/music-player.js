// js/tools/music-player.js

// --- DOM Elements ---
let searchInput, searchBtn, searchResultsList, searchMessage;

// --- API & State ---
// MusicBrainz API endpoint. Note: This API is for metadata, not audio streaming.
const API_URL_BASE =
  "https://musicbrainz.org/ws/2/recording?fmt=json&limit=25&query=";

// --- Core Functions ---

async function searchSongs(query) {
  if (!query) return;

  searchMessage.textContent = "Searching...";
  searchResultsList.innerHTML = "";

  try {
    // MusicBrainz requires a specific query format. We'll search by recording title.
    const response = await fetch(
      `${API_URL_BASE}recording:${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Network response was not ok.");
    const data = await response.json();

    if (data.recordings && data.recordings.length > 0) {
      renderSearchResults(data.recordings);
      searchMessage.textContent = `Showing results for "${query}"`;
    } else {
      searchMessage.textContent = `No results found for "${query}".`;
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    searchMessage.textContent = "Failed to fetch songs. Please try again.";
  }
}

function renderSearchResults(tracks) {
  searchResultsList.innerHTML = "";
  tracks.forEach((track, index) => {
    const item = document.createElement("a");
    // Link to the official MusicBrainz page for the recording
    item.href = `https://musicbrainz.org/recording/${track.id}`;
    item.target = "_blank"; // Open in a new tab
    item.rel = "noopener noreferrer";
    item.className =
      "list-group-item list-group-item-action d-flex align-items-center music-search-item";
    item.dataset.index = index;

    // Safely get artist name
    const artistName =
      track["artist-credit"] && track["artist-credit"][0]
        ? track["artist-credit"][0].name
        : "Unknown Artist";
    // Safely get album name from the first release
    const albumName =
      track.releases && track.releases[0]
        ? track.releases[0].title
        : "Unknown Album";

    item.innerHTML = `
            <i class="fa-solid fa-music me-3" style="width: 20px;"></i>
            <div class="flex-grow-1">
                <div class="fw-bold">${track.title}</div>
                <div class="small ">${artistName} - <em>${albumName}</em></div>
            </div>
            <span class="small ">${formatTime(track.length)}</span>
        `;
    searchResultsList.appendChild(item);
  });
}

// --- UI Update Functions ---

function formatTime(milliseconds) {
  if (isNaN(milliseconds)) return "N/A";
  const seconds = Math.floor(milliseconds / 1000);
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

// --- Event Handlers ---

function handleSearch() {
  searchSongs(searchInput.value.trim());
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchInput = document.getElementById("music-search-input");
  searchBtn = document.getElementById("music-search-btn");
  searchResultsList = document.getElementById("search-results-list");
  searchMessage = document.getElementById("search-message");

  // Attach event listeners
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });
}

export function cleanup() {
  // Remove listeners
  searchBtn?.removeEventListener("click", handleSearch);
}
