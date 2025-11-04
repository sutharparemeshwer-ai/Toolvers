// js/tools/virtual-whiteboard.js

let canvas, ctx;
let colorPicker, brushSizeSlider, brushSizeValue, brushBtn, eraserBtn, clearBtn, downloadBtn;

let isDrawing = false;
let isErasing = false;
let brushWidth = 5;
let currentColor = '#FFFFFF';
const ERASER_COLOR = '#212529'; // Match the app's dark background

function setCanvasSize() {
    const parent = canvas.parentElement;
    // Save current drawing
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = parent.clientWidth;
    // A common aspect ratio for whiteboards
    canvas.height = parent.clientWidth * (9 / 16);
    // Restore drawing
    ctx.putImageData(data, 0, 0);
    // Re-apply settings that might be lost on resize
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = isErasing ? ERASER_COLOR : currentColor;
}

function startDrawing(e) {
    isDrawing = true;
    draw(e); // Start drawing immediately on click/touch
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Reset the path to start a new line next time
}

function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();

    // Get coordinates for both mouse and touch events
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function handleColorChange(e) {
    currentColor = e.target.value;
    if (!isErasing) {
        ctx.strokeStyle = currentColor;
    }
}

function handleBrushSizeChange(e) {
    brushWidth = e.target.value;
    brushSizeValue.textContent = brushWidth;
    ctx.lineWidth = brushWidth;
}

function activateBrush() {
    isErasing = false;
    ctx.strokeStyle = currentColor;
    brushBtn.classList.add('active', 'btn-primary');
    brushBtn.classList.remove('btn-outline-secondary');
    eraserBtn.classList.remove('active', 'btn-primary');
    eraserBtn.classList.add('btn-outline-secondary');
}

function activateEraser() {
    isErasing = true;
    ctx.strokeStyle = ERASER_COLOR;
    eraserBtn.classList.add('active', 'btn-primary');
    eraserBtn.classList.remove('btn-outline-secondary');
    brushBtn.classList.remove('active', 'btn-primary');
    brushBtn.classList.add('btn-outline-secondary');
}

function clearCanvas() {
    if (confirm('Are you sure you want to clear the whiteboard?')) {
        ctx.fillStyle = ERASER_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

let resizeObserver;

export function init() {
    canvas = document.getElementById('whiteboard-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Get controls
    colorPicker = document.getElementById('color-picker');
    brushSizeSlider = document.getElementById('brush-size');
    brushSizeValue = document.getElementById('brush-size-value');
    brushBtn = document.getElementById('brush-btn');
    eraserBtn = document.getElementById('eraser-btn');
    clearBtn = document.getElementById('clear-btn');
    downloadBtn = document.getElementById('download-btn');

    // Set initial canvas size and background
    setCanvasSize();
    ctx.fillStyle = ERASER_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw, { passive: false });

    colorPicker.addEventListener('input', handleColorChange);
    brushSizeSlider.addEventListener('input', handleBrushSizeChange);
    brushBtn.addEventListener('click', activateBrush);
    eraserBtn.addEventListener('click', activateEraser);
    clearBtn.addEventListener('click', clearCanvas);
    downloadBtn.addEventListener('click', downloadImage);

    // Use ResizeObserver to handle responsive canvas size
    resizeObserver = new ResizeObserver(setCanvasSize);
    resizeObserver.observe(canvas.parentElement);

    // Set initial tool state
    activateBrush();
    handleBrushSizeChange({ target: { value: brushWidth } });
}

export function cleanup() {
    if (resizeObserver && canvas) {
        resizeObserver.unobserve(canvas.parentElement);
    }
    // All other listeners are on elements that will be removed from the DOM,
    // so manual removal isn't strictly necessary for this tool.
}