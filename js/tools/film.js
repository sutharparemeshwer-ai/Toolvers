// js/tools/film-finder.js

// 🚨 ACTION REQUIRED: Replace 'YOUR_OMDB_API_KEY' with your actual OMDb API Key.
const API_KEY = 'fe5ffe31'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&t=`; // &t= for searching by title

let formEl, inputEl, resultsContainerEl, messageAreaEl;

// --- Helper Functions ---

function showMessage(text, isError = false) {
    messageAreaEl.textContent = text;
    messageAreaEl.classList.remove('alert-info', 'alert-danger', 'd-none');
    messageAreaEl.classList.add(isError ? 'alert-danger' : 'alert-info');
    messageAreaEl.classList.remove('d-none');
}

function hideMessage() {
    messageAreaEl.classList.add('d-none');
}

function displayMovie(data) {
    // Clear previous results
    resultsContainerEl.innerHTML = ''; 

    // Check if movie was found
    if (data.Response === 'False') {
        showMessage(`Error: ${data.Error}`, true);
        return;
    }

    // --- Build HTML for the Movie ---
    const html = `
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div class="col p-4 d-flex flex-column position-static">
                <strong class="d-inline-block mb-2 text-primary">${data.Genre}</strong>
                <h3 class="mb-0 ">${data.Title} (${data.Year})</h3>
                <div class="mb-1 ">${data.Released} | ${data.Runtime}</div>
                
                <p class="card-text mb-auto mt-2">
                    <span class="fw-bold">Director:</span> ${data.Director}<br>
                    <span class="fw-bold">Cast:</span> ${data.Actors}
                </p>
                
                <p class="mt-3">${data.Plot}</p>

                <div class="mt-2">
                    <span class="badge bg-success">IMDb: ${data.imdbRating}</span>
                    ${data.Ratings.map(rating => 
                        `<span class="badge bg-secondary">${rating.Source}: ${rating.Value}</span>`
                    ).join(' ')}
                </div>
            </div>
            
            <div class="col-auto d-none d-lg-block">
                <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'}" 
                     alt="${data.Title} Poster" 
                     style="width: 200px; height: 300px; object-fit: cover;">
            </div>
        </div>
    `;

    resultsContainerEl.innerHTML = html;
}

// --- Main API Function ---

async function fetchMovie(title) {
    if (API_KEY === 'YOUR_OMDB_API_KEY') {
         showMessage("Error: Please replace 'YOUR_OMDB_API_KEY' in js/tools/film-finder.js with your actual API key.", true);
         return;
    }
    
    showMessage("Searching...");
    
    try {
        const response = await fetch(`${BASE_URL}${encodeURIComponent(title)}`);
        const data = await response.json();

        hideMessage();
        displayMovie(data);

    } catch (error) {
        console.error('Fetch error:', error);
        showMessage("An error occurred while fetching movie data.", true);
    }
}

// --- Event Handler ---

function handleFormSubmit(e) {
    e.preventDefault();
    const title = inputEl.value.trim();
    
    if (title) {
        fetchMovie(title);
    } else {
        showMessage("Please enter a movie title.", true);
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('film-search-form');
    inputEl = document.getElementById('movie-title-input');
    resultsContainerEl = document.getElementById('movie-results-container');
    messageAreaEl = document.getElementById('message-area');

    // 2. Attach listener
    formEl.addEventListener('submit', handleFormSubmit);
    
    // Initial warning if API key is not set
    if (API_KEY === 'YOUR_OMDB_API_KEY') {
        showMessage("Please set your OMDb API Key in js/tools/film-finder.js to start searching.", true);
    }
}

export function cleanup() {
    if (formEl) formEl.removeEventListener('submit', handleFormSubmit);
}