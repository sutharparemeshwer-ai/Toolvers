// js/tools/digital-business-card-generator.js

let canvas, ctx, form, downloadLink;

function drawCard() {
    if (!canvas || !ctx) return;

    // Get values from form
    const name = document.getElementById('db-card-name').value;
    const title = document.getElementById('db-card-title').value;
    const company = document.getElementById('db-card-company').value;
    const email = document.getElementById('db-card-email').value;
    const phone = document.getElementById('db-card-phone').value;
    const website = document.getElementById('db-card-website').value;
    const bgColor = document.getElementById('db-card-bg-color').value;

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Draw content ---
    ctx.fillStyle = '#ffffff';

    // Name
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width / 2, 80);

    // Title & Company
    ctx.font = '18px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`${title} at ${company}`, canvas.width / 2, 110);

    // Line separator
    ctx.strokeStyle = '#56caad';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 140);
    ctx.lineTo(canvas.width / 2 + 100, 140);
    ctx.stroke();

    // Contact Details
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';

    // Email
    ctx.fillText(`📧 ${email}`, 50, 190);
    // Phone
    ctx.fillText(`📞 ${phone}`, 50, 220);
    // Website
    ctx.fillText(`🌐 ${website}`, 50, 250);

    // Update download link
    updateDownloadLink();
}

function updateDownloadLink() {
    try {
        const dataUrl = canvas.toDataURL('image/png');
        downloadLink.href = dataUrl;
    } catch (error) {
        console.error("Could not update download link:", error);
    }
}

export function init() {
    canvas = document.getElementById('business-card-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    form = document.getElementById('db-card-form');
    downloadLink = document.getElementById('download-card-link');

    // Initial draw
    drawCard();

    // Add event listeners to all inputs
    form.addEventListener('input', drawCard);
}

export function cleanup() {
    if (form) {
        form.removeEventListener('input', drawCard);
    }
    canvas = null;
    ctx = null;
    form = null;
    downloadLink = null;
}