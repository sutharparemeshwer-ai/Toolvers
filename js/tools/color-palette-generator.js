// js/tools/color-palette-generator.js
import { Toast } from '../ui.js';

let picker, textInput, rgbVal, hslVal;
const palettes = ['monochromatic', 'analogous', 'complementary', 'triadic'];

// TinyColor-like helpers
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

function generate(hex) {
    const {r, g, b} = hexToRgb(hex);
    const {h, s, l} = rgbToHsl(r, g, b);

    rgbVal.textContent = `${r}, ${g}, ${b}`;
    hslVal.textContent = `${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(l)}%`;

    // Render Palettes
    renderRow('monochromatic', [0,1,2,3,4].map(i => {
        const newL = Math.max(10, Math.min(90, l + (i-2)*15));
        const res = hslToRgb(h, s, newL);
        return rgbToHex(res.r, res.g, res.b);
    }));

    renderRow('analogous', [-30, -15, 0, 15, 30].map(deg => {
        const res = hslToRgb((h + deg + 360) % 360, s, l);
        return rgbToHex(res.r, res.g, res.b);
    }));

    renderRow('complementary', [0, 180].map(deg => {
        const res = hslToRgb((h + deg + 360) % 360, s, l);
        return rgbToHex(res.r, res.g, res.b);
    }));

    renderRow('triadic', [0, 120, 240].map(deg => {
        const res = hslToRgb((h + deg + 360) % 360, s, l);
        return rgbToHex(res.r, res.g, res.b);
    }));
}

function renderRow(id, colors) {
    const el = document.getElementById(`${id}-palette`);
    el.innerHTML = colors.map(c => `
        <div class="color-swatch" style="background-color: ${c}" data-color="${c}" onclick="window.copyColor('${c}')"></div>
    `).join('');
}

window.copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    Toast.show('Color Copied', `${hex} copied to clipboard`, 'success');
};

export function init() {
    picker = document.getElementById('base-color-picker');
    textInput = document.getElementById('base-color-text');
    rgbVal = document.getElementById('val-rgb');
    hslVal = document.getElementById('val-hsl');

    const update = () => {
        textInput.value = picker.value;
        generate(picker.value);
    };

    picker.addEventListener('input', update);
    textInput.addEventListener('change', () => { picker.value = textInput.value; update(); });
    
    document.getElementById('random-color-btn').addEventListener('click', () => {
        picker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        update();
    });

    generate(picker.value);
}

export function cleanup() {
    window.copyColor = undefined;
}