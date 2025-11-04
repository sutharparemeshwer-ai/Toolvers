// js/tools/drug-recall-finder.js

// --- DOM Elements ---
let searchForm, searchInput, statusEl, resultsContainer;

// --- API ---
const API_BASE_URL = "https://api.fda.gov/drug/enforcement.json";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.innerHTML = "";
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function renderRecalls(recalls) {
  statusEl.classList.add("d-none");
  resultsContainer.innerHTML = "";

  if (!recalls || recalls.length === 0) {
    showStatus("No recent recalls found for this product.", true);
    return;
  }

  recalls.forEach((recall) => {
    const item = document.createElement("div");
    item.className = "list-group-item flex-column align-items-start";

    const recallDate = new Date(
      recall.recall_initiation_date
    ).toLocaleDateString();

    item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${recall.product_description}</h5>
                <small>Recalled on: ${recallDate}</small>
            </div>
            <p class="mb-1"><strong>Reason for Recall:</strong> ${recall.reason_for_recall}</p>
            <small><strong>Recalling Firm:</strong> ${recall.recalling_firm}</small><br>
            <small><strong>Classification:</strong> ${recall.classification}</small>
        `;
    resultsContainer.appendChild(item);
  });
}

// --- Event Handlers & API Call ---

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  showStatus("Searching for recalls...");

  // The API searches for terms within the product_description field.
  const searchUrl = `${API_BASE_URL}?search=product_description:"${query}"&limit=25`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    renderRecalls(data.results);
  } catch (error) {
    console.error("Recall Fetch Error:", error);
    showStatus(`Failed to fetch recall data. ${error.message}`, true);
  }
}

// --- Router Hooks ---

export function init() {
  searchForm = document.getElementById("recall-search-form");
  searchInput = document.getElementById("drug-search-input");
  statusEl = document.getElementById("recall-status");
  resultsContainer = document.getElementById("recall-results-container");

  searchForm.addEventListener("submit", handleSearch);
}

export function cleanup() {
  if (searchForm) searchForm.removeEventListener("submit", handleSearch);
}
