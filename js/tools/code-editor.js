// js/tools/code-editor.js

let editor;
let previewFrame;

const CDN_URLS = {
    css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css',
    theme: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css',
    js: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js',
    modes: {
        xml: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.min.js',
        javascript: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js',
        css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.min.js',
        htmlmixed: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/htmlmixed/htmlmixed.min.js',
    }
};

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadCSS(url) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Updates the content of the preview iframe.
 */
function updatePreview() {
    if (!editor || !previewFrame) return;

    const code = editor.getValue();
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

    // Write the editor content directly into the iframe
    previewDoc.open();
    previewDoc.write(code);
    previewDoc.close();
}

async function initializeEditor() {
    loadCSS(CDN_URLS.css);
    loadCSS(CDN_URLS.theme);
    await loadScript(CDN_URLS.js);
    await Promise.all([
        loadScript(CDN_URLS.modes.xml),
        loadScript(CDN_URLS.modes.javascript),
        loadScript(CDN_URLS.modes.css),
        loadScript(CDN_URLS.modes.htmlmixed),
    ]);

    const textarea = document.getElementById('code-editor-textarea');
    previewFrame = document.getElementById('live-preview-iframe');
    editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: 'material-darker',
        mode: 'htmlmixed',
        tabSize: 2,
    });

    // Add event listener to update preview on change
    editor.on('change', updatePreview);

    document.getElementById('language-select').addEventListener('change', (e) => {
        editor.setOption('mode', e.target.value);
    });

    // Initial update
    updatePreview();
}

export async function init() {
    try {
        // Set a default value for the editor
        document.getElementById('code-editor-textarea').value = `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <style>\n    body { font-family: sans-serif; background-color: #f0f0f0; }\n    h1 { color: #333; }\n  </style>\n</head>\n<body>\n\n  <h1>Hello, World!</h1>\n  <p>This is a live preview.</p>\n\n</body>\n</html>`;
        await initializeEditor();
    } catch (error) {
        console.error("Failed to load CodeMirror editor:", error);
        const editorArea = document.getElementById('code-editor-textarea');
        if (editorArea) {
            editorArea.value = "Error: Could not load the code editor. Please check your internet connection.";
        }
    }
}

export function cleanup() {
    if (editor) {
        editor.toTextArea();
        editor = null;
        previewFrame = null;
    }
}