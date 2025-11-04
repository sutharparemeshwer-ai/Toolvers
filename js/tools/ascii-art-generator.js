// js/tools/ascii-art-generator.js

// --- DOM Elements ---
let imageUpload, densitySlider, invertCheckbox;
let outputContainer, outputPre, messageEl, copyBtn;
let canvas, ctx;

// --- ASCII Characters ---
// Ordered from darkest to lightest
const ASCII_CHARS = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."];

function grayScale(r, g, b) {
  return 0.21 * r + 0.72 * g + 0.07 * b;
}

function convertToAscii() {
  if (!canvas.width || !canvas.height) {
    messageEl.textContent = "Please upload a valid image first.";
    return;
  }

  messageEl.textContent = "Generating...";
  outputContainer.classList.add("d-none");

  // Use a timeout to allow the "Generating..." message to render
  setTimeout(() => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const isInverted = invertCheckbox.checked;

    let asciiImage = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];

        let gray = grayScale(r, g, b);
        if (isInverted) {
          gray = 255 - gray;
        }

        const charIndex = Math.floor((gray / 255) * (ASCII_CHARS.length - 1));
        asciiImage += ASCII_CHARS[charIndex];
      }
      asciiImage += "\n";
    }

    outputPre.textContent = asciiImage;
    outputContainer.classList.remove("d-none");
    messageEl.textContent = "";
  }, 50);
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const max_width = parseInt(densitySlider.value, 10);
      const scaleFactor = max_width / img.width;
      canvas.width = max_width;
      canvas.height = img.height * scaleFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      convertToAscii();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function handleCopy() {
  navigator.clipboard.writeText(outputPre.textContent).then(() => {
    copyBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-copy me-1"></i> Copy';
    }, 2000);
  });
}

export function init() {
  imageUpload = document.getElementById("ascii-image-upload");
  densitySlider = document.getElementById("ascii-density");
  invertCheckbox = document.getElementById("ascii-invert-colors");
  outputContainer = document.getElementById("ascii-output-container");
  outputPre = document.getElementById("ascii-output");
  messageEl = document.getElementById("ascii-message");
  copyBtn = document.getElementById("copy-ascii-btn");

  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d", { willReadFrequently: true });

  imageUpload.addEventListener("change", handleImageUpload);
  densitySlider.addEventListener("input", handleImageUpload);
  invertCheckbox.addEventListener("change", handleImageUpload);
  copyBtn.addEventListener("click", handleCopy);
}

export function cleanup() {
  // No complex cleanup needed as event listeners are on elements that will be removed
}
