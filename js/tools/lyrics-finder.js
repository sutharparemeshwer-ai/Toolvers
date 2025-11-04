// js/tools/lyrics-finder.js

// --- DOM Elements ---
let searchForm,
  artistInput,
  songTitleInput,
  statusEl,
  resultContainer,
  lyricsOutput;
let artistSuggestions, songSuggestions;

// --- API ---
const API_BASE_URL = "https://api.lyrics.ovh/v1/";
const API_SUGGEST_URL = "https://api.lyrics.ovh/suggest/";

// --- State ---
let debounceTimer;

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultContainer.classList.add("d-none");
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function showLyrics(lyrics) {
  statusEl.classList.add("d-none");
  lyricsOutput.textContent = lyrics;
  resultContainer.classList.remove("d-none");
}

/**
 * Renders suggestions in a dropdown.
 * @param {Array} suggestionsData - Array of suggestion objects from the API.
 * @param {HTMLElement} dropdownElement - The dropdown element to populate.
 */
function renderSuggestions(suggestionsData, dropdownElement) {
  dropdownElement.innerHTML = "";
  if (!suggestionsData || suggestionsData.length === 0) {
    dropdownElement.classList.remove("show");
    return;
  }

  suggestionsData.slice(0, 5).forEach((suggestion) => {
    const item = document.createElement("a");
    item.href = "#";
    item.className = "list-group-item list-group-item-action";
    item.innerHTML = `<strong>${suggestion.title}</strong><br><small>${suggestion.artist.name}</small>`;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      artistInput.value = suggestion.artist.name;
      songTitleInput.value = suggestion.title;
      artistSuggestions.classList.remove("show");
      songSuggestions.classList.remove("show");
      searchForm.requestSubmit(); // Automatically submit the form
    });
    dropdownElement.appendChild(item);
  });

  dropdownElement.classList.add("show");
}

/**
 * Fetches suggestions from the API.
 * @param {string} query - The search term.
 */
async function fetchSuggestions(query) {
  if (query.length < 2) {
    artistSuggestions.classList.remove("show");
    songSuggestions.classList.remove("show");
    return;
  }

  try {
    const response = await fetch(
      `${API_SUGGEST_URL}${encodeURIComponent(query)}`
    );
    if (!response.ok) return;
    const data = await response.json();

    // Determine which input is active to show the dropdown
    if (document.activeElement === artistInput) {
      renderSuggestions(data.data, artistSuggestions);
    } else if (document.activeElement === songTitleInput) {
      renderSuggestions(data.data, songSuggestions);
    }
  } catch (error) {
    console.error("Suggestion fetch error:", error);
  }
}

// --- Event Handlers & API Call ---

async function handleSearch(event) {
  event.preventDefault();
  const artist = artistInput.value.trim();
  const title = songTitleInput.value.trim();

  if (!artist || !title) {
    showStatus("Please enter both an artist and a song title.", true);
    return;
  }

  showStatus("Searching for lyrics...");

  try {
    const response = await fetch(
      `${API_BASE_URL}${encodeURIComponent(artist)}/${encodeURIComponent(
        title
      )}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Lyrics not found for this song. Please check the spelling."
        );
      } else {
        throw new Error(`API Error: ${response.statusText}`);
      }
    }

    const data = await response.json();
    showLyrics(data.lyrics || "No lyrics found for this song.");
  } catch (error) {
    console.error("Lyrics Fetch Error:", error);
    showStatus(error.message, true);
  }
}

function handleInput(event) {
  clearTimeout(debounceTimer);
  const query = event.target.value.trim();
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300); // 300ms delay
}

function hideSuggestions() {
  setTimeout(() => {
    // Timeout allows click event on suggestion to fire first
    artistSuggestions.classList.remove("show");
    songSuggestions.classList.remove("show");
  }, 150);
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("lyrics-search-form");
  artistInput = document.getElementById("artist-input");
  songTitleInput = document.getElementById("song-title-input");
  statusEl = document.getElementById("lyrics-status");
  resultContainer = document.getElementById("lyrics-result-container");
  lyricsOutput = document.getElementById("lyrics-output");
  artistSuggestions = document.getElementById("artist-suggestions");
  songSuggestions = document.getElementById("song-suggestions");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
  artistInput.addEventListener("input", handleInput);
  songTitleInput.addEventListener("input", handleInput);

  // Hide suggestions when focus is lost
  artistInput.addEventListener("blur", hideSuggestions);
  songTitleInput.addEventListener("blur", hideSuggestions);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) {
    searchForm.removeEventListener("submit", handleSearch);
  }
  if (artistInput) artistInput.removeEventListener("input", handleInput);
  if (songTitleInput) songTitleInput.removeEventListener("input", handleInput);
}
