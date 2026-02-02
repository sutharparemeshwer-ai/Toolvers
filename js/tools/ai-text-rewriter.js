// js/tools/ai-text-rewriter.js
import { Toast } from '../ui.js';

const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL = "gemini-2.5-flash";

let originalInput, rewrittenInput, rewriteBtn, toneBtns;
let currentTone = "formal";

async function rewrite() {
    const text = originalInput.value.trim();
    if (!text) return Toast.show('Input Required', 'Please enter text to rewrite.', 'warning');

    rewriteBtn.disabled = true;
    rewriteBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
    rewrittenInput.value = "AI is rewriting...";

    const prompt = `Rewrite the following text. Tone: ${currentTone}.
    Keep the meaning the same but change the style.
    
    Original Text:
    "${text}"`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await res.json();
        const result = data.candidates[0].content.parts[0].text;
        
        rewrittenInput.value = result;
        updateStats(text, result);
        Toast.show('Success', 'Text rewritten successfully.', 'success');

    } catch (e) {
        rewrittenInput.value = "Error: " + e.message;
    } finally {
        rewriteBtn.disabled = false;
        rewriteBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles me-2"></i> Rewrite Text';
    }
}

function updateStats(original, rewritten) {
    const w1 = original.split(/\s+/).length;
    const w2 = rewritten.split(/\s+/).length;
    document.getElementById('word-diff').textContent = `${w1} → ${w2}`;
    document.getElementById('stats-panel').classList.remove('d-none');
}

export function init() {
    originalInput = document.getElementById('original-text');
    rewrittenInput = document.getElementById('rewritten-text');
    rewriteBtn = document.getElementById('rewrite-btn');
    toneBtns = document.querySelectorAll('#tone-selector button');

    if(rewriteBtn) rewriteBtn.onclick = rewrite;

    toneBtns.forEach(btn => {
        btn.onclick = () => {
            toneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTone = btn.dataset.tone;
        };
    });

    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(rewrittenInput.value);
        Toast.show('Copied', 'Rewritten text copied.', 'success');
    };
}

export function cleanup() {
    if(rewriteBtn) rewriteBtn.onclick = null;
}