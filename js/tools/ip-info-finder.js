// js/tools/ip-info-finder.js

// --- DOM Elements ---
let ipInput, findBtn, statusEl, resultsContainer;
let resultIpEl, resultLocationEl, resultIspEl, resultOrgEl, mapLinkEl;

// --- API ---
const API_BASE_URL = "https://ipinfo.io/";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  resultsContainer.classList.add("d-none");
  statusEl.textContent = message;
  statusEl.className = `text-center small mt-2 ${
    isError ? "text-danger" : "text-muted"
  }`;
}

function renderResults(data) {
  if (data.error) {
    showStatus(`Error: ${data.error.message}`, true);
    return;
  }

  statusEl.textContent = "";
  resultIpEl.textContent = data.ip;
  resultLocationEl.textContent = `${data.city}, ${data.region}, ${data.country}`;
  resultIspEl.textContent = data.isp;
  resultOrgEl.textContent = data.org || "N/A";
  const [lat, lon] = data.loc.split(",");
  mapLinkEl.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

  resultsContainer.classList.remove("d-none");
}

// --- Core Logic ---

async function findIpInfo() {
  const ip = ipInput.value.trim();
  const url = `${API_BASE_URL}${ip}/json`;

  showStatus("Fetching information...");
  findBtn.disabled = true;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await response.json();
    renderResults(data);
  } catch (error) {
    console.error("IP Info Fetch Error:", error);
    showStatus("Failed to fetch IP information. Please try again.", true);
  } finally {
    findBtn.disabled = false;
  }
}

// --- Event Handlers ---

function handleKeyPress(e) {
  if (e.key === "Enter") {
    findIpInfo();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  ipInput = document.getElementById("ip-input");
  findBtn = document.getElementById("find-ip-btn");
  statusEl = document.getElementById("ip-status");
  resultsContainer = document.getElementById("ip-results-container");
  resultIpEl = document.getElementById("result-ip");
  resultLocationEl = document.getElementById("result-location");
  resultIspEl = document.getElementById("result-isp");
  resultOrgEl = document.getElementById("result-org");
  mapLinkEl = document.getElementById("map-link");

  // Attach event listeners
  findBtn.addEventListener("click", findIpInfo);
  ipInput.addEventListener("keypress", handleKeyPress);

  // Automatically fetch info for the user's IP on load
  findIpInfo();
}

export function cleanup() {
  // Remove event listeners
  if (findBtn) {
    findBtn.removeEventListener("click", findIpInfo);
  }
  if (ipInput) {
    ipInput.removeEventListener("keypress", handleKeyPress);
  }
}
