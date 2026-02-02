// js/tools/interactive-story-builder.js
import { Toast } from '../ui.js';

let canvas, stickersLayer, bgImg;
let activeSticker = null;
let startX, startY, initialLeft, initialTop;

function addSticker(type) {
    const el = document.createElement('div');
    el.className = 'sticker-item';
    el.style.left = '50px';
    el.style.top = '100px';
    
    let content = '';
    if(type === 'text') content = `<div class="sticker-content" contenteditable="true">Tap to edit</div>`;
    if(type === 'poll') content = `
        <div class="sticker-poll">
            <div class="sticker-poll-header" contenteditable="true">Ask a question...</div>
            <div class="sticker-poll-option">YES</div>
            <div class="sticker-poll-option">NO</div>
        </div>`;
    if(type === 'question') content = `
        <div class="sticker-question">
            <div class="fw-bold">Ask me anything</div>
            <div class="sticker-question-input">Type something...</div>
        </div>`;
    if(type === 'link') content = `<div class="sticker-link"><i class="fa-solid fa-link me-1"></i> LINK</div>`;

    el.innerHTML = `
        ${content}
        <div class="delete-sticker-btn"><i class="fa-solid fa-xmark"></i></div>
    `;

    stickersLayer.appendChild(el);
    setupDrag(el);
    
    el.querySelector('.delete-sticker-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        el.remove();
    });
}

function setupDrag(el) {
    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart, {passive: false});
}

function dragStart(e) {
    if(e.target.isContentEditable) return;
    activeSticker = e.currentTarget;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
    initialLeft = parseInt(activeSticker.style.left || 0);
    initialTop = parseInt(activeSticker.style.top || 0);

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove, {passive: false});
    document.addEventListener('touchend', dragEnd);
}

function dragMove(e) {
    if(!activeSticker) return;
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    activeSticker.style.left = `${initialLeft + dx}px`;
    activeSticker.style.top = `${initialTop + dy}px`;
}

function dragEnd() {
    activeSticker = null;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
}

async function download() {
    Toast.show('Exporting', 'Rendering story...', 'info');
    
    // Load library if needed
    if(!window.html2canvas) {
        await new Promise(r => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.onload = r;
            document.head.appendChild(s);
        });
    }

    // Hide UI elements before capture
    const ui = document.querySelectorAll('.delete-sticker-btn');
    ui.forEach(el => el.style.display = 'none');

    html2canvas(canvas, { scale: 2, backgroundColor: null }).then(c => {
        const link = document.createElement('a');
        link.download = 'story.png';
        link.href = c.toDataURL();
        link.click();
        
        ui.forEach(el => el.style.display = 'flex'); // Restore UI
        Toast.show('Saved', 'Story saved to device', 'success');
    });
}

export function init() {
    canvas = document.getElementById('story-canvas-container');
    stickersLayer = document.getElementById('stickers-layer');
    bgImg = document.getElementById('bg-image-layer');

    // Background Controls
    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if(btn.dataset.type === 'color') {
                document.getElementById('bg-color-control').classList.remove('d-none');
                document.getElementById('bg-image-control').classList.add('d-none');
                bgImg.classList.add('d-none');
            } else {
                document.getElementById('bg-color-control').classList.add('d-none');
                document.getElementById('bg-image-control').classList.remove('d-none');
                bgImg.classList.remove('d-none');
            }
        });
    });

    document.getElementById('bg-color-picker').addEventListener('input', e => {
        canvas.style.backgroundColor = e.target.value;
    });

    document.getElementById('bg-image-upload').addEventListener('change', e => {
        const file = e.target.files[0];
        if(file) {
            bgImg.src = URL.createObjectURL(file);
        }
    });

    // Sticker Controls
    document.querySelectorAll('.add-sticker').forEach(btn => {
        btn.addEventListener('click', () => addSticker(btn.dataset.type));
    });

    document.getElementById('download-story-btn').addEventListener('click', download);
}

export function cleanup() {
    //
}
