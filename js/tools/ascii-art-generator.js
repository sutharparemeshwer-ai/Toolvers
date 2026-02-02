// js/tools/ascii-art-generator.js
import { Toast } from '../ui.js';

let canvas, ctx, input, slider, invertCheck, output;
const CHARS = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "];

function render(src) {
    const img = new Image();
    img.onload = () => {
        const w = parseInt(slider.value);
        const scale = w / img.width;
        const h = Math.floor(img.height * scale * 0.5); // 0.5 to fix aspect ratio of chars

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const pixels = ctx.getImageData(0, 0, w, h).data;
        let art = "";

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const r = pixels[i];
                const g = pixels[i+1];
                const b = pixels[i+2];
                
                let avg = (r + g + b) / 3;
                if (invertCheck.checked) avg = 255 - avg;

                const charIdx = Math.floor((avg / 255) * (CHARS.length - 1));
                art += CHARS[charIdx];
            }
            art += "\n";
        }
        output.textContent = art;
    };
    img.src = src;
}

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            input.dataset.src = evt.target.result; // Store src
            render(evt.target.result);
        };
        reader.readAsDataURL(file);
    }
}

export function init() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    input = document.getElementById('img-upload');
    slider = document.getElementById('resolution');
    invertCheck = document.getElementById('invert-color');
    output = document.getElementById('ascii-output');

    input.addEventListener('change', handleFile);
    
    const update = () => {
        if(input.dataset.src) {
            document.getElementById('res-val').textContent = slider.value + ' chars';
            render(input.dataset.src);
        }
    };

    slider.addEventListener('input', update);
    invertCheck.addEventListener('change', update);

    document.getElementById('copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(output.textContent);
        Toast.show('Copied', 'ASCII art copied to clipboard', 'success');
    });
}

export function cleanup() {}