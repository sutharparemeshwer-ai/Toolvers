// js/tools/ip-info-finder.js
import { Toast } from '../ui.js';

const API_URL = "https://ipinfo.io/"; // Free tier (rate limited)

async function fetchIP(ip = '') {
    try {
        const url = `${API_URL}${ip ? ip + '/' : ''}json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API Limit or Network Error");
        const data = await res.json();
        render(data);
    } catch (e) {
        Toast.show('Lookup Failed', e.message, 'error');
    }
}

function render(data) {
    document.getElementById('res-ip').textContent = data.ip;
    document.getElementById('res-org').textContent = data.org || data.isp || 'Unknown';
    document.getElementById('res-loc').textContent = `${data.city}, ${data.region}, ${data.country}`;
    document.getElementById('res-coords').textContent = data.loc;

    if (data.loc) {
        const [lat, lon] = data.loc.split(',');
        // Using OpenStreetMap embed
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lon)-0.1},${parseFloat(lat)-0.1},${parseFloat(lon)+0.1},${parseFloat(lat)+0.1}&layer=mapnik&marker=${lat},${lon}`;
        document.getElementById('map-frame').src = mapUrl;
    }
}

export function init() {
    document.getElementById('find-ip-btn').addEventListener('click', () => {
        const ip = document.getElementById('ip-input').value.trim();
        fetchIP(ip);
    });
    
    // Initial fetch (own IP)
    fetchIP();
}

export function cleanup() {}