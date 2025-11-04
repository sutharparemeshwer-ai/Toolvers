// js/tools/image-compressor.js

// --- DOM Elements ---
let uploadInput, controlsContainer, processBtn, downloadBtn;
let widthInput, heightInput, qualitySlider, qualityValue;
let originalPreview, originalInfo;
let compressedPreview, compressedInfo, compressedPreviewContainer;

// --- State ---
let originalImageFile = null;

// --- Helper Functions ---

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// --- Core Logic ---

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        controlsContainer.classList.add('d-none');
        return;
    }

    originalImageFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        const img = new Image();
        img.onload = () => {
            originalInfo.textContent = `Dimensions: ${img.naturalWidth}x${img.naturalHeight} | Size: ${formatBytes(file.size)}`;
            widthInput.value = img.naturalWidth;
            heightInput.value = img.naturalHeight;
            controlsContainer.classList.remove('d-none');
            compressedPreview.classList.add('d-none');
            compressedPreviewContainer.querySelector('span').classList.remove('d-none');
            downloadBtn.classList.add('d-none');
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function processImage() {
    if (!originalImageFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let targetWidth = parseInt(widthInput.value) || img.naturalWidth;
            let targetHeight = parseInt(heightInput.value) || img.naturalHeight;

            const aspectRatio = img.naturalWidth / img.naturalHeight;

            if (targetWidth / targetHeight > aspectRatio) {
                targetWidth = targetHeight * aspectRatio;
            } else {
                targetHeight = targetWidth / aspectRatio;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const quality = parseFloat(qualitySlider.value);
            const mimeType = originalImageFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(mimeType, quality);

            compressedPreview.src = dataUrl;
            compressedPreview.classList.remove('d-none');
            compressedPreviewContainer.querySelector('span').classList.add('d-none');

            // Calculate new size
            const newSize = atob(dataUrl.split(',')[1]).length;
            compressedInfo.textContent = `Dimensions: ${Math.round(targetWidth)}x${Math.round(targetHeight)} | Size: ${formatBytes(newSize)}`;

            downloadBtn.href = dataUrl;
            const fileExtension = mimeType.split('/')[1];
            downloadBtn.download = `compressed-image.${fileExtension}`;
            downloadBtn.classList.remove('d-none');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(originalImageFile);
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    uploadInput = document.getElementById('image-upload-input');
    controlsContainer = document.getElementById('controls-and-previews');
    processBtn = document.getElementById('process-btn');
    downloadBtn = document.getElementById('download-btn');
    widthInput = document.getElementById('resize-width');
    heightInput = document.getElementById('resize-height');
    qualitySlider = document.getElementById('quality-slider');
    qualityValue = document.getElementById('quality-value');
    originalPreview = document.getElementById('original-preview');
    originalInfo = document.getElementById('original-info');
    compressedPreview = document.getElementById('compressed-preview');
    compressedInfo = document.getElementById('compressed-info');
    compressedPreviewContainer = document.getElementById('compressed-preview-container');

    // Attach event listeners
    uploadInput.addEventListener('change', handleImageUpload);
    processBtn.addEventListener('click', processImage);
    qualitySlider.addEventListener('input', () => qualityValue.textContent = qualitySlider.value);
}

export function cleanup() {
    // Reset state when leaving the tool
    originalImageFile = null;
}