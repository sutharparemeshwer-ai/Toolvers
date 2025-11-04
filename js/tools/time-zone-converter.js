// js/tools/time-zone-converter.js

// --- DOM Elements ---
let addCityForm, citySelect, timeZoneList;

// --- State ---
let timerInterval = null;
let displayedTimeZones = [];
const LOCAL_STORAGE_KEY = "timeZoneConverter_cities";

// A curated list of IANA time zones.
const ALL_TIME_ZONES = {
  "Pacific/Midway": "Midway",
  "Pacific/Honolulu": "Honolulu",
  "America/Anchorage": "Anchorage",
  "America/Los_Angeles": "Los Angeles",
  "America/Denver": "Denver",
  "America/Chicago": "Chicago",
  "America/New_York": "New York",
  "America/Caracas": "Caracas",
  "America/Halifax": "Halifax",
  "America/Sao_Paulo": "São Paulo",
  "Atlantic/South_Georgia": "South Georgia",
  "Atlantic/Azores": "Azores",
  "Europe/London": "London",
  "Europe/Berlin": "Berlin",
  "Europe/Moscow": "Moscow",
  "Asia/Dubai": "Dubai",
  "Asia/Karachi": "Karachi",
  "Asia/Kolkata": "Kolkata (India)",
  "Asia/Dhaka": "Dhaka",
  "Asia/Bangkok": "Bangkok",
  "Asia/Shanghai": "Shanghai",
  "Asia/Tokyo": "Tokyo",
  "Australia/Sydney": "Sydney",
  "Pacific/Auckland": "Auckland",
};

function updateTimes() {
  const now = new Date();

  displayedTimeZones.forEach((tz) => {
    const timeEl = document.querySelector(`[data-tz="${tz}"] .time`);
    const dateEl = document.querySelector(`[data-tz="${tz}"] .date`);

    if (timeEl && dateEl) {
      const timeString = now.toLocaleTimeString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const dateString = now.toLocaleDateString("en-US", {
        timeZone: tz,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      timeEl.textContent = timeString;
      dateEl.textContent = dateString;
    }
  });
}

function addTimeZone(timeZone) {
  if (!timeZone || displayedTimeZones.includes(timeZone)) {
    return; // Don't add duplicates or empty values
  }

  displayedTimeZones.push(timeZone);
  saveTimeZones();

  const city =
    ALL_TIME_ZONES[timeZone] || timeZone.split("/").pop().replace("_", " ");

  const item = document.createElement("div");
  item.className =
    "list-group-item d-flex justify-content-between align-items-center";
  item.dataset.tz = timeZone;

  item.innerHTML = `
        <div>
            <h5 class="mb-1">${city}</h5>
            <p class="mb-1 date"></p>
        </div>
        <div class="text-end">
            <h4 class="mb-1 time fw-bold"></h4>
            <button class="btn btn-sm btn-outline-danger remove-tz-btn">&times;</button>
        </div>
    `;

  timeZoneList.appendChild(item);

  item.querySelector(".remove-tz-btn").addEventListener("click", () => {
    removeTimeZone(timeZone);
  });
}

function removeTimeZone(timeZone) {
  displayedTimeZones = displayedTimeZones.filter((tz) => tz !== timeZone);
  saveTimeZones();

  const itemToRemove = document.querySelector(`[data-tz="${timeZone}"]`);
  if (itemToRemove) {
    itemToRemove.remove();
  }
}

function saveTimeZones() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(displayedTimeZones));
}

function loadTimeZones() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // Default cities for first-time users
  return ["America/New_York", "Europe/London", "Asia/Tokyo"];
}

function handleAddCity(e) {
  e.preventDefault();
  const selectedTimeZone = citySelect.value;
  addTimeZone(selectedTimeZone);
}

export function init() {
  addCityForm = document.getElementById("add-city-form");
  citySelect = document.getElementById("city-select");
  timeZoneList = document.getElementById("time-zone-list");

  // Populate dropdown
  for (const tz in ALL_TIME_ZONES) {
    const option = new Option(`${ALL_TIME_ZONES[tz]} (${tz})`, tz);
    citySelect.add(option);
  }

  // Load saved or default time zones
  displayedTimeZones = []; // Clear before loading
  const zonesToLoad = loadTimeZones();
  zonesToLoad.forEach((tz) => addTimeZone(tz));

  addCityForm.addEventListener("submit", handleAddCity);

  updateTimes(); // Initial call
  timerInterval = setInterval(updateTimes, 1000);
}

export function cleanup() {
  clearInterval(timerInterval);
  if (addCityForm) addCityForm.removeEventListener("submit", handleAddCity);
  timeZoneList.innerHTML = ""; // Clear the list
}
