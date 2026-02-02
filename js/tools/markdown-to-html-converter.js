// js/tools/markdown-to-html-converter.js

const SHOWDOWN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js';
let converter;
let input, preview, copyBtn, downloadBtn;

async function loadShowdown() {
    if (window.showdown) return;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SHOWDOWN_URL;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function render() {
    if (!converter) return;
    const text = input.value;
    const html = converter.makeHtml(text);
    preview.innerHTML = html;
}

function handleCopy() {
    const html = converter.makeHtml(input.value);
    navigator.clipboard.writeText(html).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    });
}

function handleDownload() {
    const html = converter.makeHtml(input.value);
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
}

export async function init() {
    input = document.getElementById('markdown-input');
    preview = document.getElementById('html-preview');
    copyBtn = document.getElementById('copy-html-btn');
    downloadBtn = document.getElementById('download-html-btn');

    try {
        await loadShowdown();
        converter = new window.showdown.Converter();
        converter.setOption('tables', true);
        converter.setOption('tasklists', true);
        
        // Default text
        input.value = `# Welcome to Markdown\n\nEdit this text to see the **magic** happen!\n\n- [x] Task 1\n- [ ] Task 2\n\n> \"Code is poetry.\"
`;
        render();

        input.addEventListener('input', render);
        copyBtn.addEventListener('click', handleCopy);
        downloadBtn.addEventListener('click', handleDownload);
    } catch (e) {
        input.value = "Error loading converter library.";
    }
}

export function cleanup() {
    // Cleanup
}
