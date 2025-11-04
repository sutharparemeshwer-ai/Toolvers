// js/tools/ai-powered-news-aggregator.js

// --- Configuration ---
// 🚨 IMPORTANT: Get your free API key from https://gnews.io/ and replace 'YOUR_API_KEY'
const API_KEY = 'b4a3b397f3013023265ce522b9442824';
const API_BASE_URL = 'https://gnews.io/api/v4/';
const CATEGORIES = ['general', 'world', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'];

// --- DOM Elements ---
let searchForm, searchInput, categoryFilters, statusMessage, articlesContainer;

// --- Helper Functions ---

function showMessage(message, isError = false) {
    articlesContainer.innerHTML = '';
    statusMessage.innerHTML = `<div class="alert ${isError ? 'alert-danger' : 'alert-info'}">${message}</div>`;
    statusMessage.classList.remove('d-none');
}

function hideMessage() {
    statusMessage.classList.add('d-none');
}

/**
 * Renders the news articles into the container.
 * @param {Array} articles - An array of article objects from the API.
 */
function renderArticles(articles) {
    articlesContainer.innerHTML = '';
    if (!articles || articles.length === 0) {
        showMessage('No articles found for this query.', true);
        return;
    }

    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'col-md-6 col-lg-4';

        const publishedDate = new Date(article.publishedAt).toLocaleString();
        const placeholderImage = 'https://via.placeholder.com/400x225/2c302f/FFFFFF?text=No+Image';

        articleCard.innerHTML = `
            <div class="card news-card h-100">
                <img src="${article.image || placeholderImage}" class="card-img-top" alt="${article.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text small text-muted">${article.source.name} &bull; ${publishedDate}</p>
                    <p class="card-text flex-grow-1">${article.description || 'No description available.'}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary mt-auto">Read More</a>
                </div>
            </div>
        `;
        articlesContainer.appendChild(articleCard);
    });
}

/**
 * Renders the category filter buttons.
 */
function renderCategoryFilters() {
    categoryFilters.innerHTML = '';
    CATEGORIES.forEach(category => {
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-secondary';
        // Make the first category the active one by default
        if (category === CATEGORIES[0]) {
            button.classList.replace('btn-secondary', 'btn-primary');
        }
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.dataset.category = category;
        categoryFilters.appendChild(button);
    });
}

// --- API & Event Handlers ---

async function fetchNews(query = '', category = '') {
    if (API_KEY === 'YOUR_API_KEY') {
        showMessage("Please add your GNews API key to 'js/tools/ai-powered-news-aggregator.js' to use this tool.", true);
        return;
    }

    hideMessage();
    articlesContainer.innerHTML = '<div class="spinner-border text-primary mx-auto" role="status"><span class="visually-hidden">Loading...</span></div>';

    let url = '';
    if (query) {
        url = `${API_BASE_URL}search?q=${encodeURIComponent(query)}&lang=en&token=${API_KEY}`;
    } else {
        url = `${API_BASE_URL}top-headlines?category=${category}&lang=en&token=${API_KEY}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        renderArticles(data.articles);
    } catch (error) {
        console.error('News Fetch Error:', error);
        showMessage(`Failed to fetch news: ${error.message}`, true);
    }
}

function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        fetchNews(query);
        // De-select category buttons when searching
        categoryFilters.querySelectorAll('button').forEach(btn => btn.classList.replace('btn-primary', 'btn-secondary'));
    }
}

function handleCategoryClick(event) {
    const button = event.target.closest('button');
    if (!button || !button.dataset.category) return;

    const category = button.dataset.category;
    fetchNews('', category);
    searchInput.value = ''; // Clear search input

    // Update active button style
    categoryFilters.querySelectorAll('button').forEach(btn => btn.classList.replace('btn-primary', 'btn-secondary'));
    button.classList.replace('btn-secondary', 'btn-primary');
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    searchForm = document.getElementById('news-search-form');
    searchInput = document.getElementById('news-search-input');
    categoryFilters = document.getElementById('news-category-filters');
    statusMessage = document.getElementById('news-status-message');
    articlesContainer = document.getElementById('news-articles-container');

    // Initial setup
    renderCategoryFilters();
    fetchNews('', CATEGORIES[0]); // Fetch news for the default category

    // Attach event listeners
    searchForm.addEventListener('submit', handleSearch);
    categoryFilters.addEventListener('click', handleCategoryClick);
}

export function cleanup() {
    // Remove event listeners
    searchForm.removeEventListener('submit', handleSearch);
    categoryFilters.removeEventListener('click', handleCategoryClick);
}