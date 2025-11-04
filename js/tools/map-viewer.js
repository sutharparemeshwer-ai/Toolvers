// js/tools/map-viewer.js

let map;

function loadCSS(url) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (window.L) return resolve();
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initializeMap() {
    const statusEl = document.getElementById('map-status');
    loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                statusEl.classList.add('d-none');

                map = L.map('map-container').setView([latitude, longitude], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup('You are here!')
                    .openPopup();
            },
            (error) => {
                statusEl.textContent = `Error: ${error.message}. Geolocation is required for this tool.`;
                statusEl.className = 'alert alert-danger';
            }
        );
    } else {
        statusEl.textContent = 'Geolocation is not supported by your browser.';
        statusEl.className = 'alert alert-danger';
    }
}

export async function init() {
    await initializeMap();
}

export function cleanup() {
    if (map) {
        map.remove();
        map = null;
    }
}