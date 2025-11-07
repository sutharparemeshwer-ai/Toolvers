// js/tools/image-to-pdf.js

// --- DOM Elements ---
let imageInput, previewsContainer, noImagesMsg, generateBtn, statusEl;

// --- Library URL ---
const JSPDF_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const SORTABLE_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js";

// --- State ---
let selectedFiles = [];

/**
 * Dynamically loads a script from a CDN.
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    // A simple check to see if the library's main object exists
    if (url === JSPDF_URL && window.jspdf) return resolve();
    if (url === SORTABLE_URL && window.Sortable) return resolve();

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
      const col = document.createElement("div"); // This will be the draggable item
      col.className = "col-6 col-md-4 col-lg-3";
      col.innerHTML = `
                <div class="img-preview-card position-relative">
                    <img src="${
                      e.target.result
                    }" class="img-fluid rounded" alt="Preview ${index + 1}">
                    <button class="btn btn-sm btn-danger remove-img-btn" data-index="${index}" title="Remove">&times;</button>
                </div>
            `;
      col.dataset.originalIndex = index; // Store original index for reordering
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

/**
 * Initializes the SortableJS library for drag-and-drop reordering.
 */
function initSortable() {
  if (window.Sortable) {
    new Sortable(previewsContainer, {
      animation: 150,
      ghostClass: "bg-primary",
      onEnd: (evt) => {
        // Reorder the selectedFiles array based on the new DOM order
        const newOrder = Array.from(evt.to.children).map((el) =>
          parseInt(el.dataset.originalIndex, 10)
        );
        const reorderedFiles = newOrder.map((i) => selectedFiles[i]);
        selectedFiles = reorderedFiles;
        // Re-render to update indices and data attributes
        renderPreviews();
      },
    });
  }
}

// --- Router Hooks ---

export async function init() {
  imageInput = document.getElementById("img-to-pdf-input");
  previewsContainer = document.getElementById("image-previews-container");
  noImagesMsg = document.getElementById("no-images-selected");
  generateBtn = document.getElementById("generate-pdf-btn");
  statusEl = document.getElementById("pdf-status");

  imageInput.addEventListener("change", handleFileSelect);
  previewsContainer.addEventListener("click", handleRemoveImage);
  generateBtn.addEventListener("click", handleGeneratePdf);

  // Load SortableJS and initialize it
  try {
    await loadScript(SORTABLE_URL);
    initSortable();
  } catch (error) {
    console.warn("Could not load SortableJS. Drag-and-drop will be disabled.");
  }
}

export function cleanup() {
  selectedFiles = [];
  if (imageInput) imageInput.value = "";
  if (previewsContainer) previewsContainer.innerHTML = "";
}
