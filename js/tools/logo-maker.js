// js/tools/logo-maker.js

// --- DOM Elements ---
let textInput,
  iconSelect,
  fontSelect,
  textColorPicker,
  iconColorPicker,
  fontSizeSlider,
  fontSizeValue,
  layoutOptions,
  downloadBtn,
  previewArea,
  preview,
  previewIcon,
  previewText;

// --- Library URL ---
const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

// --- Icon Data ---
const ICONS = [
  // Original
  "star",
  "heart",
  "globe",
  "camera",
  "rocket",
  "lightbulb",
  "gem",
  "shield-halved",
  "fire",
  "leaf",
  "key",
  "anchor",
  "coffee",
  "book",
  "music",
  "gamepad",
  // Added
  "crown",
  "bolt",
  "cloud",
  "tree",
  "car",
  "building",
  "laptop",
  "code",
  "chart-pie",
  "compass",
  "atom",
  "graduation-cap",
  "wrench",
  "cogs",
  "paper-plane",
  "sun",
  "moon",
  "award",
  "bell",
  "bicycle",
  "bomb",
  "bone",
  "briefcase",
  "bug",
  "bullseye",
  "calculator",
  "calendar",
  "certificate",
  "check",
  "chess",
  "cloud-rain",
  "code-branch",
];

/**
 * Dynamically loads a script from a CDN.
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Populates the icon selector dropdown.
 */
function populateIcons() {
  iconSelect.innerHTML = ICONS.map(
    (icon) =>
      `<option value="fa-${icon}">${
        icon.charAt(0).toUpperCase() + icon.slice(1).replace("-", " ")
      }</option>`
  ).join("");
  // Set initial icon for display
  iconSelect.value = "fa-star";
}

// --- Update Functions ---

function updateLogo() {
  // Text
  const text = textInput.value;
  previewText.textContent = text;

  // Icon
  const selectedIcon = iconSelect.value;
  previewIcon.className = `fa-solid ${selectedIcon}`;

  // Font
  previewText.style.fontFamily = fontSelect.value;

  // Colors
  previewText.style.color = textColorPicker.value;
  previewIcon.style.color = iconColorPicker.value;

  // Font Size
  const size = fontSizeSlider.value;
  previewText.style.fontSize = `${size}px`;
  previewIcon.style.fontSize = `${size * 1.25}px`; // Icon slightly larger
  fontSizeValue.textContent = size;

  // Layout
  const layout = document.querySelector("#logo-layout-options .active").dataset
    .layout;
  preview.classList.remove(
    "flex-column",
    "flex-row",
    "flex-row-reverse",
    "flex-column-reverse"
  );
  previewText.classList.remove("mt-2", "ms-3", "me-3", "mb-2");

  switch (layout) {
    case "left":
      preview.classList.add("flex-row");
      previewText.classList.add("ms-3");
      break;
    case "right":
      preview.classList.add("flex-row-reverse");
      previewText.classList.add("me-3");
      break;
    case "bottom":
      preview.classList.add("flex-column-reverse");
      previewText.classList.add("mb-2");
      break;
    case "top":
    default:
      preview.classList.add("flex-column");
      previewText.classList.add("mt-2");
      break;
  }
}

// --- Event Handlers ---

function handleLayoutChange(e) {
  const button = e.target.closest("button");
  if (!button) return;

  // Update active state
  document
    .querySelectorAll("#logo-layout-options button")
    .forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  updateLogo();
}

async function handleDownload() {
  downloadBtn.disabled = true;
  downloadBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing...';

  try {
    await loadScript(HTML2CANVAS_URL);
    const canvas = await html2canvas(preview, {
      backgroundColor: null, // Transparent background
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${textInput.value || "logo"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to download logo:", error);
    alert("Sorry, something went wrong while creating the image.");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML =
      '<i class="fa-solid fa-download me-2"></i>Download as PNG';
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  textInput = document.getElementById("logo-text-input");
  iconSelect = document.getElementById("logo-icon-select");
  fontSelect = document.getElementById("logo-font-select");
  textColorPicker = document.getElementById("logo-text-color");
  iconColorPicker = document.getElementById("logo-icon-color");
  fontSizeSlider = document.getElementById("logo-font-size-slider");
  fontSizeValue = document.getElementById("logo-font-size-value");
  layoutOptions = document.getElementById("logo-layout-options");
  downloadBtn = document.getElementById("download-logo-btn");
  previewArea = document.getElementById("logo-preview-area");
  preview = document.getElementById("logo-preview");
  previewIcon = document.getElementById("logo-preview-icon");
  previewText = document.getElementById("logo-preview-text");

  // Initial setup
  populateIcons();
  updateLogo();

  // Attach event listeners
  [
    textInput,
    iconSelect,
    fontSelect,
    textColorPicker,
    iconColorPicker,
    fontSizeSlider,
  ].forEach((el) => {
    el.addEventListener("input", updateLogo);
  });
  layoutOptions.addEventListener("click", handleLayoutChange);
  downloadBtn.addEventListener("click", handleDownload);
}

export function cleanup() {
  // No complex cleanup needed as event listeners are on elements that will be removed.
}
