// js/tools/advice-finder.js

// --- DOM Elements ---
let searchForm, searchInput, randomBtn, statusEl, resultsContainer;

// --- API ---
const API_RANDOM_URL = "https://api.adviceslip.com/advice";
const API_SEARCH_URL = "https://api.adviceslip.com/advice/search/";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.innerHTML = "";
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function renderAdvice(slips) {
  statusEl.classList.add("d-none");
  resultsContainer.innerHTML = "";

  if (!slips || slips.length === 0) {
    showStatus("No advice found for that topic.", true);
    return;
  }

  slips.forEach((slip) => {
    const item = document.createElement("div");
    item.className = "list-group-item";
    item.textContent = slip.advice;
    resultsContainer.appendChild(item);
  });
}

// --- Event Handlers & API Call ---

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  showStatus("Searching for advice...");

  try {
    const response = await fetch(
      `${API_SEARCH_URL}${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    if (data.message) {
      // The API returns a message object on no results
      throw new Error(data.message.text);
    }
    renderAdvice(data.slips);
  } catch (error) {
    console.error("Advice Search Error:", error);
    showStatus(error.message, true);
  }
}

async function fetchRandomAdvice() {
  showStatus("Getting some random advice...");
  try {
    const response = await fetch(`${API_RANDOM_URL}?t=${Date.now()}`); // Add timestamp to prevent caching
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    renderAdvice([data.slip]); // Render it as an array of one
  } catch (error) {
    console.error("Random Advice Fetch Error:", error);
    showStatus(error.message, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("advice-search-form");
  searchInput = document.getElementById("advice-search-input");
  randomBtn = document.getElementById("random-advice-btn");
  statusEl = document.getElementById("advice-status");
  resultsContainer = document.getElementById("advice-results-container");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
  randomBtn.addEventListener("click", fetchRandomAdvice);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) searchForm.removeEventListener("submit", handleSearch);
  if (randomBtn) randomBtn.removeEventListener("click", fetchRandomAdvice);
}
