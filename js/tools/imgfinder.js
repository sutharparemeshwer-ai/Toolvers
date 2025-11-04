// js/tools/image-finder.js

// 🚨 IMPORTANT: Replace 'YOUR_PEXELS_API_KEY' with your actual key.
const PEXELS_API_KEY = 'Lp0Zn1g49IJFacF8RLsNsSjqZaabSxV2hQcBy6q05EkaZddd46HCBfUx'; 
const API_BASE_URL = 'https://api.pexels.com/v1/';

let formEl, inputEl, resultsContainerEl, messageAreaEl;

// --- Helper Functions ---

function showMessage(text, isError = false) {
    resultsContainerEl.innerHTML = '';
    messageAreaEl.textContent = text;
    messageAreaEl.classList.remove('alert-info', 'alert-danger', 'd-none');
    messageAreaEl.classList.add(isError ? 'alert-danger' : 'alert-info');
    messageAreaEl.classList.remove('d-none');
}

function hideMessage() {
    messageAreaEl.classList.add('d-none');
}

/**
 * Renders the search results grid.
 * @param {Array<Object>} photos - Array of photo objects from Pexels API.
 */
function displayResults(photos) {
    resultsContainerEl.innerHTML = ''; 
    
    if (!photos || photos.length === 0) {
        showMessage("No images found for that query. Try another search term.", true);
        return;
    }
    
    const imagesHTML = photos.map(photo => `
        <div class="col">
            <div class="image-card" onclick="window.open('${photo.url}', '_blank')">
                <img src="${photo.src.medium}" alt="${photo.alt}" class="img-fluid rounded shadow-sm">
                <div class="image-overlay">
                    <p class="image-photographer">By: ${photo.photographer}</p>
                    <p class="image-link">View Full Image</p>
                </div>
            </div>
        </div>
    `).join('');

    resultsContainerEl.innerHTML = imagesHTML;
}

// --- Main API Function ---

async function fetchImages(query) {
    if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY') {
        showMessage("Error: Please replace 'YOUR_PEXELS_API_KEY' in the JavaScript file with your actual key.", true);
        return;
    }
    
    const API_URL = `${API_BASE_URL}search?query=${encodeURIComponent(query)}&per_page=12`; // Fetch 12 images

    showMessage("Searching Pexels...");
    
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                // Authentication header is mandatory for Pexels API
                'Authorization': PEXELS_API_KEY, 
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 401) {
             throw new Error("Authentication failed. Check your Pexels API Key.");
        }
        
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}.`);
        }

        const data = await response.json();
        hideMessage();
        
        displayResults(data.photos);

    } catch (error) {
        console.error('Pexels API Fetch error:', error);
        showMessage(`🚨 An error occurred: ${error.message}. Check the console for details.`, true);
    }
}

// --- Event Handler ---

function handleSearch(e) {
    e.preventDefault();
    const query = inputEl.value.trim();
    
    if (query) {
        fetchImages(query);
    } else {
        showMessage("Please enter a search query.", true);
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('image-search-form');
    inputEl = document.getElementById('search-query-input');
    resultsContainerEl = document.getElementById('image-results-container');
    messageAreaEl = document.getElementById('image-message-area');

    // 2. Attach listener
    if (formEl) formEl.addEventListener('submit', handleSearch);
}

export function cleanup() {
    // Remove listeners
    if (formEl) formEl.removeEventListener('submit', handleSearch);
}