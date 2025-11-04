// js/tools/qr-generator.js

let qr;

export function init() {
  // Load QRious library dynamically if not already added
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
  const generateBtn = document.getElementById("generate-qr");
  generateBtn.addEventListener("click", generateQR);

  qr = new QRious({
    element: document.getElementById("qr-canvas"),
    size: 200,
  });
}

export function cleanup() {
  qr = null;
}

function generateQR() {
  const input = document.getElementById("qr-input").value.trim();
  const download = document.getElementById("qr-download");

  if (!input) {
    alert("Please enter some text or a URL!");
    return;
  }

  qr.value = input;
  download.innerHTML = "";

  const link = document.createElement("a");
  link.href = qr.toDataURL("image/png");
  link.download = "qr-code.png";
  link.textContent = "⬇️ Download QR Code";
  link.classList.add("btn", "btn-outline-success", "mt-2");
  download.appendChild(link);
}
