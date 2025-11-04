// js/tools/favicon-generator.js

// --- DOM Elements ---
let canvas, ctx, downloadBtn;
let imageInput, charInput, bgColorPicker, fontColorPicker, cornerRadiusSlider;

// --- State ---
let backgroundImage = null;

/**
 * Draws the current state onto the canvas.
 */
function drawFavicon() {
  if (!canvas || !ctx) return;

  const char = charInput.value.toUpperCase();
  const bgColor = bgColorPicker.value;
  const fontColor = fontColorPicker.value;
  const radius = parseInt(cornerRadiusSlider.value, 10);
  const w = canvas.width;
  const h = canvas.height;

  // Save context state
  ctx.save();

  // Clear canvas completely
  ctx.clearRect(0, 0, w, h);

  // Create a rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();

  // Clip all future drawing to this path
  ctx.clip();

  // Draw background color within the clipped area
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Draw background image if it exists
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Draw character
  if (char) {
    ctx.fillStyle = fontColor;
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, canvas.width / 2, canvas.height / 2 + 5); // +5 for better vertical centering
  }

  // Restore context to remove the clipping path for subsequent draws
  ctx.restore();

  // Generate the downloadable ICO file
  generateIco();
}

/**
 * Generates a 32x32 ICO file from the main canvas and updates the download link.
 */
function generateIco() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = 32;
  tempCanvas.height = 32;

  // Draw the main canvas content onto the smaller temporary canvas
  tempCtx.drawImage(canvas, 0, 0, 32, 32);

  // Convert the 32x32 canvas to a PNG data URL
  const pngDataUrl = tempCanvas.toDataURL("image/png");

  // Convert the PNG data URL to the ICO format (as a data URL)
  const icoDataUrl = pngToIco(pngDataUrl);

  downloadBtn.href = icoDataUrl;
  downloadBtn.classList.remove("disabled");
}

/**
 * Converts a PNG data URL into an ICO data URL.
 * An ICO file is a small header followed by the raw PNG data.
 * @param {string} pngDataUrl - The data URL of the 32x32 PNG.
 * @returns {string} The data URL for the ICO file.
 */
function pngToIco(pngDataUrl) {
  // Extract the Base64 part of the PNG data URL
  const base64Png = pngDataUrl.substring(pngDataUrl.indexOf(",") + 1);
  const binaryPng = atob(base64Png);

  // ICO header (6 bytes)
  const header = [0, 0, 1, 0, 1, 0]; // Reserved, Type (Icon), Image Count

  // ICONDIRENTRY (16 bytes)
  const entry = [
    32, // Width
    32, // Height
    0, // Color Palette (0 for no palette)
    0, // Reserved
    1,
    0, // Color Planes
    32,
    0, // Bits Per Pixel
  ];

  const pngSize = binaryPng.length;
  entry.push(
    pngSize & 255,
    (pngSize >> 8) & 255,
    (pngSize >> 16) & 255,
    (pngSize >> 24) & 255
  );

  // Offset to the PNG data (22 bytes: 6 for header + 16 for entry)
  entry.push(22, 0, 0, 0);

  // Combine header, entry, and PNG data
  const icoData = new Uint8Array(header.concat(entry));
  const finalIco = new Uint8Array(icoData.length + pngSize);
  finalIco.set(icoData, 0);

  for (let i = 0; i < pngSize; i++) {
    finalIco[icoData.length + i] = binaryPng.charCodeAt(i);
  }

  // Convert the final binary data to a Base64 data URL
  const base64Ico = btoa(String.fromCharCode.apply(null, finalIco));
  return `data:image/x-icon;base64,${base64Ico}`;
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    backgroundImage = null;
    drawFavicon();
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      backgroundImage = img;
      drawFavicon();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

export function init() {
  canvas = document.getElementById("favicon-canvas");
  ctx = canvas.getContext("2d");
  downloadBtn = document.getElementById("download-favicon-btn");
  imageInput = document.getElementById("favicon-image");
  charInput = document.getElementById("favicon-char");
  bgColorPicker = document.getElementById("favicon-bg-color");
  fontColorPicker = document.getElementById("favicon-font-color");
  cornerRadiusSlider = document.getElementById("favicon-corner-radius");

  const form = document.querySelector(".card");
  form.addEventListener("input", drawFavicon);
  imageInput.addEventListener("change", handleImageUpload);

  drawFavicon(); // Initial draw
}

export function cleanup() {
  const form = document.querySelector(".card");
  if (form) form.removeEventListener("input", drawFavicon);
  if (imageInput) imageInput.removeEventListener("change", handleImageUpload);
  backgroundImage = null;
}
