// js/tools/meme-generator.js

// 🚨 IMPORTANT: Replace 'YOUR_PEXELS_API_KEY' with your actual key.
const PEXELS_API_KEY = 'Lp0Zn1g49IJFacF8RLsNsSjqZaabSxV2hQcBy6q05EkaZddd46HCBfUx'; 
const API_BASE_URL = 'https://api.pexels.com/v1/';

// DOM Elements
let formEl, searchInputEl, resultsListEl, messageEl;
let topTextEl, bottomTextEl, generateBtn, downloadLinkEl;
let canvas, ctx;
let currentImage = new Image();

// --- Canvas and Drawing Logic ---

/**
 * Draws the current image and text onto the canvas.
 */
function drawMeme() {
    if (!currentImage.src) return;

    // 1. Set Canvas Dimensions to match image
    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;

    // 2. Draw the image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // 3. Setup Text Style
    ctx.strokeStyle = 'black'; // Outline
    ctx.lineWidth = 4;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    // Calculate font size based on image width (responsive text)
    const fontSize = Math.max(30, Math.floor(canvas.width / 12)); 
    ctx.font = `${fontSize}px Impact, sans-serif`;
    
    // 4. Draw Top Text
    const topText = topTextEl.value.toUpperCase();
    if (topText) {
        // Draw the text stroke (outline)
        ctx.strokeText(topText, canvas.width / 2, fontSize + 10);
        // Draw the text fill
        ctx.fillText(topText, canvas.width / 2, fontSize + 10);
    }

    // 5. Draw Bottom Text
    const bottomText = bottomTextEl.value.toUpperCase();
    if (bottomText) {
        // Draw the text stroke (outline)
        ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
        // Draw the text fill
        ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    }

    // Update the download link
    updateDownloadLink();
}

/**
 * Updates the download link with the current canvas content.
 */
function updateDownloadLink() {
    // Generate the image data URL from the canvas
    const dataURL = canvas.toDataURL('image/png');
    downloadLinkEl.href = dataURL;
    
    // Show the download button
    downloadLinkEl.classList.remove('d-none');
}

// --- Image Search and Selection Logic ---

/**
 * Fetches images from the Pexels API.
 */
async function fetchImages(query) {
    if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY') {
        showMessage("Error: Please set your Pexels API Key in js/tools/meme-generator.js", true);
        return;
    }
    
    const API_URL = `${API_BASE_URL}search?query=${encodeURIComponent(query)}&per_page=6`; // Get a few images

    showMessage("Searching Pexels...");
    
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': PEXELS_API_KEY }
        });
        
        if (!response.ok) {
            throw new Error("API call failed.");
        }

        const data = await response.json();
        renderResults(data.photos);

    } catch (error) {
        console.error('Pexels API Fetch error:', error);
        showMessage("🚨 Search failed. Check console or API key.", true);
    }
}

/**
 * Renders the image options as clickable thumbnails.
 */
function renderResults(photos) {
    resultsListEl.innerHTML = '';
    
    if (!photos || photos.length === 0) {
        showMessage("No images found. Try a different term.");
        return;
    }
    
    photos.forEach(photo => {
        const item = document.createElement('a');
        item.classList.add('list-group-item', 'list-group-item-action', 'p-1', 'd-flex', 'align-items-center');
        item.href = '#';
        item.dataset.imgUrl = photo.src.large;
        
        const img = document.createElement('img');
        img.src = photo.src.small;
        img.alt = photo.alt;
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.objectFit = 'cover';
        img.classList.add('rounded', 'me-2');

        const text = document.createTextNode(`By ${photo.photographer}`);
        
        item.appendChild(img);
        item.appendChild(text);

        item.addEventListener('click', selectImage);
        resultsListEl.appendChild(item);
    });
    
    showMessage(`Found ${photos.length} images. Select one to begin.`);
}

/**
 * Handles the selection of a background image.
 */
function selectImage(e) {
    e.preventDefault();
    const selectedUrl = e.currentTarget.dataset.imgUrl;
    
    // 1. Clear previous selections
    document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // 2. Load the image into the JS Image object
    currentImage.onload = () => {
        drawMeme(); // Draw meme once the image is fully loaded
        generateBtn.disabled = false;
        showMessage("Image loaded. Type text and click 'Draw Text'.");
    };
    currentImage.crossOrigin = "Anonymous"; // Essential for using canvas on external images
    currentImage.src = selectedUrl;
}

// --- Utility Functions ---

function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.className = isError ? 'text-danger' : 'text-info';
}

// --- Event Handlers ---

function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchInputEl.value.trim();
    if (query) {
        fetchImages(query);
    } else {
        showMessage("Please enter a search query.", true);
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements and Canvas Context
    formEl = document.getElementById('meme-controls-form');
    searchInputEl = document.getElementById('image-search-input');
    resultsListEl = document.getElementById('search-results-list');
    messageEl = document.getElementById('search-message');
    topTextEl = document.getElementById('top-text-input');
    bottomTextEl = document.getElementById('bottom-text-input');
    generateBtn = document.getElementById('generate-meme-btn');
    downloadLinkEl = document.getElementById('download-meme-link');

    canvas = document.getElementById('meme-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    } else {
        console.error("Canvas element not found!");
        return;
    }

    // 2. Attach listeners
    if (formEl) formEl.addEventListener('submit', handleSearchSubmit);
    if (generateBtn) generateBtn.addEventListener('click', drawMeme);
    
    // Listen to text changes to re-draw the meme immediately
    topTextEl.addEventListener('input', drawMeme);
    bottomTextEl.addEventListener('input', drawMeme);

    // Initial setup: draw a placeholder box
    canvas.width = 500;
    canvas.height = 300;
    ctx.fillStyle = '#1e201f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6c757d';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Search and select an image to begin', canvas.width / 2, canvas.height / 2);

    showMessage("Enter a search term and hit 'Search'.");
}

export function cleanup() {
    if (formEl) formEl.removeEventListener('submit', handleSearchSubmit);
    if (generateBtn) generateBtn.removeEventListener('click', drawMeme);
    topTextEl.removeEventListener('input', drawMeme);
    bottomTextEl.removeEventListener('input', drawMeme);
    
    // Clear the current image source
    currentImage.src = ''; 
}