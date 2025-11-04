// js/tools/weather-app.js

// --- Configuration ---
// 🚨 IMPORTANT: Replace with your own free API key from OpenWeatherMap
const API_KEY = '83dfa2159edbf4ac901682e4e3a84531'; // 👈 Replace this with your actual key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// --- DOM Elements ---
let cityInput, searchBtn, locationBtn, statusEl, weatherDisplayEl;
let weatherIcon, temperatureEl, descriptionEl, cityNameEl;
let feelsLikeEl, humidityEl, windSpeedEl;

// --- UI Update Functions ---

function showLoading(message) {
    weatherDisplayEl.classList.add('d-none');
    statusEl.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">${message}</p>
    `;
}

function showError(message) {
    weatherDisplayEl.classList.add('d-none');
    statusEl.innerHTML = `<p class="text-danger fw-bold">${message}</p>`;
}

function updateWeatherUI(data) {
    statusEl.innerHTML = '';
    weatherDisplayEl.classList.remove('d-none');

    // Main info
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionEl.textContent = data.weather[0].description;
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;

    // Detailed info
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed.toFixed(1)} m/s`;
}

// --- API & Geolocation Functions ---

async function fetchWeather(url) {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('API Key not configured. Please add your OpenWeatherMap API key to js/tools/weather-app.js');
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else {
                throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
            }
        }
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        showError(error.message);
    }
}

function getWeatherByCity(city) {
    if (!city) {
        showError('Please enter a city name.');
        return;
    }
    showLoading(`Fetching weather for ${city}...`);
    const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    fetchWeather(url);
}

function getWeatherByCoords(lat, lon) {
    showLoading('Fetching weather for your location...');
    const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetchWeather(url);
}

function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    showLoading('Getting your location...');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            showError(`Geolocation Error: ${error.message}. Try searching for a city manually.`);
        }
    );
}

// --- Event Handlers ---

function handleSearch() {
    getWeatherByCity(cityInput.value.trim());
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    cityInput = document.getElementById('city-input');
    searchBtn = document.getElementById('search-btn');
    locationBtn = document.getElementById('location-btn');
    statusEl = document.getElementById('weather-status');
    weatherDisplayEl = document.getElementById('weather-display');
    weatherIcon = document.getElementById('weather-icon');
    temperatureEl = document.getElementById('temperature');
    descriptionEl = document.getElementById('weather-description');
    cityNameEl = document.getElementById('city-name');
    feelsLikeEl = document.getElementById('feels-like');
    humidityEl = document.getElementById('humidity');
    windSpeedEl = document.getElementById('wind-speed');

    // Attach event listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', handleKeyPress);
    locationBtn.addEventListener('click', handleGeolocation);

    // Automatically get weather by location on initial load
    handleGeolocation();
}

export function cleanup() {
    // Remove event listeners to prevent memory leaks
    searchBtn.removeEventListener('click', handleSearch);
    cityInput.removeEventListener('keypress', handleKeyPress);
    locationBtn.removeEventListener('click', handleGeolocation);
}