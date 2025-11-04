// js/tools/drawing-app.js

// Canvas and Context variables
let canvas, ctx;

// State variables for drawing
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Control variables
let currentColor = '#37bca4';
let currentSize = 5;

// DOM elements
let colorPickerEl, sizeSliderEl, clearBtnEl;

// --- Core Drawing Logic ---

/**
 * Starts the drawing process (on mousedown)
 */
function startDrawing(e) {
    isDrawing = true;
    // Get the exact coordinates relative to the canvas
    [lastX, lastY] = getMousePos(e);
}

/**
 * Draws the line as the mouse moves
 */
function draw(e) {
    if (!isDrawing) return; // Stop the function if the mouse is not down

    // Get the current mouse position
    const [currentX, currentY] = getMousePos(e);

    // Start drawing the line path
    ctx.beginPath();
    
    // Set line properties
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round'; // Makes lines look smooth

    // Move the pen to the last position and draw a line to the current position
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Update the last position to the current position for the next movement
    lastX = currentX;
    lastY = currentY;
}

/**
 * Stops the drawing process (on mouseup or mouseleave)
 */
function stopDrawing() {
    isDrawing = false;
}

/**
 * Helper function to get the mouse position relative to the canvas.
 */
function getMousePos(e) {
    // Get canvas position offsets
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position relative to canvas viewport
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    return [x, y];
}


// --- Control Handlers ---

function handleColorChange(e) {
    currentColor = e.target.value;
}

function handleSizeChange(e) {
    currentSize = e.target.value;
}

function handleClearCanvas() {
    // Fills the entire canvas with a white rectangle
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


// --- Router Hooks ---

export function init() {
    // 1. Get Canvas and Context
    canvas = document.getElementById('drawing-canvas');
    // Check if canvas exists and context can be retrieved
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    ctx = canvas.getContext('2d');
    
    // Draw initial white background
    handleClearCanvas(); 

    // 2. Get Control Elements
    colorPickerEl = document.getElementById('color-picker');
    sizeSliderEl = document.getElementById('size-slider');
    clearBtnEl = document.getElementById('clear-btn');

    // 3. Attach Control Listeners
    colorPickerEl.addEventListener('input', handleColorChange);
    sizeSliderEl.addEventListener('input', handleSizeChange);
    clearBtnEl.addEventListener('click', handleClearCanvas);

    // 4. Attach Canvas Drawing Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    // Stop drawing on mouseup or when mouse leaves the canvas area
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
}

export function cleanup() {
    // Remove all listeners
    if (colorPickerEl) colorPickerEl.removeEventListener('input', handleColorChange);
    if (sizeSliderEl) sizeSliderEl.removeEventListener('input', handleSizeChange);
    if (clearBtnEl) clearBtnEl.removeEventListener('click', handleClearCanvas);
    
    if (canvas) {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
    }
    
    // Reset state
    isDrawing = false;
}