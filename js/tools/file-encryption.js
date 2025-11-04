// js/tools/file-encryption.js

// --- DOM Elements ---
let fileInput, passwordInput, encryptBtn, decryptBtn, statusEl;

// --- Crypto Configuration ---
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

// --- Helper Functions ---

function getFile() {
  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = "Please select a file.";
    return null;
  }
  return file;
}

function getPassword() {
  const password = passwordInput.value;
  if (password.length < 8) {
    statusEl.textContent = "Password must be at least 8 characters long.";
    return null;
  }
  return password;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Core Logic ---

async function handleEncrypt() {
  const file = getFile();
  const password = getPassword();
  if (!file || !password) return;

  statusEl.textContent = "Encrypting...";
  encryptBtn.disabled = true;

  try {
    const fileBuffer = await file.arrayBuffer();
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      fileBuffer
    );

    const encryptedFile = new Blob([
      salt,
      iv,
      new Uint8Array(encryptedContent),
    ]);
    triggerDownload(encryptedFile, `${file.name}.encrypted`);
    statusEl.textContent = "Encryption successful!";
  } catch (error) {
    console.error("Encryption failed:", error);
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    encryptBtn.disabled = false;
  }
}

async function handleDecrypt() {
  const file = getFile();
  const password = getPassword();
  if (!file || !password) return;

  statusEl.textContent = "Decrypting...";
  decryptBtn.disabled = true;

  try {
    const fileBuffer = await file.arrayBuffer();
    const salt = fileBuffer.slice(0, SALT_LENGTH);
    const iv = fileBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = fileBuffer.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(password, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    const decryptedFile = new Blob([decryptedContent]);
    const originalFilename = file.name.replace(/\.encrypted$/, "");
    triggerDownload(decryptedFile, originalFilename);
    statusEl.textContent = "Decryption successful!";
  } catch (error) {
    console.error("Decryption failed:", error);
    statusEl.textContent = "Decryption failed. Check your password or file.";
  } finally {
    decryptBtn.disabled = false;
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  fileInput = document.getElementById("file-input");
  passwordInput = document.getElementById("password-input");
  encryptBtn = document.getElementById("encrypt-btn");
  decryptBtn = document.getElementById("decrypt-btn");
  statusEl = document.getElementById("status-message");

  // Attach event listeners
  encryptBtn.addEventListener("click", handleEncrypt);
  decryptBtn.addEventListener("click", handleDecrypt);
}

export function cleanup() {
  // Remove event listeners
  if (encryptBtn) {
    encryptBtn.removeEventListener("click", handleEncrypt);
  }
  if (decryptBtn) {
    decryptBtn.removeEventListener("click", handleDecrypt);
  }
}
