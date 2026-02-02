// js/tools/weather-app.js

const API_KEY = '83dfa2159edbf4ac901682e4e3a84531'; // Keep existing key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

let cityInput, searchBtn, locationBtn, statusEl, weatherDisplayEl;
let weatherIcon, temperatureEl, descriptionEl, cityNameEl, countryCodeEl;
let feelsLikeEl, humidityEl, windSpeedEl, weatherBgEl;

function updateBackground(condition) {
    weatherBgEl.className = 'weather-bg-layer'; // Reset
    const code = condition.toLowerCase();
    
    if (code.includes('clear')) {
        weatherBgEl.classList.add('bg-clear');
    } else if (code.includes('cloud')) {
        weatherBgEl.classList.add('bg-clouds');
    } else if (code.includes('rain') || code.includes('drizzle')) {
        weatherBgEl.classList.add('bg-rain');
    } else if (code.includes('snow')) {
        weatherBgEl.classList.add('bg-snow');
    } else if (code.includes('thunder')) {
        weatherBgEl.classList.add('bg-thunder');
    } else {
        weatherBgEl.classList.add('bg-default');
    }
}

function showLoading(message) {
    statusEl.innerHTML = `<div class="spinner-border text-light" role="status"></div><p class="mt-2">${message}</p>`;
    weatherDisplayEl.classList.add('d-none');
}

function showError(message) {
    statusEl.innerHTML = `<div class="alert alert-danger bg-danger text-white border-0">${message}</div>`;
    weatherDisplayEl.classList.add('d-none');
}

function updateUI(data) {
    statusEl.innerHTML = '';
    weatherDisplayEl.classList.remove('d-none');
    
    cityNameEl.textContent = data.name;
    countryCodeEl.textContent = data.sys.country;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°`;
    descriptionEl.textContent = data.weather[0].description;
    
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    updateBackground(data.weather[0].main);
}

async function fetchWeather(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('City not found or API error.');
        const data = await res.json();
        updateUI(data);
    } catch (err) {
        showError(err.message);
    }
}

function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;
    showLoading(`Searching for ${city}...`);
    fetchWeather(`${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
}

function handleLocation() {
    if (!navigator.geolocation) return showError('Geolocation not supported.');
    showLoading('Locating...');
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(`${API_BASE_URL}?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${API_KEY}&units=metric`),
        err => showError('Location access denied.')
    );
}

export function init() {
    cityInput = document.getElementById('city-input');
    searchBtn = document.getElementById('search-btn');
    locationBtn = document.getElementById('location-btn');
    statusEl = document.getElementById('weather-status');
    weatherDisplayEl = document.getElementById('weather-display');
    weatherBgEl = document.getElementById('weather-bg');
    
    cityNameEl = document.getElementById('city-name');
    countryCodeEl = document.getElementById('country-code');
    temperatureEl = document.getElementById('temperature');
    descriptionEl = document.getElementById('weather-description');
    weatherIcon = document.getElementById('weather-icon');
    
    feelsLikeEl = document.getElementById('feels-like');
    humidityEl = document.getElementById('humidity');
    windSpeedEl = document.getElementById('wind-speed');
    
    searchBtn.addEventListener('click', handleSearch);
    locationBtn.addEventListener('click', handleLocation);
    cityInput.addEventListener('keypress', e => {
        if(e.key === 'Enter') handleSearch();
    });
    
    // Default search (London) or empty state
    // handleLocation(); // Optional: Auto-locate on load
}

export function cleanup() {
    // Cleanup listeners if needed
}
