// js/tools/internet-speed-checker.js

// --- DOM Elements ---
let startBtn, statusEl, pingResultEl, downloadResultEl, uploadResultEl;

// --- Configuration ---
// Using a public file for download test. A larger file gives more accurate results.
const DOWNLOAD_FILE_URL = "https://cachefly.cachefly.net/10mb.test"; // 10MB file from a server with CORS enabled
const DOWNLOAD_FILE_SIZE_BYTES = 10 * 1000 * 1000;

// Using a public endpoint that accepts POST requests for upload test.
const UPLOAD_URL = "https://httpbin.org/post";
const UPLOAD_DATA_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// --- Helper Functions ---

function resetUI() {
  statusEl.textContent = 'Click "Start Test" to check your internet speed.';
  pingResultEl.textContent = "--";
  downloadResultEl.textContent = "--";
  uploadResultEl.textContent = "--";
  startBtn.disabled = false;
}

function bytesToMbps(bytes, durationSeconds) {
  if (durationSeconds === 0) return "Infinity";
  const bits = bytes * 8;
  const megabits = bits / (1024 * 1024);
  return (megabits / durationSeconds).toFixed(2);
}

// --- Test Functions ---

async function checkPing() {
  statusEl.textContent = "Checking ping...";
  const startTime = performance.now();
  try {
    await fetch(UPLOAD_URL, { method: "HEAD", cache: "no-store" });
    const endTime = performance.now();
    const ping = Math.round(endTime - startTime);
    pingResultEl.textContent = `${ping} ms`;
  } catch (error) {
    pingResultEl.textContent = "Error";
    throw new Error("Ping test failed.");
  }
}

async function checkDownloadSpeed() {
  statusEl.textContent = "Testing download speed...";
  const startTime = performance.now();
  try {
    const response = await fetch(DOWNLOAD_FILE_URL, { cache: "no-store" });
    await response.blob(); // Wait for the download to complete
    const endTime = performance.now();
    const durationSeconds = (endTime - startTime) / 1000;
    const speedMbps = bytesToMbps(DOWNLOAD_FILE_SIZE_BYTES, durationSeconds);
    downloadResultEl.textContent = speedMbps;
  } catch (error) {
    downloadResultEl.textContent = "Error";
    throw new Error("Download test failed.");
  }
}

async function checkUploadSpeed() {
  statusEl.textContent = "Testing upload speed...";
  // Generate some random data to upload
  const data = new Blob([new ArrayBuffer(UPLOAD_DATA_SIZE_BYTES)], {
    type: "application/octet-stream",
  });
  const startTime = performance.now();
  try {
    await fetch(UPLOAD_URL, {
      method: "POST",
      body: data,
      cache: "no-store",
    });
    const endTime = performance.now();
    const durationSeconds = (endTime - startTime) / 1000;
    const speedMbps = bytesToMbps(UPLOAD_DATA_SIZE_BYTES, durationSeconds);
    uploadResultEl.textContent = speedMbps;
  } catch (error) {
    uploadResultEl.textContent = "Error";
    throw new Error("Upload test failed.");
  }
}

// --- Main Handler ---

async function startTest() {
  startBtn.disabled = true;
  resetUI();

  try {
    await checkPing();
    await checkDownloadSpeed();
    await checkUploadSpeed();
    statusEl.textContent = "Test complete!";
  } catch (error) {
    statusEl.textContent = `Test failed: ${error.message}`;
  } finally {
    startBtn.disabled = false;
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  startBtn = document.getElementById("start-speed-test-btn");
  statusEl = document.getElementById("speed-test-status");
  pingResultEl = document.getElementById("ping-result");
  downloadResultEl = document.getElementById("download-result");
  uploadResultEl = document.getElementById("upload-result");

  // Attach event listener
  startBtn.addEventListener("click", startTest);
}

export function cleanup() {
  // Remove event listener
  if (startBtn) {
    startBtn.removeEventListener("click", startTest);
  }
}
