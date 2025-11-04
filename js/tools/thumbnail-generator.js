// js/tools/thumbnail-generator.js

// --- DOM Elements ---
let bgImageInput,
  fontFamilySelect,
  mainTextInput,
  subtitleTextInput,
  fontSizeSlider,
  fontSizeValue,
  textColorPicker,
  subtitleSizeSlider,
  subtitleSizeValue,
  subtitleColorPicker,
  textShadowSwitch;
let previewArea, previewText, previewSubtitle, downloadBtn;

// --- Library URL ---
const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

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
 * Updates the preview based on the current control values.
 */
function updatePreview() {
  // Update text content
  previewText.textContent = mainTextInput.value.trim();
  previewSubtitle.textContent = subtitleTextInput.value.trim();

  // Update font family
  const font = fontFamilySelect.value;
  previewText.style.fontFamily = font;
  previewSubtitle.style.fontFamily = font;

  // Update font size
  const size = fontSizeSlider.value;
  previewText.style.fontSize = `${size}px`;
  fontSizeValue.textContent = size;

  // Update subtitle font size
  const subSize = subtitleSizeSlider.value;
  previewSubtitle.style.fontSize = `${subSize}px`;
  subtitleSizeValue.textContent = subSize;

  // Update text color
  previewText.style.color = textColorPicker.value;

  // Update subtitle color
  previewSubtitle.style.color = subtitleColorPicker.value;

  // Update text shadow
  if (textShadowSwitch.checked) {
    const shadow = "2px 2px 8px rgba(0,0,0,0.8)";
    previewText.style.textShadow = shadow;
    previewSubtitle.style.textShadow = shadow;
  } else {
    previewText.style.textShadow = "none";
    previewSubtitle.style.textShadow = "none";
  }
}

/**
 * Handles the background image file upload.
 */
function handleBgImageChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewArea.style.backgroundImage = `url('${e.target.result}')`;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Handles the download button click, using html2canvas to generate the image.
 */
async function handleDownload() {
  downloadBtn.disabled = true;
  downloadBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing...';

  try {
    await loadScript(HTML2CANVAS_URL);
    const canvas = await html2canvas(previewArea, {
      logging: false,
      useCORS: true, // Important for external images if you add them later
    });
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9); // Use JPEG for smaller file size
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "thumbnail.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to generate thumbnail:", error);
    alert("Sorry, something went wrong while creating the image.");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML =
      '<i class="fa-solid fa-download me-2"></i>Download Thumbnail';
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  bgImageInput = document.getElementById("thumb-bg-image");
  fontFamilySelect = document.getElementById("thumb-font-family");
  mainTextInput = document.getElementById("thumb-main-text");
  subtitleTextInput = document.getElementById("thumb-subtitle-text");
  fontSizeSlider = document.getElementById("thumb-font-size");
  fontSizeValue = document.getElementById("thumb-font-size-value");
  textColorPicker = document.getElementById("thumb-text-color");
  subtitleSizeSlider = document.getElementById("thumb-subtitle-size");
  subtitleSizeValue = document.getElementById("thumb-subtitle-size-value");
  subtitleColorPicker = document.getElementById("thumb-subtitle-color");
  textShadowSwitch = document.getElementById("thumb-text-shadow");
  previewArea = document.getElementById("thumbnail-preview-area");
  previewText = document.getElementById("thumbnail-preview-text");
  previewSubtitle = document.getElementById("thumbnail-preview-subtitle");
  downloadBtn = document.getElementById("thumb-download-btn");

  // Attach event listeners
  bgImageInput.addEventListener("change", handleBgImageChange);
  fontFamilySelect.addEventListener("change", updatePreview);
  mainTextInput.addEventListener("input", updatePreview);
  subtitleTextInput.addEventListener("input", updatePreview);
  fontSizeSlider.addEventListener("input", updatePreview);
  textColorPicker.addEventListener("input", updatePreview);
  subtitleSizeSlider.addEventListener("input", updatePreview);
  subtitleColorPicker.addEventListener("input", updatePreview);
  textShadowSwitch.addEventListener("change", updatePreview);
  downloadBtn.addEventListener("click", handleDownload);

  // Initial render
  updatePreview();
}

export function cleanup() {
  // Event listeners are on elements that will be removed, so no complex cleanup needed.
}
