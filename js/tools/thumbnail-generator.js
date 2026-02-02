// js/tools/thumbnail-generator.js
import { Toast } from '../ui.js';

let canvas, ctx;
let bgImg = null;
let titleInput, subInput;

function draw() {
    // Fill Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bgImg) {
        // Cover fit
        const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
        const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        
        // Dim overlay
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 20;
    
    // Title
    ctx.font = 'bold 120px Montserrat';
    ctx.fillText(titleInput.value.toUpperCase(), canvas.width/2, canvas.height/2 - 20);
    
    // Subtitle
    ctx.font = 'bold 60px Montserrat';
    ctx.fillStyle = '#facc15'; // Yellow
    ctx.fillText(subInput.value, canvas.width/2, canvas.height/2 + 80);
}

function handleUpload(e) {
    const file = e.target.files[0];
    if(file) {
        const img = new Image();
        img.onload = () => { bgImg = img; draw(); };
        img.src = URL.createObjectURL(file);
    }
}

function download() {
    const link = document.createElement('a');
    link.download = 'thumbnail.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
    Toast.show('Saved', 'Thumbnail downloaded successfully', 'success');
}

export function init() {
    canvas = document.getElementById('thumb-canvas');
    ctx = canvas.getContext('2d');
    titleInput = document.getElementById('title-text');
    subInput = document.getElementById('sub-text');

    titleInput.addEventListener('input', draw);
    subInput.addEventListener('input', draw);
    document.getElementById('bg-upload').addEventListener('change', handleUpload);
    document.getElementById('download-thumb').addEventListener('click', download);

    draw(); // Initial render
}

export function cleanup() {}