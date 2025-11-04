// js/tools/company-logo-finder.js

// --- DOM Elements ---
let domainInput, findBtn, resultContainer, statusEl, previewEl, downloadBtn;

// --- API ---
const API_BASE_URL = "https://logo.clearbit.com/";

// --- Helper Functions ---

function showStatus(message, isError = false) {
  previewEl.style.display = "none";
  downloadBtn.classList.add("d-none");
  statusEl.textContent = message;
  statusEl.className = isError ? "text-danger" : "text-muted";
  statusEl.style.display = "block";
}

function showLogo(imageUrl, domain) {
  statusEl.style.display = "none";
  previewEl.src = imageUrl;
  previewEl.alt = `${domain} logo`;
  previewEl.style.display = "block";
  downloadBtn.href = imageUrl;
  downloadBtn.download = `${domain.split(".")[0]}-logo.png`;
  downloadBtn.classList.remove("d-none");
}

// --- Core Logic ---

function findLogo() {
  const domain = domainInput.value.trim();
  if (!domain) {
    showStatus("Please enter a company domain.", true);
    return;
  }

  showStatus("Searching for logo...");

  const logoUrl = `${API_BASE_URL}${domain}`;

  // We use an Image object to check if the logo exists before showing it.
  // This helps handle 404 errors gracefully.
  const img = new Image();

  img.onload = () => {
    // The image loaded successfully
    showLogo(logoUrl, domain);
  };

  img.onerror = () => {
    // The image failed to load (likely a 404)
    showStatus(
      `Could not find a logo for "${domain}". Try another domain.`,
      true
    );
  };

  img.src = logoUrl;
}

// --- Event Handlers ---

function handleKeyPress(e) {
  if (e.key === "Enter") {
    findLogo();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  domainInput = document.getElementById("domain-input");
  findBtn = document.getElementById("find-logo-btn");
  resultContainer = document.getElementById("logo-result-container");
  statusEl = document.getElementById("logo-status");
  previewEl = document.getElementById("logo-preview");
  downloadBtn = document.getElementById("download-logo-btn");

  // Attach event listeners
  findBtn.addEventListener("click", findLogo);
  domainInput.addEventListener("keypress", handleKeyPress);
}

export function cleanup() {
  // Remove event listeners to prevent memory leaks
  if (findBtn) {
    findBtn.removeEventListener("click", findLogo);
  }
  if (domainInput) {
    domainInput.removeEventListener("keypress", handleKeyPress);
  }
}
