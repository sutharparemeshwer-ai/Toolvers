// js/tools/news-headlines.js

// --- Configuration ---
// Using the same API key from the other news tool.
const API_KEY = "b4a3b397f3013023265ce522b9442824";
const API_BASE_URL = "https://gnews.io/api/v4/";
const CATEGORIES = [
  "general",
  "world",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
];

// --- DOM Elements ---
let categoryFilters, statusMessage, headlinesList;

// --- Helper Functions ---

function showMessage(message, isError = false) {
  headlinesList.innerHTML = "";
  statusMessage.innerHTML = `<div class="alert ${
    isError ? "alert-danger" : "alert-info"
  }">${message}</div>`;
  statusMessage.classList.remove("d-none");
}

function hideMessage() {
  statusMessage.classList.add("d-none");
}

/**
 * Renders the news headlines into the list.
 * @param {Array} articles - An array of article objects from the API.
 */
function renderHeadlines(articles) {
  headlinesList.innerHTML = "";
  if (!articles || articles.length === 0) {
    showMessage("No headlines found for this category.", true);
    return;
  }

  articles.forEach((article) => {
    const publishedDate = new Date(article.publishedAt).toLocaleDateString();
    const listItem = document.createElement("a");
    listItem.href = article.url;
    listItem.target = "_blank";
    listItem.rel = "noopener noreferrer";
    listItem.className =
      "list-group-item list-group-item-action flex-column align-items-start";

    listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${article.title}</h5>
                <small class="text-muted">${publishedDate}</small>
            </div>
            <p class="mb-1">${
              article.description || "No description available."
            }</p>
            <small class="">Source: ${article.source.name}</small>
        `;
    headlinesList.appendChild(listItem);
  });
}

/**
 * Renders the category filter buttons.
 */
function renderCategoryFilters() {
  categoryFilters.innerHTML = "";
  CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-secondary";
    if (category === CATEGORIES[0]) {
      button.classList.replace("btn-secondary", "btn-primary");
    }
    button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    button.dataset.category = category;
    categoryFilters.appendChild(button);
  });
}

// --- API & Event Handlers ---

async function fetchHeadlines(category = "general") {
  if (API_KEY === "YOUR_API_KEY") {
    showMessage(
      "Please add your GNews API key to 'js/tools/news-headlines.js' to use this tool.",
      true
    );
    return;
  }

  hideMessage();
  headlinesList.innerHTML =
    '<div class="spinner-border text-primary mx-auto" role="status"><span class="visually-hidden">Loading...</span></div>';

  const url = `${API_BASE_URL}top-headlines?category=${category}&lang=en&token=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    renderHeadlines(data.articles);
  } catch (error) {
    console.error("News Fetch Error:", error);
    showMessage(`Failed to fetch headlines: ${error.message}`, true);
  }
}

function handleCategoryClick(event) {
  const button = event.target.closest("button");
  if (!button || !button.dataset.category) return;

  const category = button.dataset.category;
  fetchHeadlines(category);

  categoryFilters
    .querySelectorAll("button")
    .forEach((btn) => btn.classList.replace("btn-primary", "btn-secondary"));
  button.classList.replace("btn-secondary", "btn-primary");
}

// --- Router Hooks ---

export function init() {
  categoryFilters = document.getElementById("news-category-filters");
  statusMessage = document.getElementById("news-status-message");
  headlinesList = document.getElementById("headlines-list");

  renderCategoryFilters();
  fetchHeadlines(CATEGORIES[0]);

  categoryFilters.addEventListener("click", handleCategoryClick);
}

export function cleanup() {
  categoryFilters.removeEventListener("click", handleCategoryClick);
}
