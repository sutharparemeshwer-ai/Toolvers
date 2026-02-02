// js/tools/ai-image-generator.js
import { Toast } from '../ui.js';

const PEXELS_KEY = 'Lp0Zn1g49IJFacF8RLsNsSjqZaabSxV2hQcBy6q05EkaZddd46HCBfUx';
let input, btn, grid, loader;

async function generate() {
    const prompt = input.value.trim();
    if(!prompt) return;

    grid.classList.add('d-none');
    loader.classList.remove('d-none');
    btn.disabled = true;

    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=4`, {
            headers: { Authorization: PEXELS_KEY }
        });
        const data = await res.json();
        
        if(data.photos.length === 0) throw new Error("No matches found.");

        grid.innerHTML = data.photos.map(p => `
            <div class="col-md-6">
                <div class="position-relative group">
                    <img src="${p.src.large2x}" class="result-img" crossorigin="anonymous">
                    <a href="${p.src.original}" target="_blank" class="btn btn-sm btn-light position-absolute bottom-0 end-0 m-2 opacity-0 group-hover:opacity-100">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            </div>
        `).join('');
        
        grid.classList.remove('d-none');
    } catch (e) {
        Toast.show('Error', e.message, 'error');
    } finally {
        loader.classList.add('d-none');
        btn.disabled = false;
    }
}

export function init() {
    input = document.getElementById('prompt-input');
    btn = document.getElementById('generate-btn');
    grid = document.getElementById('results-grid');
    loader = document.getElementById('loading-state');

    btn.onclick = generate;
    input.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } });
}

export function cleanup() {
    if(btn) btn.onclick = null;
}