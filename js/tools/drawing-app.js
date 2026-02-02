// js/tools/drawing-app.js

let canvas, ctx;
let isDrawing = false;
let startX, startY;
let savedImageData;
let history = [];
let historyStep = -1;

let settings = {
    color: '#3b82f6',
    size: 5,
    tool: 'brush'
};

function resize() {
    const parent = canvas.parentElement;
    // Save content before resize
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.drawImage(tempCanvas, 0, 0);
    saveState(); // Initial state
}

function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep; // Truncate redo
    }
    history.push(canvas.toDataURL());
}

function undo() {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[historyStep];
    }
}

function start(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    
    ctx.lineWidth = settings.size;
    ctx.strokeStyle = settings.tool === 'eraser' ? '#ffffff' : settings.color;
    ctx.fillStyle = settings.color;
    
    if (settings.tool !== 'brush' && settings.tool !== 'eraser') {
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if(!isDrawing) return;
    
    const x = e.offsetX;
    const y = e.offsetY;

    if (settings.tool === 'brush' || settings.tool === 'eraser') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        ctx.putImageData(savedImageData, 0, 0); // Clear preview
        ctx.beginPath();
        
        if (settings.tool === 'rect') {
            ctx.rect(startX, startY, x - startX, y - startY);
        } else if (settings.tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        }
        
        ctx.stroke();
    }
}

function stop() {
    if(isDrawing) {
        isDrawing = false;
        saveState();
    }
}

export function init() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');
    
    window.addEventListener('resize', resize);
    // Initial setup needs a slight delay for parent container to be ready
    setTimeout(resize, 50);

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stop);

    // Controls
    document.getElementById('color-picker').addEventListener('input', e => settings.color = e.target.value);
    document.getElementById('size-slider').addEventListener('input', e => settings.size = e.target.value);
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.tool = btn.dataset.tool;
        });
    });

    document.getElementById('btn-undo').addEventListener('click', undo);
    
    document.getElementById('btn-clear').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    });

    document.getElementById('btn-save').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'art.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

export function cleanup() {
    window.removeEventListener('resize', resize);
    window.removeEventListener('mouseup', stop);
}