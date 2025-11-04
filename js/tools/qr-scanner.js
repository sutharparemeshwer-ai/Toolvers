// js/tools/qr-scanner.js

// --- DOM Elements ---
let videoEl, statusEl, toggleBtn, scanFileBtn, scanFileInput;
let canvas, ctx;

// --- State ---
let stream = null;
let animationFrameId = null;
const JSQR_CDN = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';

// --- Helper Functions ---

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            return resolve();
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

// --- Core Scanner Logic ---

function tick() {
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        canvas.height = videoEl.videoHeight;
        canvas.width = videoEl.videoWidth;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            statusEl.className = 'alert alert-success text-center';
            statusEl.innerHTML = `<strong>Found QR Code:</strong> <a href="${code.data}" target="_blank" class="alert-link">${code.data}</a>`;
            stopScanner();
            return;
        }
    }
    animationFrameId = requestAnimationFrame(tick);
}

async function startScanner() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoEl.srcObject = stream;
        videoEl.setAttribute("playsinline", true); // Required for iOS
        videoEl.play();

        statusEl.textContent = 'Scanning...';
        statusEl.className = 'alert alert-info text-center';
        toggleBtn.textContent = 'Stop Camera';

        animationFrameId = requestAnimationFrame(tick);
    } catch (err) {
        console.error("Camera Error:", err);
        statusEl.textContent = `Error: Could not access camera. ${err.message}`;
        statusEl.className = 'alert alert-danger text-center';
    }
}

function stopScanner() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    toggleBtn.textContent = 'Start Camera';
}

function scanImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        statusEl.textContent = 'Please select a valid image file.';
        statusEl.className = 'alert alert-warning text-center';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Draw image to canvas
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Scan for QR code
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                statusEl.className = 'alert alert-success text-center';
                statusEl.innerHTML = `<strong>Found QR Code:</strong> <a href="${code.data}" target="_blank" class="alert-link">${code.data}</a>`;
            } else {
                statusEl.className = 'alert alert-warning text-center';
                statusEl.textContent = 'No QR code found in the uploaded image.';
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleToggle() {
    if (stream) {
        stopScanner();
        statusEl.textContent = 'Camera stopped. Click Start to scan again.';
        statusEl.className = 'alert alert-info text-center';
    } else {
        startScanner();
    }
}

// --- Router Hooks ---

export async function init() {
    // Get DOM elements
    videoEl = document.getElementById('scanner-video');
    statusEl = document.getElementById('scanner-status');
    toggleBtn = document.getElementById('scanner-toggle-btn');
    scanFileBtn = document.getElementById('scan-file-btn');
    scanFileInput = document.getElementById('scan-file-input');

    // Create a canvas element for processing frames
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    try {
        await loadScript(JSQR_CDN);
        toggleBtn.addEventListener('click', handleToggle);
        scanFileBtn.addEventListener('click', () => scanFileInput.click());
        scanFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                scanImageFile(e.target.files[0]);
            }
        });
    } catch (error) {
        console.error(error);
        statusEl.textContent = 'Error: Could not load the QR scanning library.';
        statusEl.className = 'alert alert-danger text-center';
        toggleBtn.disabled = true;
    }
}

export function cleanup() {
    stopScanner();
    if (toggleBtn) {
        toggleBtn.removeEventListener('click', handleToggle);
    }
    if (scanFileBtn) {
        scanFileBtn.removeEventListener('click', () => scanFileInput.click());
    }
    if (scanFileInput) {
        scanFileInput.removeEventListener('change', scanImageFile);
    }
}