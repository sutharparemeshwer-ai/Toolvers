// js/tools/gif-generator.js

// --- IMPORTANT ---
// You need a Tenor API key for this tool to work.
// Get one for free from the Google Cloud Console: https://developers.google.com/tenor/guides/quickstart
const API_KEY = "AIzaSyAOyGGJS5plhUuEXfB_e3f8LzvsWkJOXNQ"; // <-- PASTE YOUR API KEY HERE

const TRENDING_URL = `https://tenor.googleapis.com/v2/trending?key=${API_KEY}&limit=24&media_filter=minimal`;
const SEARCH_URL_BASE = `https://tenor.googleapis.com/v2/search?key=${API_KEY}&limit=24&media_filter=minimal`;

// --- DOM Elements ---
let searchInput, searchBtn, resultsContainer, messageEl;

// --- Helper Functions ---

/**
 * Renders a message in the results container.
 * @param {string} text - The message to display.
 * @param {boolean} isError - If true, formats the message as an error.
 */
function showMessage(text, isError = false) {
  resultsContainer.innerHTML = `<div class="text-center text-muted col-12">
                                    <p class="${
                                      isError ? "text-danger" : "text-muted"
                                    }">${text}</p>
                                </div>`;
}

/**
 * Renders an array of GIF objects into the results container.
 * @param {Array} gifs - The array of GIF data from the Giphy API.
 */
function renderGifs(gifs) {
  resultsContainer.innerHTML = ""; // Clear previous results or messages
  if (gifs.length === 0) {
    showMessage("No GIFs found for that search. Try another term!", false);
    return;
  }

  gifs.forEach((gif) => {
    const gifUrl = gif.media_formats.gif.url;
    const col = document.createElement("div");
    col.className = "col-6 col-sm-4 col-md-3";
    col.innerHTML = `
            <div class="gif-item" style="cursor: pointer;" title="Click to copy link">
                <img src="${gifUrl}" alt="${gif.content_description}" class="img-fluid rounded w-100" style="object-fit: cover; height: 150px;">
            </div>
        `;
    // Add click-to-copy functionality
    col.querySelector(".gif-item").addEventListener("click", () => {
      navigator.clipboard
        .writeText(gif.media_formats.gif.url)
        .then(() => {
          // Optional: Show a brief "Copied!" message
        })
        .catch((err) => console.error("Failed to copy GIF link", err));
    });
    resultsContainer.appendChild(col);
  });
}

/**
 * Fetches GIFs from the Giphy API.
 * @param {string} [query] - The search term. If empty, fetches trending GIFs.
 */
async function fetchGifs(query = "") {
  const url = query
    ? `${SEARCH_URL_BASE}&q=${encodeURIComponent(query)}`
    : TRENDING_URL;
  showMessage("Searching for GIFs...", false);

  if (API_KEY.trim() === "YOUR_TENOR_API_KEY" || API_KEY.includes(" ")) {
    showMessage(
      "Please add your Tenor API key to `js/tools/gif-generator.js` to use this tool.",
      true
    );
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    renderGifs(data.results);
  } catch (error) {
    console.error("Error fetching GIFs:", error);
    showMessage(
      "Failed to load GIFs. Please check your API key or network connection.",
      true
    );
  }
}

// --- Event Handlers ---

function handleSearch() {
  fetchGifs(searchInput.value.trim());
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchInput = document.getElementById("gif-search-input");
  searchBtn = document.getElementById("gif-search-btn");
  resultsContainer = document.getElementById("gif-results-container");
  messageEl = document.getElementById("gif-message");

  // Attach event listeners
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Fetch trending GIFs on initial load
  fetchGifs();
}

export function cleanup() {
  // Remove event listeners
  searchBtn.removeEventListener("click", handleSearch);
}
