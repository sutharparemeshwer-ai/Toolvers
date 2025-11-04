// js/tools/animated-weather-dashboard.js

// --- Configuration ---
const API_KEY = "83dfa2159edbf4ac901682e4e3a84531"; // Using the same key from the other weather app
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// --- DOM Elements ---
let cityInput,
  searchBtn,
  locationBtn,
  statusEl,
  weatherDisplayEl,
  weatherContainer;
let tempEl, descEl, cityEl, feelsLikeEl, humidityEl, windSpeedEl, iconContainer;

// --- UI Update Functions ---

function showLoading(message) {
  weatherDisplayEl.classList.add("d-none");
  statusEl.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">${message}</p>
    `;
}

function showError(message) {
  weatherDisplayEl.classList.add("d-none");
  statusEl.innerHTML = `<p class="text-danger fw-bold">${message}</p>`;
}

function updateWeatherUI(data) {
  statusEl.innerHTML = "";
  weatherDisplayEl.classList.remove("d-none");

  // Update text content
  tempEl.textContent = `${Math.round(data.main.temp)}°`;
  descEl.textContent = data.weather[0].description;
  cityEl.textContent = `${data.name}, ${data.sys.country}`;
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windSpeedEl.textContent = `${data.wind.speed.toFixed(1)} m/s`;

  // Update dynamic background and icon
  updateDynamicElements(data.weather[0].main, data.weather[0].icon);
  setTimeout(() => weatherDisplayEl.classList.add("loaded"), 10); // Add class for animations
}

function updateDynamicElements(weatherMain, iconCode) {
  // Set background based on weather condition
  weatherContainer.className = "weather-container"; // Reset classes
  weatherContainer.classList.add(weatherMain.toLowerCase());

  weatherDisplayEl.classList.remove("loaded"); // Remove for re-animation
  // Use animated icons from a different source (e.g., amCharts)
  const iconName = getAnimatedIconName(iconCode);
  iconContainer.innerHTML = `<img src="https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/${iconName}.svg" alt="${weatherMain}" style="width: 128px; height: 128px;">`;
}

function getAnimatedIconName(iconCode) {
  // Mapping OpenWeatherMap icons to amCharts animated icons
  const map = {
    "01d": "day",
    "01n": "night",
    "02d": "cloudy-day-1",
    "02n": "cloudy-night-1",
    "03d": "cloudy",
    "03n": "cloudy",
    "04d": "cloudy",
    "04n": "cloudy",
    "09d": "rainy-6",
    "09n": "rainy-6",
    "10d": "rainy-3",
    "10n": "rainy-5",
    "11d": "thunder",
    "11n": "thunder",
    "13d": "snowy-6",
    "13n": "snowy-6",
    "50d": "mist",
    "50n": "mist",
  };
  return map[iconCode] || "weather"; // default icon
}

// --- API & Geolocation Functions ---

async function fetchWeather(url) {
  if (API_KEY === "YOUR_API_KEY_HERE" || !API_KEY) {
    showError(
      "API Key not configured. Please add your OpenWeatherMap API key."
    );
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "City not found."
          : `API Error: ${response.statusText}`
      );
    }
    const data = await response.json();
    updateWeatherUI(data);
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    showError(error.message);
  }
}

function getWeatherByCity(city) {
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  showLoading(`Fetching weather for ${city}...`);
  const url = `${API_BASE_URL}?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;
  fetchWeather(url);
}

function getWeatherByCoords(lat, lon) {
  showLoading("Fetching weather for your location...");
  const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  fetchWeather(url);
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  showLoading("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    (position) =>
      getWeatherByCoords(position.coords.latitude, position.coords.longitude),
    (error) => showError(`Geolocation Error: ${error.message}.`)
  );
}

// --- Event Handlers & Init ---

function handleSearch() {
  getWeatherByCity(cityInput.value.trim());
}

export function init() {
  // Get DOM elements
  cityInput = document.getElementById("weather-city-input");
  searchBtn = document.getElementById("weather-search-btn");
  locationBtn = document.getElementById("weather-location-btn");
  statusEl = document.getElementById("weather-status-new");
  weatherDisplayEl = document.getElementById("weather-display-new");
  weatherContainer = document.getElementById("weather-container");
  iconContainer = document.getElementById("weather-icon-container");
  tempEl = document.getElementById("weather-temp");
  descEl = document.getElementById("weather-desc");
  cityEl = document.getElementById("weather-city");
  feelsLikeEl = document.getElementById("weather-feels-like");
  humidityEl = document.getElementById("weather-humidity");
  windSpeedEl = document.getElementById("weather-wind-speed");

  // Attach event listeners
  searchBtn.addEventListener("click", handleSearch);
  cityInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && handleSearch()
  );
  locationBtn.addEventListener("click", handleGeolocation);

  // Load weather for user's location on init
  handleGeolocation();
}

export function cleanup() {
  // Remove event listeners
  searchBtn.removeEventListener("click", handleSearch);
  cityInput.removeEventListener(
    "keypress",
    (e) => e.key === "Enter" && handleSearch()
  );
  locationBtn.removeEventListener("click", handleGeolocation);
}
