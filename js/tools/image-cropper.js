// js/tools/image-cropper.js

let cropper = null;
let croppedCanvas = null;

export function init() {
  // Load Cropper.js library dynamically if not already loaded
  if (!window.Cropper) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.js";
    script.onload = setupCropper;
    document.head.appendChild(script);
  } else {
    setupCropper();
  }
}

function setupCropper() {
  const input = document.getElementById("image-input");
  const img = document.getElementById("image-preview");
  const cropBtn = document.getElementById("crop-btn");
  const downloadBtn = document.getElementById("download-btn");
  const resultDiv = document.getElementById("cropped-result");

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
      img.style.display = "block";

      if (cropper) cropper.destroy();
      cropper = new Cropper(img, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 1,
      });

      cropBtn.disabled = false;
      downloadBtn.disabled = true;
      resultDiv.innerHTML = "";
    };
    reader.readAsDataURL(file);
  });

  cropBtn.addEventListener("click", () => {
    if (!cropper) return;

    croppedCanvas = cropper.getCroppedCanvas({
      width: 400,
      height: 400,
    });

    resultDiv.innerHTML = "";
    const croppedImg = document.createElement("img");
    croppedImg.src = croppedCanvas.toDataURL("image/png");
    croppedImg.className = "border rounded mt-3";
    croppedImg.style.maxWidth = "100%";
    resultDiv.appendChild(croppedImg);

    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener("click", () => {
    if (!croppedCanvas) return;

    const link = document.createElement("a");
    link.href = croppedCanvas.toDataURL("image/png");
    link.download = "cropped-image.png";
    link.click();
  });
}

export function cleanup() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}
