// js/tools/file-compressor.js

// --- DOM Elements ---
let compressInput, compressBtn, compressStatus, downloadZipBtn;
let decompressInput, decompressStatus, extractedFilesList;

// --- State ---
const JSZIP_CDN = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
let objectUrls = []; // To keep track of created URLs for cleanup

// --- Helper Functions ---
function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (window.JSZip) return resolve(); // Already loaded
        if (document.querySelector(`script[src="${url}"]`)) {
            // If script tag exists but JSZip is not on window, wait for it
            const existingScript = document.querySelector(`script[src="${url}"]`);
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${url}`)));
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// --- Core Logic ---

async function handleCompression() {
    const files = compressInput.files;
    if (files.length === 0) return;

    compressBtn.disabled = true;
    compressStatus.textContent = 'Compressing...';
    downloadZipBtn.classList.add('d-none');

    const zip = new JSZip();
    for (const file of files) {
        zip.file(file.name, file);
    }

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        objectUrls.push(url); // Track for cleanup

        downloadZipBtn.href = url;
        downloadZipBtn.classList.remove('d-none');
        compressStatus.textContent = `Compression complete! Size: ${formatBytes(content.size)}`;
    } catch (error) {
        compressStatus.textContent = `Error: ${error.message}`;
    } finally {
        compressBtn.disabled = false;
    }
}

async function handleDecompression(event) {
    const file = event.target.files[0];
    if (!file) return;

    decompressStatus.textContent = 'Reading ZIP file...';
    extractedFilesList.innerHTML = '<p class="text-muted">Extracting...</p>';

    try {
        const zip = await JSZip.loadAsync(file);
        extractedFilesList.innerHTML = ''; // Clear the list

        const filePromises = [];
        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const promise = zipEntry.async('blob').then(blob => {
                    const url = URL.createObjectURL(blob);
                    objectUrls.push(url); // Track for cleanup

                    const listItem = document.createElement('a');
                    listItem.href = url;
                    listItem.download = zipEntry.name;
                    listItem.className = 'list-group-item list-group-item-action';
                    listItem.textContent = `${zipEntry.name} (${formatBytes(blob.size)})`;
                    extractedFilesList.appendChild(listItem);
                });
                filePromises.push(promise);
            }
        });

        await Promise.all(filePromises);
        decompressStatus.textContent = `Extraction complete. Found ${filePromises.length} file(s).`;
        if (filePromises.length === 0) {
            extractedFilesList.innerHTML = '<p class="text-muted">No files found inside the ZIP archive.</p>';
        }

    } catch (error) {
        decompressStatus.textContent = `Error: ${error.message}`;
        extractedFilesList.innerHTML = '<p class="text-danger">Could not read the ZIP file. It may be corrupt or in an unsupported format.</p>';
    }
}

// --- Router Hooks ---

export async function init() {
    compressInput = document.getElementById('compress-files-input');
    compressBtn = document.getElementById('compress-btn');
    compressStatus = document.getElementById('compress-status');
    downloadZipBtn = document.getElementById('download-zip-btn');
    decompressInput = document.getElementById('decompress-file-input');
    decompressStatus = document.getElementById('decompress-status');
    extractedFilesList = document.getElementById('extracted-files-list');

    await loadScript(JSZIP_CDN);

    compressInput.addEventListener('change', () => compressBtn.disabled = compressInput.files.length === 0);
    compressBtn.addEventListener('click', handleCompression);
    decompressInput.addEventListener('change', handleDecompression);
}

export function cleanup() {
    // Revoke all created object URLs to prevent memory leaks
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
}