// js/tools/code-editor.js

let editor;
let previewFrame;

const CDN_URLS = {
    css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css',
    theme: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/dracula.min.css', // Better theme
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

function updatePreview() {
    if (!editor || !previewFrame) return;
    const code = editor.getValue();
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
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
    
    if(!textarea) return; // Guard

    editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'htmlmixed',
        tabSize: 2,
        lineWrapping: true,
        autofocus: true
    });

    editor.on('change', () => {
         // Debounce slightly for performance
         if(window.previewTimeout) clearTimeout(window.previewTimeout);
         window.previewTimeout = setTimeout(updatePreview, 500);
    });

    document.getElementById('language-select').addEventListener('change', (e) => {
        editor.setOption('mode', e.target.value);
    });
    
    document.getElementById('run-btn').addEventListener('click', updatePreview);

    updatePreview();
}

export async function init() {
    try {
        const defaultCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; }
        .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
        h1 { color: #166534; }
        button { background: #166534; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem; }
        button:hover { background: #14532d; }
    </style>
</head>
<body>
    <div class="card">
        <h1>ToolVerse Editor</h1>
        <p>Edit the code on the left to see changes instantly!</p>
        <button onclick="alert('It works!')">Click Me</button>
    </div>
</body>
</html>`;
        
        const el = document.getElementById('code-editor-textarea');
        if(el) el.value = defaultCode;
        
        await initializeEditor();
    } catch (error) {
        console.error("Editor Init Error:", error);
    }
}

export function cleanup() {
    if (editor) {
        editor.toTextArea();
        editor = null;
    }
}
