// js/tools/instagram-caption-generator.js
import { Toast } from '../ui.js';

// Configuration
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL = "gemini-2.5-flash";

let descInput, genBtn, captionEl, tagsEl, vibeBtns, platformSelect;
let currentVibe = 'casual';

function getVibePrompt(vibe) {
    if(vibe === 'professional') return "professional, concise, and clean";
    if(vibe === 'funny') return "humorous, witty, maybe a pun";
    return "chill, aesthetic, and casual";
}

async function generate() {
    const desc = descInput.value.trim();
    if(!desc) return Toast.show('Input Required', 'Describe your photo first!', 'warning');

    genBtn.disabled = true;
    genBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Writing...';

    const prompt = `Write an Instagram caption for a photo of: "${desc}". 
    Tone: ${getVibePrompt(currentVibe)}. 
    Platform: ${platformSelect.value}.
    Format: Return ONLY the caption text on the first line, and a list of 10 relevant hashtags on the second line.`;

    try {
        if (!API_KEY || API_KEY.includes('YOUR_API')) throw new Error('API Key missing');

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text.trim();
        
        // Simple parse (assuming AI follows instruction)
        const parts = text.split('\n').filter(l => l.trim() !== '');
        const caption = parts[0] || text;
        const tags = parts.length > 1 ? parts.slice(1).join(' ') : '#ai #toolverse';

        captionEl.textContent = caption;
        tagsEl.textContent = tags;

    } catch (e) {
        // Fallback Mock Logic
        captionEl.textContent = `Just vibing with this view! ✨ (AI Error: ${e.message}, using fallback)`;
        tagsEl.textContent = `#${currentVibe} #lifestyle #moments`;
    } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles me-2"></i> Generate Magic';
    }
}

function copyText(id) {
    const txt = document.getElementById(id).textContent;
    navigator.clipboard.writeText(txt);
    Toast.show('Copied', 'Text copied to clipboard', 'success');
}

export function init() {
    descInput = document.getElementById('post-desc');
    genBtn = document.getElementById('generate-btn');
    captionEl = document.getElementById('preview-caption');
    tagsEl = document.getElementById('preview-hashtags');
    platformSelect = document.getElementById('platform-select');
    vibeBtns = document.querySelectorAll('.vibe-btn');

    genBtn.addEventListener('click', generate);
    
    document.getElementById('copy-caption').addEventListener('click', () => copyText('preview-caption'));
    document.getElementById('copy-tags').addEventListener('click', () => copyText('preview-hashtags'));

    vibeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            vibeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVibe = btn.dataset.vibe;
        });
    });
}

export function cleanup() {}