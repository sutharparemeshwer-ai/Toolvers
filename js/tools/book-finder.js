// js/tools/book-finder.js

// --- DOM Elements ---
let searchForm, searchInput, statusEl, resultsContainer;

// --- API ---
const API_SEARCH_URL = "https://openlibrary.org/search.json";
const COVER_BASE_URL = "https://covers.openlibrary.org/b/id/";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.innerHTML = "";
  statusEl.innerHTML = `<p class="${
    isError ? "text-danger" : ""
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function renderBooks(books) {
  statusEl.classList.add("d-none");
  resultsContainer.innerHTML = "";

  if (!books || books.length === 0) {
    showStatus("No books found for your search.", true);
    return;
  }

  books.forEach((book) => {
    const coverUrl = book.cover_i
      ? `${COVER_BASE_URL}${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/180x270.png?text=No+Cover";

    const authorName = book.author_name?.[0] || "Unknown Author";
    const publishYear = book.first_publish_year || "N/A";

    const col = document.createElement("div");
    col.className = "col";
    // Make the entire card a clickable link for better UX
    col.innerHTML = `
            <a href="https://openlibrary.org${book.key}" target="_blank" class="card h-100 text-decoration-none text-white">
                <div class="book-card-img-container">
                    <img src="${coverUrl}" class="card-img-top" alt="Cover of ${book.title}">
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title flex-grow-1">${book.title}</h6>
                    <p class="card-text small  mb-0">by ${authorName}</p>
                    <p class="card-text small ">First published: ${publishYear}</p>
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

  showStatus("Searching for books...");

  const searchUrl = `${API_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=20`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    renderBooks(data.docs);
  } catch (error) {
    console.error("Book Search Error:", error);
    showStatus(`Failed to fetch book data. ${error.message}`, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("book-search-form");
  searchInput = document.getElementById("book-search-input");
  statusEl = document.getElementById("book-status");
  resultsContainer = document.getElementById("book-results-container");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) {
    searchForm.removeEventListener("submit", handleSearch);
  }
}
