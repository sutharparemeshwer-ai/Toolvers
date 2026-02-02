// js/tools/qr-generator.js

let qr;

export function init() {
    if (!window.QRious) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js";
        script.onload = setup;
        document.head.appendChild(script);
    } else {
        setup();
    }
}

function setup() {
    qr = new QRious({
        element: document.getElementById("qr-canvas"),
        size: 250,
        value: 'https://toolverse.com'
    });

    const input = document.getElementById('qr-input');
    input.addEventListener('input', () => {
        if(input.value.trim()) qr.value = input.value;
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = qr.toDataURL();
        link.download = 'qrcode.png';
        link.click();
    });
}

export function cleanup() {}