// js/tools/fake-post-generator.js
import { Toast } from '../ui.js';

let form;

async function loadHtml2Canvas() {
    if (window.html2canvas) return;
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

function update() {
    document.getElementById('display-name').textContent = document.getElementById('input-name').value;
    document.getElementById('display-handle').textContent = document.getElementById('input-handle').value;
    document.getElementById('display-date').textContent = document.getElementById('input-date').value;
    document.getElementById('display-likes').textContent = document.getElementById('input-likes').value;
    document.getElementById('display-rts').textContent = document.getElementById('input-rts').value;
    
    // Process text for hashtags
    const text = document.getElementById('input-text').value;
    const formatted = text.replace(/#(\w+)/g, '<span class="text-primary">#$1</span>');
    document.getElementById('display-text').innerHTML = formatted;
}

function handleAvatar(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            document.getElementById('display-avatar').src = evt.target.result;
            document.getElementById('preview-avatar-src').src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function download() {
    Toast.show('Rendering', 'Generating image...', 'info');
    await loadHtml2Canvas();
    const element = document.getElementById('tweet-preview');
    
    html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2 // High res
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'tweet-mockup.png';
        link.href = canvas.toDataURL();
        link.click();
        Toast.show('Success', 'Image downloaded!', 'success');
    });
}

export function init() {
    form = document.getElementById('post-form');
    form.addEventListener('input', update);
    document.getElementById('avatar-upload').addEventListener('change', handleAvatar);
    document.getElementById('download-btn').addEventListener('click', download);
}

export function cleanup() {}