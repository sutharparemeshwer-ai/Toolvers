// js/tools/color-palette-generator.js

// --- DOM Elements ---
let colorPicker,
  colorInfoDisplay,
  copyToast,
  bsToast,
  baseColorPreview,
  randomColorBtn;
const paletteContainers = {
  monochromatic: null,
  analogous: null,
  complementary: null,
  triadic: null,
  tints: null,
  shades: null,
};

// --- Color Conversion Utilities ---

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

/**
 * Determines if text on a given background color should be light or dark.
 * @param {string} hexcolor - The background color in HEX format.
 * @returns {string} 'light' or 'dark'.
 */
function getContrastYIQ(hexcolor) {
  const { r, g, b } = hexToRgb(hexcolor);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "dark" : "light";
}
// --- Palette Generation ---

function generatePalettes(baseHex) {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Display color info
  baseColorPreview.style.backgroundColor = baseHex;
  colorInfoDisplay.innerHTML = `
        <div class="color-info-row"><span>HEX</span> <strong>${baseHex.toUpperCase()}</strong></div>
        <div class="color-info-row"><span>RGB</span> <strong>${rgb.r}, ${
    rgb.g
  }, ${rgb.b}</strong></div>
        <div class="color-info-row"><span>HSL</span> <strong>${Math.round(
          hsl.h
        )}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%</strong></div>
    `;
  const contrast = getContrastYIQ(baseHex);
  colorInfoDisplay.className = `p-3 rounded text-${
    contrast === "light" ? "white" : "dark"
  }`;

  // Generate and render palettes
  renderPalette(
    "monochromatic",
    Array(5)
      .fill(0)
      .map((_, i) => {
        const newL = Math.max(0, Math.min(100, hsl.l + (i - 2) * 15));
        return rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, newL)));
      })
  );

  renderPalette(
    "analogous",
    [-30, -15, 0, 15, 30].map((shift) => {
      const newH = (hsl.h + shift + 360) % 360;
      return rgbToHex(...Object.values(hslToRgb(newH, hsl.s, hsl.l)));
    })
  );

  renderPalette(
    "complementary",
    [0, 60, 120, 180, 240].map((shift) => {
      const newH = (hsl.h + shift) % 360;
      return rgbToHex(...Object.values(hslToRgb(newH, hsl.s, hsl.l)));
    })
  );

  renderPalette(
    "triadic",
    [0, 120, 240].map((shift) => {
      const newH = (hsl.h + shift) % 360;
      return rgbToHex(...Object.values(hslToRgb(newH, hsl.s, hsl.l)));
    })
  );

  renderPalette(
    "tints",
    Array(5)
      .fill(0)
      .map((_, i) => {
        const newL = Math.min(100, hsl.l + (i * (100 - hsl.l)) / 5);
        return rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, newL)));
      })
  );

  renderPalette(
    "shades",
    Array(5)
      .fill(0)
      .map((_, i) => {
        const newL = Math.max(0, hsl.l - (i * hsl.l) / 5);
        return rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, newL)));
      })
  );
}

function renderPalette(paletteName, colors) {
  const container = paletteContainers[paletteName];
  container.innerHTML = "";
  colors.forEach((color) => {
    const swatch = document.createElement("div");
    const textContrast = getContrastYIQ(color);
    swatch.className = `color-swatch text-${textContrast}`;
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = `Copy ${color}`;
    swatch.innerHTML = `<span class="swatch-hex">${color.toUpperCase()}</span>`;
    container.appendChild(swatch);
  });
}

// --- Event Handlers ---

function handleColorChange() {
  generatePalettes(colorPicker.value);
}

function handleRandomColor() {
  const randomColor =
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
  colorPicker.value = randomColor;
  generatePalettes(randomColor);
}

function handlePaletteClick(e) {
  const swatch = e.target.closest(".color-swatch");
  if (!swatch) return;

  const color = swatch.dataset.color;
  navigator.clipboard
    .writeText(color)
    .then(() => {
      bsToast.show();
    })
    .catch((err) => {
      console.error("Failed to copy color:", err);
    });
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  colorPicker = document.getElementById("base-color-picker");
  colorInfoDisplay = document.getElementById("color-info-display");
  baseColorPreview = document.getElementById("base-color-preview");
  randomColorBtn = document.getElementById("random-color-btn");
  copyToast = document.getElementById("copy-toast");
  bsToast = new bootstrap.Toast(copyToast);

  Object.keys(paletteContainers).forEach((key) => {
    paletteContainers[key] = document.getElementById(`${key}-palette`);
  });

  baseColorPreview.appendChild(colorPicker);

  // Attach event listeners
  colorPicker.addEventListener("input", handleColorChange);
  randomColorBtn.addEventListener("click", handleRandomColor);
  document.querySelectorAll(".palette-row").forEach((row) => {
    row.addEventListener("click", handlePaletteClick);
  });

  // Initial generation
  handleColorChange();
}

export function cleanup() {
  // Remove listeners
  colorPicker.removeEventListener("input", handleColorChange);
  randomColorBtn.removeEventListener("click", handleRandomColor);
  document.querySelectorAll(".palette-row").forEach((row) => {
    row.removeEventListener("click", handlePaletteClick);
  });
  if (bsToast) {
    bsToast.dispose();
  }
}
