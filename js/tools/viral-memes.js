// js/tools/viral-memes.js

// --- Configuration ---
const API_BASE_URL = 'https://meme-api.com/gimme/';

// --- DOM Elements ---
let categoryFiltersEl, nextMemeBtn, statusEl, memeContentEl, memeTitleEl, memeImageEl, memeSourceLinkEl;

// --- State ---
let currentSubreddit = 'dankmemes'; // Default subreddit

// --- Helper Functions ---

function showStatus(message, isError = false) {
    memeContentEl.classList.add('d-none');
    statusEl.innerHTML = isError
        ? `<div class="alert alert-danger">${message}</div>`
        : `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">${message}</p>`;
    statusEl.classList.remove('d-none');
}

function hideStatus() {
    statusEl.classList.add('d-none');
    memeContentEl.classList.remove('d-none');
}

/**
 * Renders the fetched meme data into the UI.
 * @param {object} memeData - The meme data object from the API.
 */
function renderMeme(memeData) {
    if (!memeData.url) {
        showStatus('Received invalid meme data from the API.', true);
        return;
    }

    memeTitleEl.textContent = memeData.title;
    memeImageEl.src = memeData.url;
    memeImageEl.alt = memeData.title;
    memeSourceLinkEl.href = memeData.postLink;
    memeSourceLinkEl.textContent = `r/${memeData.subreddit}`;

    hideStatus();
}

// --- API & Event Handlers ---

async function fetchMeme() {
    showStatus(`Fetching a meme from r/${currentSubreddit}...`);
    nextMemeBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}${currentSubreddit}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
        }
        const data = await response.json();
        renderMeme(data);
    } catch (error) {
        console.error('Meme Fetch Error:', error);
        showStatus(`Failed to fetch meme: ${error.message}`, true);
    } finally {
        nextMemeBtn.disabled = false;
    }
}

function handleCategoryClick(event) {
    const button = event.target.closest('button');
    if (!button || !button.dataset.subreddit) return;

    // Update active button style
    categoryFiltersEl.querySelectorAll('button').forEach(btn => {
        btn.classList.replace('btn-primary', 'btn-secondary');
    });
    button.classList.replace('btn-secondary', 'btn-primary');

    // Update state and fetch a new meme
    currentSubreddit = button.dataset.subreddit;
    fetchMeme();
}

function handleNextMemeClick() {
    fetchMeme();
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    categoryFiltersEl = document.getElementById('meme-category-filters');
    nextMemeBtn = document.getElementById('next-meme-btn');
    statusEl = document.getElementById('meme-status');
    memeContentEl = document.getElementById('meme-content');
    memeTitleEl = document.getElementById('meme-title');
    memeImageEl = document.getElementById('meme-image');
    memeSourceLinkEl = document.getElementById('meme-source-link');

    // Attach event listeners
    if (categoryFiltersEl) {
        categoryFiltersEl.addEventListener('click', handleCategoryClick);
    }
    if (nextMemeBtn) {
        nextMemeBtn.addEventListener('click', handleNextMemeClick);
    }

    // Fetch the first meme on load
    fetchMeme();
}

export function cleanup() {
    // Remove event listeners
    if (categoryFiltersEl) {
        categoryFiltersEl.removeEventListener('click', handleCategoryClick);
    }
    if (nextMemeBtn) {
        nextMemeBtn.removeEventListener('click', handleNextMemeClick);
    }
}