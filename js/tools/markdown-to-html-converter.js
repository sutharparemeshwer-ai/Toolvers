// js/tools/markdown-to-html-converter.js

// DOM Elements
let markdownInput, htmlOutput, htmlPreview;

// Showdown.js library URL
const SHOWDOWN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js';
let converter;

/**
 * Dynamically loads the showdown.js script.
 */
function loadShowdown() {
    return new Promise((resolve, reject) => {
        if (window.showdown) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = SHOWDOWN_URL;
        script.onload = () => {
            // Initialize the converter once the script is loaded
            converter = new window.showdown.Converter();
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Converts the markdown input to HTML and updates the output and preview panes.
 */
function convertMarkdown() {
    if (!converter) return;

    const markdownText = markdownInput.value;
    const htmlText = converter.makeHtml(markdownText);

    // Display the raw HTML code
    htmlOutput.textContent = htmlText;

    // Display the rendered HTML preview
    htmlPreview.innerHTML = htmlText;
}

// --- Router Hooks ---

export async function init() {
    // Get DOM elements
    markdownInput = document.getElementById('markdown-input');
    htmlOutput = document.getElementById('html-output');
    htmlPreview = document.getElementById('html-preview');

    // Load the library and then set up the tool
    try {
        await loadShowdown();
        markdownInput.addEventListener('input', convertMarkdown);
        // Perform an initial conversion for the placeholder text
        convertMarkdown();
    } catch (error) {
        console.error("Failed to load Showdown.js", error);
        markdownInput.value = "Error: Could not load the Markdown converter.";
    }
}

export function cleanup() {
    markdownInput.removeEventListener('input', convertMarkdown);
}