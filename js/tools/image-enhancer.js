// js/tools/image-enhancer.js

// --- DOM Elements ---
let imageInput,
  previewsContainer,
  originalPreview,
  enhancedPreview,
  downloadBtn;

/**
 * Applies a pre-defined "enhancement" filter to an image on a canvas.
 * @param {HTMLImageElement} img - The source image element.
 * @returns {string} The data URL of the enhanced image.
 */
function enhanceImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // This is our "smart" enhancement filter.
  // It slightly increases contrast and saturation, and adjusts brightness.
  ctx.filter = "contrast(1.1) saturate(1.2) brightness(1.05)";

  ctx.drawImage(img, 0, 0);

  // Reset filter before returning data URL to avoid affecting other canvases
  ctx.filter = "none";

  return canvas.toDataURL("image/png");
}

/**
 * Handles the image upload event.
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    previewsContainer.classList.add("d-none");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const originalImage = new Image();
    originalImage.onload = () => {
      // Show original image
      originalPreview.src = e.target.result;

      // Enhance the image and show the result
      const enhancedDataUrl = enhanceImage(originalImage);
      enhancedPreview.src = enhancedDataUrl;
      downloadBtn.href = enhancedDataUrl;

      // Show the preview section
      previewsContainer.classList.remove("d-none");
    };
    originalImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  imageInput = document.getElementById("enhancer-image-input");
  previewsContainer = document.getElementById("enhancer-previews");
  originalPreview = document.getElementById("enhancer-original-preview");
  enhancedPreview = document.getElementById("enhancer-enhanced-preview");
  downloadBtn = document.getElementById("enhancer-download-btn");

  // Attach event listeners
  imageInput.addEventListener("change", handleImageUpload);
}

export function cleanup() {
  // No complex state to clean up, but good practice to have the function.
  if (previewsContainer) previewsContainer.classList.add("d-none");
  if (imageInput) imageInput.value = "";
}
