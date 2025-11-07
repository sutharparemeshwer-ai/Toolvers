// js/tools/rick-and-morty-finder.js

// --- DOM Elements ---
let searchForm, searchInput, statusEl, resultsContainer, paginationNav;
let prevBtn, nextBtn, pageInfoEl;

// --- API & State ---
const API_BASE_URL = "https://rickandmortyapi.com/api/character/";
let currentPageUrl = API_BASE_URL;
let prevPageUrl = null;
let nextPageUrl = null;

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.innerHTML = "";
  paginationNav.classList.add("d-none");
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function getStatusIndicator(status) {
  switch (status.toLowerCase()) {
    case "alive":
      return '<span class="badge bg-success">Alive</span>';
    case "dead":
      return '<span class="badge bg-danger">Dead</span>';
    default:
      return '<span class="badge bg-secondary">Unknown</span>';
  }
}

// --- Rendering ---

function renderCharacters(characters) {
  statusEl.classList.add("d-none");
  resultsContainer.innerHTML = "";

  if (!characters || characters.length === 0) {
    showStatus("No characters found for this search.", true);
    return;
  }

  characters.forEach((char) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
            <div class="card h-100">
                <img src="${char.image}" class="card-img-top" alt="${
      char.name
    }">
                <div class="card-body">
                    <h5 class="card-title">${char.name}</h5>
                    <p class="card-text small">
                        ${getStatusIndicator(char.status)}
                        <span class="ms-1">${char.species}</span>
                    </p>
                    <p class="card-text small">
                        Last seen on:<br>
                        <strong>${char.location.name}</strong>
                    </p>
                </div>
            </div>
        `;
    resultsContainer.appendChild(col);
  });
}

function updatePagination(info) {
  prevPageUrl = info.prev;
  nextPageUrl = info.next;

  paginationNav.classList.remove("d-none");

  document
    .getElementById("rm-prev-li")
    .classList.toggle("disabled", !info.prev);
  document
    .getElementById("rm-next-li")
    .classList.toggle("disabled", !info.next);

  // Extract page number from URL for display
  const urlParams = new URLSearchParams(currentPageUrl.split("?")[1]);
  const pageNum = urlParams.get("page") || 1;
  pageInfoEl.textContent = `Page ${pageNum} of ${info.pages}`;
}

// --- Event Handlers & API Call ---

async function fetchCharacters(url) {
  showStatus("Wubba lubba dub dub! Getting characters...");
  currentPageUrl = url;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404)
        throw new Error("No characters found for that search.");
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();
    renderCharacters(data.results);
    updatePagination(data.info);
  } catch (error) {
    console.error("Rick and Morty Fetch Error:", error);
    showStatus(error.message, true);
  }
}

function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  const searchUrl = `${API_BASE_URL}?name=${encodeURIComponent(query)}`;
  fetchCharacters(searchUrl);
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("rm-search-form");
  searchInput = document.getElementById("rm-search-input");
  statusEl = document.getElementById("rm-status");
  resultsContainer = document.getElementById("rm-results-container");
  paginationNav = document.getElementById("rm-pagination-nav");
  prevBtn = document.getElementById("rm-prev-btn");
  nextBtn = document.getElementById("rm-next-btn");
  pageInfoEl = document.getElementById("rm-page-info");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (prevPageUrl) fetchCharacters(prevPageUrl);
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (nextPageUrl) fetchCharacters(nextPageUrl);
  });

  // Initial fetch
  fetchCharacters(API_BASE_URL);
}

export function cleanup() {
  // Remove event listeners
  searchForm.removeEventListener("submit", handleSearch);
  // Other listeners are on elements that get removed, so no need to clean up
}
