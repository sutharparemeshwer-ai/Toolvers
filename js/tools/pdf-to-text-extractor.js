// js/tools/pdf-to-text-extractor.js

// DOM Elements
let pdfInput, statusEl, textOutputEl;

// PDF.js library URL
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';

/**
 * Dynamically loads the pdf.js script.
 */
function loadPdfJs() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = PDFJS_URL;
        script.onload = () => {
            // Set the worker source for pdf.js
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Handles the file input change event.
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        statusEl.textContent = 'Please select a valid PDF file.';
        statusEl.className = 'alert alert-danger';
        return;
    }

    statusEl.textContent = 'Processing... this may take a moment for large files.';
    statusEl.className = 'alert alert-info d-block';
    textOutputEl.value = '';

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            textOutputEl.value = fullText.trim();
            statusEl.className = 'alert alert-success d-block';
            statusEl.textContent = `Successfully extracted text from ${pdf.numPages} pages.`;
        };
        fileReader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Error processing PDF:', error);
        statusEl.textContent = 'An error occurred while processing the PDF.';
        statusEl.className = 'alert alert-danger d-block';
    }
}

// --- Router Hooks ---

export async function init() {
    pdfInput = document.getElementById('pdf-input');
    statusEl = document.getElementById('processing-status');
    textOutputEl = document.getElementById('text-output');

    await loadPdfJs();
    pdfInput.addEventListener('change', handleFileSelect);
}

export function cleanup() {
    pdfInput.removeEventListener('change', handleFileSelect);
}