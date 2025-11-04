// js/tools/language-translator.js

// DOM Elements
let sourceTextEl, targetLangEl, translatedTextEl, translateBtn, statusEl;

/**
 * Fetches translation from the MyMemory API.
 */
async function translateText() {
    const text = sourceTextEl.value.trim();
    const targetLang = targetLangEl.value;

    if (!text) {
        statusEl.textContent = 'Please enter text to translate.';
        return;
    }

    statusEl.textContent = 'Translating...';
    translateBtn.disabled = true;
    translatedTextEl.value = '';

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.responseStatus === 200) {
            translatedTextEl.value = data.responseData.translatedText;
            statusEl.textContent = 'Translation successful.';
        } else {
            throw new Error(data.responseDetails);
        }
    } catch (error) {
        console.error('Translation Error:', error);
        statusEl.textContent = `Error: ${error.message}`;
    } finally {
        translateBtn.disabled = false;
    }
}

// --- Router Hooks ---

export function init() {
    sourceTextEl = document.getElementById('source-text');
    targetLangEl = document.getElementById('target-lang');
    translatedTextEl = document.getElementById('translated-text');
    translateBtn = document.getElementById('translate-btn');
    statusEl = document.getElementById('translator-status');

    translateBtn.addEventListener('click', translateText);
}

export function cleanup() {
    translateBtn.removeEventListener('click', translateText);
}