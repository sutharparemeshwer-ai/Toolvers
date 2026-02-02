// js/tools/image-enhancer.js
import { Toast } from '../ui.js';

let imgOrg, imgEnh, wrapper, handle, container;
let ranges = {};
let isDragging = false;

function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        imgOrg.src = url;
        imgEnh.src = url;
        
        document.getElementById('empty-state').classList.add('d-none');
        document.getElementById('compare-container').style.display = 'block';
        document.getElementById('controls-panel').classList.remove('d-none');
        applyFilters();
    }
}

function applyFilters() {
    const b = ranges.brightness.value;
    const c = ranges.contrast.value;
    const s = ranges.saturate.value;
    
    // Apply CSS filters to the "Enhanced" image only
    imgEnh.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
}

function moveSlider(e) {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const pct = (x / rect.width) * 100;
    
    wrapper.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
}

function download() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgEnh.naturalWidth;
    canvas.height = imgEnh.naturalHeight;
    
    // Apply filters to context
    const b = ranges.brightness.value;
    const c = ranges.contrast.value;
    const s = ranges.saturate.value;
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
    
    ctx.drawImage(imgEnh, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'enhanced.png';
    link.href = canvas.toDataURL();
    link.click();
    Toast.show('Saved', 'Image saved successfully.', 'success');
}

export function init() {
    imgOrg = document.getElementById('img-original');
    imgEnh = document.getElementById('img-enhanced');
    wrapper = document.getElementById('img-enhanced-wrapper');
    handle = document.getElementById('slider-handle');
    container = document.getElementById('compare-container');
    
    ranges = {
        brightness: document.getElementById('range-brightness'),
        contrast: document.getElementById('range-contrast'),
        saturate: document.getElementById('range-saturate')
    };

    document.getElementById('img-upload').addEventListener('change', handleUpload);
    document.getElementById('download-btn').addEventListener('click', download);
    
    Object.values(ranges).forEach(r => r.addEventListener('input', applyFilters));

    // Slider Logic
    handle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', moveSlider);
}

export function cleanup() {
    window.removeEventListener('mouseup', () => isDragging = false);
    window.removeEventListener('mousemove', moveSlider);
}