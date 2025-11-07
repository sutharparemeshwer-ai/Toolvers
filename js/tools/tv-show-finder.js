// js/tools/tv-show-finder.js

// --- DOM Elements ---
let searchForm, searchInput, statusEl, resultsContainer;

// --- API ---
const API_SEARCH_URL = "https://api.tvmaze.com/search/shows?q=";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.innerHTML = "";
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function renderShows(shows) {
  statusEl.classList.add("d-none");
  resultsContainer.innerHTML = "";

  if (!shows || shows.length === 0) {
    showStatus("No TV shows found for your search.", true);
    return;
  }

  shows.forEach((result) => {
    const show = result.show;
    const imageUrl =
      show.image?.medium ||
      "https://via.placeholder.com/210x295.png?text=No+Image";
    const rating = show.rating?.average
      ? `<span class="badge bg-warning text-dark">⭐ ${show.rating.average}</span>`
      : "";

    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
            <a href="${
              show.url
            }" target="_blank" class="card h-100 text-decoration-none text-white">
                <div class="tv-show-card-img-container">
                    <img src="${imageUrl}" class="card-img-top" alt="Poster for ${
      show.name
    }">
                </div>
                <div class="card-body bg-dark d-flex flex-column">
                    <h6 class="card-title flex-grow-1">${show.name}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-primary">${
                          show.genres.join(", ") || "N/A"
                        }</span>
                        ${rating}
                    </div>
                </div>
            </a>
        `;
    resultsContainer.appendChild(col);
  });
}

// --- Event Handlers & API Call ---

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  showStatus("Searching for TV shows...");

  const searchUrl = `${API_SEARCH_URL}${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    renderShows(data);
  } catch (error) {
    console.error("TV Show Search Error:", error);
    showStatus(`Failed to fetch TV show data. ${error.message}`, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("tv-search-form");
  searchInput = document.getElementById("tv-search-input");
  statusEl = document.getElementById("tv-status");
  resultsContainer = document.getElementById("tv-results-container");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) {
    searchForm.removeEventListener("submit", handleSearch);
  }
}
