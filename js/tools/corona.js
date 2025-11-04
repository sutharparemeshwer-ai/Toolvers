// js/tools/corona-tracker.js

const API_URL = 'https://disease.sh/v3/covid-19/all'; // Global Data API
let confirmedCasesEl, totalDeathsEl, totalRecoveredEl, updateTimeEl;
let loadingEl, dataEl;

// Function to fetch and display data
async function fetchCoronaData() {
    // Show loading, hide data
    loadingEl.style.display = 'block';
    dataEl.style.display = 'none';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();

        // Use Intl.NumberFormat for cleaner numbers (e.g., 100,000,000)
        const formatter = new Intl.NumberFormat('en-US');

        // Update the display elements
        confirmedCasesEl.textContent = formatter.format(data.cases);
        totalDeathsEl.textContent = formatter.format(data.deaths);
        totalRecoveredEl.textContent = formatter.format(data.recovered);

        // Update last update time
        const date = new Date(data.updated);
        updateTimeEl.textContent = `Last Updated: ${date.toLocaleString()}`;

        // Hide loading, show data
        loadingEl.style.display = 'none';
        dataEl.style.display = 'flex'; // Use flex to respect the row layout
        
    } catch (error) {
        console.error('Error fetching COVID-19 data:', error);
        loadingEl.textContent = '❌ Failed to load data. Please check console for details.';
        loadingEl.classList.remove('alert-info');
        loadingEl.classList.add('alert-danger');
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    confirmedCasesEl = document.getElementById('confirmed-cases');
    totalDeathsEl = document.getElementById('total-deaths');
    totalRecoveredEl = document.getElementById('total-recovered');
    updateTimeEl = document.getElementById('tracker-update-time');
    loadingEl = document.getElementById('tracker-loading');
    dataEl = document.getElementById('tracker-data');
    
    // 2. Fetch data on load
    fetchCoronaData();
}

export function cleanup() {
    // Reset status on cleanup
    if (loadingEl) {
        loadingEl.textContent = 'Loading global data...';
        loadingEl.classList.remove('alert-danger');
        loadingEl.classList.add('alert-info');
    }
}