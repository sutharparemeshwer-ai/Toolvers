// js/tools/temperature-converter.js

let cIn, cRange, fIn, fRange;

function updateC(val) {
    const c = parseFloat(val);
    const f = (c * 9/5) + 32;
    
    cIn.value = c;
    cRange.value = c;
    document.getElementById('c-val').textContent = Math.round(c) + '°C';
    
    fIn.value = f.toFixed(1);
    fRange.value = f;
    document.getElementById('f-val').textContent = Math.round(f) + '°F';
}

function updateF(val) {
    const f = parseFloat(val);
    const c = (f - 32) * 5/9;
    
    fIn.value = f;
    fRange.value = f;
    document.getElementById('f-val').textContent = Math.round(f) + '°F';
    
    cIn.value = c.toFixed(1);
    cRange.value = c;
    document.getElementById('c-val').textContent = Math.round(c) + '°C';
}

export function init() {
    cIn = document.getElementById('c-input');
    cRange = document.getElementById('c-range');
    fIn = document.getElementById('f-input');
    fRange = document.getElementById('f-range');

    cIn.addEventListener('input', e => updateC(e.target.value));
    cRange.addEventListener('input', e => updateC(e.target.value));
    
    fIn.addEventListener('input', e => updateF(e.target.value));
    fRange.addEventListener('input', e => updateF(e.target.value));
}

export function cleanup() {}
