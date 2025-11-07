// js/tools/public-holiday-finder.js

// --- DOM Elements ---
let formEl, countrySelectEl, yearInputEl, statusEl, resultsContainerEl;

// --- API ---
const API_BASE_URL = "https://date.nager.at/api/v3";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainerEl.innerHTML = "";
  statusEl.innerHTML = `<p class="mt-3 ${
    isError ? "text-danger" : "text-muted"
  }">${message}</p>`;
  statusEl.classList.remove("d-none");
}

function hideStatus() {
  statusEl.classList.add("d-none");
  statusEl.innerHTML = "";
}

function renderHolidays(holidays) {
  resultsContainerEl.innerHTML = "";
  if (!holidays || holidays.length === 0) {
    showStatus(
      "No public holidays found for the selected country and year.",
      true
    );
    return;
  }

  holidays.forEach((holiday) => {
    const item = document.createElement("div");
    item.className = "list-group-item";
    const holidayDate = new Date(holiday.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    item.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h6 class="mb-1">${holiday.name}</h6>
        <small class="">${holidayDate}</small>
      </div>
      <p class="mb-1 small">Local Name: ${holiday.localName}</p>
    `;
    resultsContainerEl.appendChild(item);
  });
}

// --- API & Event Handlers ---

async function populateCountries() {
  try {
    const response = await fetch(`${API_BASE_URL}/AvailableCountries`);
    if (!response.ok) throw new Error("Could not fetch country list.");
    const countries = await response.json();

    countrySelectEl.innerHTML = '<option value="">Select a country...</option>';
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.countryCode;
      option.textContent = country.name;
      countrySelectEl.appendChild(option);
    });
  } catch (error) {
    console.error("Country Fetch Error:", error);
    countrySelectEl.innerHTML = `<option value="">Error loading countries</option>`;
    countrySelectEl.disabled = true;
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const countryCode = countrySelectEl.value;
  const year = yearInputEl.value;

  if (!countryCode || !year) {
    showStatus("Please select a country and enter a year.", true);
    return;
  }

  hideStatus();
  showStatus("Fetching holidays...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/PublicHolidays/${year}/${countryCode}`
    );
    if (response.status === 404) {
      throw new Error("No holidays found for the selected year.");
    }
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const holidays = await response.json();
    hideStatus();
    renderHolidays(holidays);
  } catch (error) {
    console.error("Holiday Fetch Error:", error);
    showStatus(`Failed to fetch holidays: ${error.message}`, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  formEl = document.getElementById("holiday-finder-form");
  countrySelectEl = document.getElementById("holiday-country");
  yearInputEl = document.getElementById("holiday-year");
  statusEl = document.getElementById("holiday-status");
  resultsContainerEl = document.getElementById("holiday-results-container");

  // Set default year to current year
  yearInputEl.value = new Date().getFullYear();

  // Populate countries dropdown
  populateCountries();

  // Attach event listeners
  formEl.addEventListener("submit", handleFormSubmit);
}

export function cleanup() {
  // Remove event listeners
  if (formEl) {
    formEl.removeEventListener("submit", handleFormSubmit);
  }
}
