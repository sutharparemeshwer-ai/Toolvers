// js/tools/dictionary-thesaurus.js

// --- DOM Elements ---
let searchForm, searchInput, resultsContainer, initialMessage;

// --- API ---
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// --- Rendering Functions ---

function showMessage(message, isError = false) {
    resultsContainer.innerHTML = `<div class="text-center p-4">
                                      <p class="${isError ? 'text-danger' : 'text-muted'}">${message}</p>
                                  </div>`;
}

function renderResults(data) {
    resultsContainer.innerHTML = ''; // Clear previous results

    const wordData = data[0];
    const phonetic = wordData.phonetics.find(p => p.text)?.text;

    // --- Header Section (Word, Phonetic, Audio) ---
    const headerEl = document.createElement('div');
    headerEl.className = 'dict-header mb-4';
    headerEl.innerHTML = `
        <div>
            <h2 class="mb-0">${wordData.word}</h2>
            ${phonetic ? `<p class="dict-phonetic mb-0">${phonetic}</p>` : ''}
        </div>
    `;
    resultsContainer.appendChild(headerEl);

    // --- Meanings Section ---
    wordData.meanings.forEach(meaning => {
        const meaningEl = document.createElement('section');
        meaningEl.className = 'dict-meaning-section mb-4';

        // Part of Speech
        meaningEl.innerHTML = `<h5 class="part-of-speech">${meaning.partOfSpeech}</h5>`;

        // Definitions
        const definitionsList = document.createElement('ul');
        definitionsList.className = 'definitions-list';
        meaning.definitions.forEach(def => {
            definitionsList.innerHTML += `
                <li>
                    <p>${def.definition}</p>
                    ${def.example ? `<p class="example"><em>"${def.example}"</em></p>` : ''}
                </li>
            `;
        });
        meaningEl.appendChild(definitionsList);

        // Synonyms (and Antonyms)
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            meaningEl.innerHTML += createRelatedWordsSection('Synonyms', meaning.synonyms);
        }
        if (meaning.antonyms && meaning.antonyms.length > 0) {
            meaningEl.innerHTML += createRelatedWordsSection('Antonyms', meaning.antonyms);
        }

        resultsContainer.appendChild(meaningEl);
    });

    // --- Source Link ---
    resultsContainer.innerHTML += `
        <footer class="dict-footer mt-4 text-center">
            <p class="small text-muted">Source: <a href="${wordData.sourceUrls[0]}" target="_blank">${wordData.sourceUrls[0]}</a></p>
        </footer>
    `;
}

function createRelatedWordsSection(title, words) {
    const wordsHtml = words.map(word => `<a href="#" class="synonym-badge" data-word="${word}">${word}</a>`).join('');
    return `<div class="related-words-section"><strong>${title}:</strong> ${wordsHtml}</div>`;
}

// --- Event Handlers ---

async function handleSearch(event) {
    event.preventDefault();
    const word = searchInput.value.trim();
    if (!word) return;

    showMessage('Searching...');

    try {
        const response = await fetch(`${API_URL}${word}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`No definitions found for "${word}".`);
            } else {
                throw new Error(`API Error: ${response.statusText}`);
            }
        }
        const data = await response.json();
        renderResults(data);
    } catch (error) {
        console.error('Dictionary API Error:', error);
        showMessage(error.message, true);
    }
}

function handleSynonymClick(event) {
    const target = event.target.closest('.synonym-badge');
    if (!target) return;

    event.preventDefault();
    const word = target.dataset.word;
    searchInput.value = word;
    searchForm.dispatchEvent(new Event('submit'));
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    searchForm = document.getElementById('dict-search-form');
    searchInput = document.getElementById('dict-search-input');
    resultsContainer = document.getElementById('dict-results-container');
    initialMessage = document.getElementById('dict-initial-message');

    // Attach event listeners
    searchForm.addEventListener('submit', handleSearch);
    resultsContainer.addEventListener('click', handleSynonymClick);
}

export function cleanup() {
    // Remove event listeners
    if (searchForm) {
        searchForm.removeEventListener('submit', handleSearch);
    }
    resultsContainer.removeEventListener('click', handleSynonymClick);
}