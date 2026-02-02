// js/tools/meme-generator.js
import { Toast } from '../ui.js';

let canvas, ctx, currentImg;
let topInput, bottomInput, sizeInput, colorInput, downloadBtn;
let searchInput, searchBtn, templatesGrid, uploadInput;

const PEXELS_KEY = 'Lp0Zn1g49IJFacF8RLsNsSjqZaabSxV2hQcBy6q05EkaZddd46HCBfUx';

function draw() {
    if (!currentImg) return;

    // Canvas sizing
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / currentImg.width);
    canvas.width = currentImg.width * scale;
    canvas.height = currentImg.height * scale;

    // Draw Image
    ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);

    // Text Settings
    const size = parseInt(sizeInput.value);
    ctx.font = `900 ${size}px Impact`;
    ctx.fillStyle = colorInput.value;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = size / 8;
    ctx.textAlign = 'center';

    // Draw Text
    const x = canvas.width / 2;
    const topY = size + 10;
    const bottomY = canvas.height - 20;

    if (topInput.value) {
        ctx.strokeText(topInput.value.toUpperCase(), x, topY);
        ctx.fillText(topInput.value.toUpperCase(), x, topY);
    }
    if (bottomInput.value) {
        ctx.strokeText(bottomInput.value.toUpperCase(), x, bottomY);
        ctx.fillText(bottomInput.value.toUpperCase(), x, bottomY);
    }
    
    document.getElementById('placeholder-msg').classList.add('d-none');
}

async function searchImages(query) {
    if (!query) return;
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=9`, {
            headers: { Authorization: PEXELS_KEY }
        });
        const data = await res.json();
        renderTemplates(data.photos);
    } catch (e) {
        Toast.show('Error', 'Failed to fetch images', 'error');
    }
}

function renderTemplates(photos) {
    templatesGrid.innerHTML = photos.map(p => `
        <img src="${p.src.medium}" data-full="${p.src.large}" crossorigin="anonymous">
    `).join('');
    
    templatesGrid.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => loadImg(img.dataset.full));
    });
}

function loadImg(src) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        currentImg = img;
        draw();
    };
    img.src = src;
}

function handleUpload(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => loadImg(evt.target.result);
    reader.readAsDataURL(file);
}

function download() {
    if (!currentImg) return Toast.show('Info', 'Create a meme first!', 'info');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
}

export function init() {
    canvas = document.getElementById('meme-canvas');
    ctx = canvas.getContext('2d');
    
    topInput = document.getElementById('top-text');
    bottomInput = document.getElementById('bottom-text');
    sizeInput = document.getElementById('font-size');
    colorInput = document.getElementById('text-color');
    downloadBtn = document.getElementById('download-btn');
    
    searchInput = document.getElementById('search-input');
    searchBtn = document.getElementById('search-btn');
    templatesGrid = document.getElementById('templates-grid');
    uploadInput = document.getElementById('upload-input');

    [topInput, bottomInput, sizeInput, colorInput].forEach(el => el.addEventListener('input', draw));
    
    searchBtn.addEventListener('click', () => searchImages(searchInput.value));
    searchInput.addEventListener('keydown', e => { if(e.key==='Enter') searchImages(searchInput.value); });
    
    uploadInput.addEventListener('change', handleUpload);
    downloadBtn.addEventListener('click', download);

    // Initial search
    searchImages('funny cat');
}

export function cleanup() {}
