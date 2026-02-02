// js/tools/virtual-whiteboard.js

let canvas, ctx, colorInput;
let isDrawing = false;
let mode = 'draw';
let startX, startY;
let savedData;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
}

function start(e) {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY - 56; // Offset for header if needed
    
    if (mode === 'rect') {
        savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function move(e) {
    if (!isDrawing) return;
    const x = e.clientX;
    const y = e.clientY - 56;

    ctx.strokeStyle = colorInput.value;
    ctx.fillStyle = colorInput.value;

    if (mode === 'draw') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (mode === 'rect') {
        ctx.putImageData(savedData, 0, 0); // Clear preview
        ctx.strokeRect(startX, startY, x - startX, y - startY);
    }
}

function end() {
    isDrawing = false;
}

export function init() {
    canvas = document.getElementById('wb-canvas');
    ctx = canvas.getContext('2d');
    colorInput = document.getElementById('wb-color');
    
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    document.getElementById('mode-draw').onclick = (e) => {
        mode = 'draw';
        e.target.classList.add('active');
        document.getElementById('mode-rect').classList.remove('active');
    };
    
    document.getElementById('mode-rect').onclick = (e) => {
        mode = 'rect';
        e.target.classList.add('active');
        document.getElementById('mode-draw').classList.remove('active');
    };

    document.getElementById('wb-clear').onclick = () => {
        ctx.clearRect(0,0, canvas.width, canvas.height);
    };
}

export function cleanup() {
    window.removeEventListener('resize', resize);
    window.removeEventListener('mouseup', end);
    window.removeEventListener('mousemove', move);
}
