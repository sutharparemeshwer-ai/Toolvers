// js/tools/viral-memes.js

// --- Configuration ---
const API_BASE_URL = "https://www.reddit.com/r/";

// --- DOM Elements ---
let categoryFiltersEl,
  nextMemeBtn,
  statusEl,
  memeContentEl,
  memeTitleEl,
  memeImageEl,
  memeSourceLinkEl;

// --- State ---
let currentSubreddit = "dankmemes"; // Default subreddit

// --- Helper Functions ---

function showStatus(message, isError = false) {
  memeContentEl.classList.add("d-none");
  statusEl.innerHTML = isError
    ? `<div class="alert alert-danger">${message}</div>`
    : `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function hideStatus() {
  statusEl.classList.add("d-none");
  memeContentEl.classList.remove("d-none");
}

/**
 * Renders the fetched meme data into the UI.
 * @param {object} memeData - The meme data object from the API.
 */
function renderMeme(memeData) {
  // The new API wraps the data in a 'data' property
  const post = memeData.data;

  // Add checks for invalid posts (videos, stickied posts, etc.)
  if (
    !post ||
    !post.url ||
    post.is_video ||
    post.stickied ||
    !post.url.match(/\.(jpeg|jpg|gif|png)$/)
  ) {
    showStatus("Received a non-image post. Fetching another...", false);
    setTimeout(fetchMeme, 1000); // Automatically try again
    return;
  }

  memeTitleEl.textContent = post.title;
  memeImageEl.src = post.url;
  memeImageEl.alt = post.title;
  // Construct the permalink from the response data
  memeSourceLinkEl.href = `https://reddit.com${post.permalink}`;
  memeSourceLinkEl.textContent = `r/${post.subreddit}`;

  hideStatus();
}

// --- API & Event Handlers ---

async function fetchMeme() {
  showStatus(`Fetching a meme from r/${currentSubreddit}...`);
  nextMemeBtn.disabled = true;

  try {
    // Fetch the top 50 posts from the last 24 hours
    const response = await fetch(
      `${API_BASE_URL}${currentSubreddit}/top.json?t=day&limit=50`
    );
    if (!response.ok) {
      throw new Error(
        `API Error: ${response.statusText} (Status: ${response.status})`
      );
    }
    const data = await response.json();

    // Check if we have an array of posts
    if (
      data &&
      data.data &&
      data.data.children &&
      data.data.children.length > 0
    ) {
      const posts = data.data.children;
      // Pick a random post from the list
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      renderMeme(randomPost);
    } else {
      throw new Error("No meme data found in the API response.");
    }
  } catch (error) {
    console.error("Meme Fetch Error:", error);
    showStatus(`Failed to fetch meme: ${error.message}`, true);
  } finally {
    nextMemeBtn.disabled = false;
  }
}

function handleCategoryClick(event) {
  const button = event.target.closest("button");
  if (!button || !button.dataset.subreddit) return;

  // Update active button style
  categoryFiltersEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.replace("btn-primary", "btn-secondary");
  });
  button.classList.replace("btn-secondary", "btn-primary");

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
  categoryFiltersEl = document.getElementById("meme-category-filters");
  nextMemeBtn = document.getElementById("next-meme-btn");
  statusEl = document.getElementById("meme-status");
  memeContentEl = document.getElementById("meme-content");
  memeTitleEl = document.getElementById("meme-title");
  memeImageEl = document.getElementById("meme-image");
  memeSourceLinkEl = document.getElementById("meme-source-link");

  // Attach event listeners
  if (categoryFiltersEl) {
    categoryFiltersEl.addEventListener("click", handleCategoryClick);
  }
  if (nextMemeBtn) {
    nextMemeBtn.addEventListener("click", handleNextMemeClick);
  }

  // Fetch the first meme on load
  fetchMeme();
}

export function cleanup() {
  // Remove event listeners
  if (categoryFiltersEl) {
    categoryFiltersEl.removeEventListener("click", handleCategoryClick);
  }
  if (nextMemeBtn) {
    nextMemeBtn.removeEventListener("click", handleNextMemeClick);
  }
}
