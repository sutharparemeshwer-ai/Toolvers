// js/tools/map-viewer.js

let map, marker, circle;
let currentLayer = 'dark'; // dark or street

function loadRes() {
    if(!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
    return new Promise(resolve => {
        if(window.L) return resolve();
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload = resolve;
        document.head.appendChild(s);
    });
}

function updateInfo(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    
    // Safety check if elements exist (in case user navigated away)
    const latEl = document.getElementById('val-lat');
    if(!latEl) return;

    latEl.textContent = latitude.toFixed(6);
    document.getElementById('val-long').textContent = longitude.toFixed(6);
    document.getElementById('val-acc').textContent = `±${Math.round(accuracy)}m`;
    document.getElementById('map-status').innerHTML = '<span class="text-success">● Active</span>';
    
    if(map) {
        const latlng = [latitude, longitude];
        if(!marker) {
            marker = L.marker(latlng).addTo(map);
            circle = L.circle(latlng, { radius: accuracy, color: '#3b82f6', opacity: 0.5 }).addTo(map);
            map.setView(latlng, 15);
        } else {
            marker.setLatLng(latlng);
            circle.setLatLng(latlng);
            circle.setRadius(accuracy);
        }
    }
}

function toggleLayer() {
    if(!map) return;
    
    if (currentLayer === 'dark') {
        currentLayer = 'street';
        map.eachLayer(l => { if(l._url) map.removeLayer(l); });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
        }).addTo(map);
    } else {
        currentLayer = 'dark';
        map.eachLayer(l => { if(l._url) map.removeLayer(l); });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
        }).addTo(map);
    }
}

async function start() {
    try {
        await loadRes();
        
        // Ensure container still exists
        if(!document.getElementById('map-container')) return;

        // Init Map
        if(map) map.remove(); // Cleanup previous if any
        map = L.map('map-container', { zoomControl: false }).setView([0,0], 2);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
        }).addTo(map);

        // Locate
        navigator.geolocation.getCurrentPosition(
            updateInfo, 
            err => {
                const el = document.getElementById('map-status');
                if(el) el.textContent = "GPS Error: " + err.message;
            },
            { enableHighAccuracy: true }
        );
    } catch(e) {
        console.error("Map Init Failed", e);
    }
}

export function init() {
    start();
    
    const btnLocate = document.getElementById('btn-locate');
    const btnLayer = document.getElementById('btn-layer');

    if(btnLocate) {
        btnLocate.onclick = () => {
            navigator.geolocation.getCurrentPosition(pos => {
                if(map) map.flyTo([pos.coords.latitude, pos.coords.longitude], 16);
            });
        };
    }
    
    if(btnLayer) {
        btnLayer.onclick = toggleLayer;
    }
}

export function cleanup() {
    if(map) { map.remove(); map = null; }
}