// js/tools/image-to-pdf.js

// --- DOM Elements ---
let imageInput, previewsContainer, noImagesMsg, generateBtn, statusEl;

// --- Library URL ---
const JSPDF_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

// --- State ---
let selectedFiles = [];

/**
 * Dynamically loads a script from a CDN.
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve();
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Renders previews of the selected images.
 */
function renderPreviews() {
  previewsContainer.innerHTML = ""; // Clear existing previews
  noImagesMsg.classList.toggle("d-none", selectedFiles.length > 0);
  generateBtn.disabled = selectedFiles.length === 0;

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-4 col-lg-3";
      col.innerHTML = `
                <div class="img-preview-card position-relative">
                    <img src="${
                      e.target.result
                    }" class="img-fluid rounded" alt="Preview ${index + 1}">
                    <button class="btn btn-sm btn-danger remove-img-btn" data-index="${index}" title="Remove">&times;</button>
                </div>
            `;
      previewsContainer.appendChild(col);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Handles the initial file selection.
 */
function handleFileSelect(event) {
  selectedFiles = Array.from(event.target.files);
  renderPreviews();
}

/**
 * Handles removing an image from the selection.
 */
function handleRemoveImage(event) {
  if (!event.target.classList.contains("remove-img-btn")) return;
  const indexToRemove = parseInt(event.target.dataset.index, 10);
  selectedFiles.splice(indexToRemove, 1);
  renderPreviews();
}

/**
 * Generates and downloads the PDF.
 */
async function handleGeneratePdf() {
  if (selectedFiles.length === 0) return;

  generateBtn.disabled = true;
  statusEl.textContent = "Loading PDF library...";

  try {
    await loadScript(JSPDF_URL);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    statusEl.textContent = "Processing images... (0%)";

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();

      await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const ratio = img.width / img.height;

            let newWidth = pageWidth;
            let newHeight = newWidth / ratio;

            if (newHeight > pageHeight) {
              newHeight = pageHeight;
              newWidth = newHeight * ratio;
            }

            const x = (pageWidth - newWidth) / 2;
            const y = (pageHeight - newHeight) / 2;

            if (i > 0) doc.addPage();
            doc.addImage(e.target.result, "JPEG", x, y, newWidth, newHeight);
            resolve();
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
      statusEl.textContent = `Processing images... (${progress}%)`;
    }

    statusEl.textContent = "Generating PDF...";
    doc.save("images.pdf");
    statusEl.textContent = "PDF generated successfully!";
  } catch (error) {
    console.error("PDF Generation Error:", error);
    statusEl.textContent = "An error occurred while generating the PDF.";
  } finally {
    generateBtn.disabled = selectedFiles.length === 0;
  }
}

// --- Router Hooks ---

export function init() {
  imageInput = document.getElementById("img-to-pdf-input");
  previewsContainer = document.getElementById("image-previews-container");
  noImagesMsg = document.getElementById("no-images-selected");
  generateBtn = document.getElementById("generate-pdf-btn");
  statusEl = document.getElementById("pdf-status");

  imageInput.addEventListener("change", handleFileSelect);
  previewsContainer.addEventListener("click", handleRemoveImage);
  generateBtn.addEventListener("click", handleGeneratePdf);
}

export function cleanup() {
  selectedFiles = [];
  if (imageInput) imageInput.value = "";
  if (previewsContainer) previewsContainer.innerHTML = "";
}
