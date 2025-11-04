// js/tools/google-clone.js - Final Code for Google Search Clone with RapidAPI

// 🚨 API Crendentials: Using the Google Search 74 API credentials you provided.
const RAPIDAPI_KEY = '885f4f1b25msh4f00a32addbb01ep1b0275jsn56eea84ba9b1';
const RAPIDAPI_HOST = 'google-search74.p.rapidapi.com'; 
const API_BASE_URL = `https://${RAPIDAPI_HOST}`; 

let formEl, inputEl, resultsContainerEl, luckyBtn;

// --- Helper Functions ---

/**
 * Parses the search results array and injects the HTML into the container.
 * @param {Array<Object>} items - The array of search result objects from the API.
 */
function displayResults(items) {
    // We already checked if resultsContainerEl is null in fetchSearchResults, but checking again for safety.
    if (!resultsContainerEl) return; 

    resultsContainerEl.innerHTML = ''; // Clear previous results

    if (!items || items.length === 0) {
        resultsContainerEl.innerHTML = '<p class="no-results">No search results found for that query.</p>';
        return;
    }

    const resultsHTML = items.map(item => {
        // Mapping properties for the Google Search 74 API (assuming title, snippet, url keys)
        const title = item.title || 'No Title';
        const snippet = item.snippet || item.description || 'No snippet available.';
        const url = item.url || item.link || '#';

        return `
            <div class="search-result-item">
                <a href="${url}" target="_blank" class="result-title">${title}</a>
                <p class="result-url">${url}</p>
                <p class="result-snippet">${snippet}</p>
            </div>
        `;
    }).join('');

    resultsContainerEl.innerHTML = resultsHTML;
}

// --- Main API Function ---

async function fetchSearchResults(query) {
    // 🚨 Critical Check for the reported error:
    if (!resultsContainerEl) {
        console.error("Error: resultsContainerEl is null! Check HTML ID 'search-results-container'.");
        return; 
    }

    const API_URL = `${API_BASE_URL}/?query=${encodeURIComponent(query)}&limit=10&related_keywords=true`;

    resultsContainerEl.innerHTML = '<p class="loading-message">Searching RapidAPI (Google Search 74)...</p>';
    
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}. Check your subscription.`);
        }

        const data = await response.json();
        
        // Assuming the primary results array is under the 'results' key.
        const resultsArray = data.results || []; 

        displayResults(resultsArray);

    } catch (error) {
        console.error('RapidAPI Fetch error:', error);
        resultsContainerEl.innerHTML = `<p class="alert-error">🚨 An error occurred: ${error.message}. Check browser console for network/API error details.</p>`;
    }
}

// --- Event Handlers ---

function handleSearch(e) {
    // 🚨 MOST CRITICAL STEP: Prevents the form from reloading the page
    e.preventDefault(); 
    
    const query = inputEl.value.trim();
    
    if (query) {
        fetchSearchResults(query);
    } else {
        alert("Please enter a search term.");
    }
}

function handleLuckyClick() {
    alert("I'm Feeling Lucky button clicked. Performing a search for 'web development'...");
    inputEl.value = "web development";
    fetchSearchResults(inputEl.value);
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('google-search-form');
    inputEl = document.getElementById('search-input');
    luckyBtn = document.getElementById('lucky-btn');
    resultsContainerEl = document.getElementById('search-results-container'); 

    // 2. Attach listeners
    if (formEl) {
        formEl.addEventListener('submit', handleSearch);
        console.log("Search form listener attached."); 
    } else {
        console.error("Error: google-search-form not found!"); 
    }

    if (luckyBtn) luckyBtn.addEventListener('click', handleLuckyClick);
}

export function cleanup() {
    // Remove listeners to prevent memory leaks when switching tools
    if (formEl) formEl.removeEventListener('submit', handleSearch);
    if (luckyBtn) luckyBtn.removeEventListener('click', handleLuckyClick);
}