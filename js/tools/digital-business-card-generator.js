// js/tools/digital-business-card-generator.js

let canvas,
  ctx,
  form,
  downloadLink,
  logoImage = null;

/**
 * A helper function to determine if a color is light or dark.
 * @param {string} color - The hex color string (e.g., "#RRGGBB").
 * @returns {boolean} - True if the color is light, false if dark.
 */
function isColorLight(color) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using the YIQ formula to determine brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

function drawCard() {
  if (!canvas || !ctx) return;

  // Get values from form
  const name = document.getElementById("db-card-name").value;
  const title = document.getElementById("db-card-title").value;
  const company = document.getElementById("db-card-company").value;
  const email = document.getElementById("db-card-email").value;
  const phone = document.getElementById("db-card-phone").value;
  const website = document.getElementById("db-card-website").value;
  const bgColor = document.getElementById("db-card-bg-color").value;
  const accentColor = document.getElementById("db-card-accent-color").value;

  // Determine text color based on background brightness
  const textColor = isColorLight(bgColor) ? "#1a1d24" : "#ffffff";
  const mutedTextColor = isColorLight(bgColor) ? "#495057" : "#cccccc";

  // --- Draw Background ---
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Draw Logo (if it exists) ---
  if (logoImage) {
    // Draw the logo in the top-right corner
    const logoSize = 80;
    const logoX = canvas.width - logoSize - 30;
    ctx.drawImage(logoImage, logoX, 40, logoSize, logoSize);
  }

  // Draw a decorative sidebar for a modern look
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 20, canvas.height);

  // --- Draw content ---
  const contentStartX = 50;

  // Name
  ctx.fillStyle = textColor;
  ctx.font = "bold 36px Poppins";
  ctx.textAlign = "left";
  ctx.fillText(name, contentStartX, 80);

  // Title & Company
  ctx.font = "18px Inter";
  ctx.fillStyle = mutedTextColor;
  ctx.fillText(`${title} | ${company}`, contentStartX, 110);

  // Line separator
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentStartX, 140);
  ctx.lineTo(contentStartX + 250, 140);
  ctx.stroke();

  // Contact Details
  ctx.font = "16px Inter";
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  const iconSpacing = 30;
  let currentY = 190;

  // Email
  ctx.fillText(`📧  ${email}`, contentStartX, currentY);
  // Phone
  ctx.fillText(`📞  ${phone}`, contentStartX, (currentY += iconSpacing));
  // Website
  ctx.fillText(`🌐  ${website}`, contentStartX, (currentY += iconSpacing));

  // Update download link
  updateDownloadLink();
}

function updateDownloadLink() {
  try {
    const dataUrl = canvas.toDataURL("image/png");
    downloadLink.href = dataUrl;
  } catch (error) {
    console.error("Could not update download link:", error);
  }
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    logoImage = new Image();
    logoImage.onload = () => {
      drawCard(); // Redraw the card once the logo is loaded
    };
    logoImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function handleClearLogo() {
  logoImage = null;
  document.getElementById("db-card-logo").value = ""; // Clear the file input
  drawCard();
}

export function init() {
  canvas = document.getElementById("business-card-canvas");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  form = document.getElementById("db-card-form");
  downloadLink = document.getElementById("download-card-link");
  const logoInput = document.getElementById("db-card-logo");
  const clearLogoBtn = document.getElementById("db-card-clear-logo-btn");

  // Initial draw
  drawCard();

  // Add event listeners to all inputs
  form.addEventListener("input", drawCard);
  logoInput.addEventListener("change", handleLogoUpload);
  clearLogoBtn.addEventListener("click", handleClearLogo);
}

export function cleanup() {
  if (form) {
    form.removeEventListener("input", drawCard);
  }
  const logoInput = document.getElementById("db-card-logo");
  if (logoInput) logoInput.removeEventListener("change", handleLogoUpload);
  const clearLogoBtn = document.getElementById("db-card-clear-logo-btn");
  if (clearLogoBtn) clearLogoBtn.removeEventListener("click", handleClearLogo);
  canvas = null;
  ctx = null;
  form = null;
  downloadLink = null;
  logoImage = null;
}
