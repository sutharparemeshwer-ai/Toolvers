// js/tools/country-information-finder.js

// --- DOM Elements ---
let searchForm, searchInput, statusMessage, resultsContainer;
let flagEl, commonNameEl, officialNameEl, detailsListEl;

// --- API ---
const API_BASE_URL = "https://restcountries.com/v3.1/name/";

// --- Helper Functions ---

function showMessage(message, isError = false) {
  resultsContainer.classList.add("d-none");
  statusMessage.innerHTML = `<div class="alert ${
    isError ? "alert-danger" : "alert-info"
  }">${message}</div>`;
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

// --- Rendering ---

function renderCountryInfo(country) {
  statusMessage.innerHTML = "";
  resultsContainer.classList.remove("d-none");

  // Main Info
  flagEl.src = country.flags.svg;
  flagEl.alt = `Flag of ${country.name.common}`;
  commonNameEl.textContent = country.name.common;
  officialNameEl.textContent = country.name.official;

  // Details List
  detailsListEl.innerHTML = "";
  const details = {
    Capital: country.capital?.[0] || "N/A",
    Population: formatNumber(country.population),
    Region: `${country.region} (${country.subregion || "N/A"})`,
    Languages: Object.values(country.languages).join(", "),
    Currency: `${Object.values(country.currencies)[0].name} (${
      Object.values(country.currencies)[0].symbol
    })`,
  };

  for (const [key, value] of Object.entries(details)) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${key}</span><strong class="text-end">${value}</strong>`;
    detailsListEl.appendChild(li);
  }

  // Google Maps Link
  const mapsLi = document.createElement("li");
  mapsLi.className = "list-group-item";
  mapsLi.innerHTML = `<a href="${country.maps.googleMaps}" target="_blank" class="btn btn-sm btn-outline-secondary w-100">View on Google Maps</a>`;
  detailsListEl.appendChild(mapsLi);
}

// --- Event Handlers & API Call ---

async function handleSearch(event) {
  event.preventDefault();
  const countryName = searchInput.value.trim();
  if (!countryName) return;

  showMessage("Fetching country data...");

  try {
    const response = await fetch(`${API_BASE_URL}${countryName}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Country "${countryName}" not found.`);
      } else {
        throw new Error(`API Error: ${response.statusText}`);
      }
    }
    const data = await response.json();
    renderCountryInfo(data[0]); // The API returns an array
  } catch (error) {
    console.error("Country Fetch Error:", error);
    showMessage(error.message, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("country-search-form");
  searchInput = document.getElementById("country-name-input");
  statusMessage = document.getElementById("country-status-message");
  resultsContainer = document.getElementById("country-results-container");
  flagEl = document.getElementById("country-flag");
  commonNameEl = document.getElementById("country-common-name");
  officialNameEl = document.getElementById("country-official-name");
  detailsListEl = document.getElementById("country-details-list");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) {
    searchForm.removeEventListener("submit", handleSearch);
  }
}
