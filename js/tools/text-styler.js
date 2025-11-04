// js/tools/text-styler.js

// --- DOM Elements ---
let previewContainerEl, // Added for background color
  previewEl,
  fontFamilySelect,
  fontSizeSlider,
  fontSizeValue,
  fontColorPicker,
  animationSelect,
  text3dToggle,
  backgroundColorPicker; // Added for background color

let styleSheet = null;

// --- Animation Keyframes ---
const ANIMATION_KEYFRAMES = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-20px); }
        60% { transform: translateY(-10px); }
    }
`;

/**
 * Injects the animation keyframes into the document's head.
 */
function injectAnimationStyles() {
  styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = ANIMATION_KEYFRAMES;
  document.head.appendChild(styleSheet);
}

// --- Update Functions ---

const updateFontFamily = () => {
  previewEl.style.fontFamily = fontFamilySelect.value;
};

const updateFontSize = () => {
  const size = `${fontSizeSlider.value}px`;
  previewEl.style.fontSize = size;
  fontSizeValue.textContent = fontSizeSlider.value;
};

const updateFontColor = () => {
  previewEl.style.color = fontColorPicker.value;
  update3dEffect(); // Re-apply 3D effect as it depends on the color
};

const updateBackgroundColor = () => {
  previewContainerEl.style.backgroundColor = backgroundColorPicker.value;
};

const updateAnimation = () => {
  const animationName = animationSelect.value;
  if (animationName === "none") {
    previewEl.style.animation = "none";
  } else {
    let duration = "1.5s";
    if (animationName === "shake") duration = "0.5s";
    previewEl.style.animation = `${animationName} ${duration} infinite`;
  }
};

const update3dEffect = () => {
  if (text3dToggle.checked) {
    const color = fontColorPicker.value;
    // Create a slightly darker version of the color for the shadow
    // This is a simplified approach.
    const shadowColor = shadeColor(color, -20);
    previewEl.style.textShadow = `
            1px 1px 1px #ccc,
            2px 2px 1px ${shadowColor},
            3px 3px 1px ${shadowColor},
            4px 4px 1px ${shadowColor},
            5px 5px 1px ${shadowColor},
            6px 6px 1px ${shadowColor}
        `;
  } else {
    previewEl.style.textShadow = "none";
  }
};

// Helper to darken a hex color for the 3D effect
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
  return "#" + RR + GG + BB;
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  previewContainerEl = document.querySelector(".text-styler-preview-container"); // Get the container
  previewEl = document.getElementById("text-styler-preview");
  fontFamilySelect = document.getElementById("font-family-select");
  fontSizeSlider = document.getElementById("font-size-slider");
  fontSizeValue = document.getElementById("font-size-value");
  fontColorPicker = document.getElementById("font-color-picker");
  animationSelect = document.getElementById("animation-select");
  text3dToggle = document.getElementById("text-3d-toggle");
  backgroundColorPicker = document.getElementById("background-color-picker"); // Get the new color picker

  injectAnimationStyles();

  // Attach event listeners
  fontFamilySelect.addEventListener("change", updateFontFamily);
  fontSizeSlider.addEventListener("input", updateFontSize);
  fontColorPicker.addEventListener("input", updateFontColor);
  animationSelect.addEventListener("change", updateAnimation);
  text3dToggle.addEventListener("change", update3dEffect); // This should trigger update3dEffect
  backgroundColorPicker.addEventListener("input", updateBackgroundColor); // New listener

  // Apply initial styles
  updateFontFamily();
  updateFontSize();
  updateFontColor();
  updateBackgroundColor(); // Apply initial background color
}

export function cleanup() {
  // Remove the injected stylesheet
  if (styleSheet) {
    document.head.removeChild(styleSheet);
    styleSheet = null;
  }
  // Remove event listeners
  fontFamilySelect?.removeEventListener("change", updateFontFamily);
  fontSizeSlider?.removeEventListener("input", updateFontSize);
  fontColorPicker?.removeEventListener("input", updateFontColor);
  animationSelect?.removeEventListener("change", updateAnimation);
  text3dToggle?.removeEventListener("change", update3dEffect);
  backgroundColorPicker?.removeEventListener("input", updateBackgroundColor);

  // Reset styles on cleanup
  if (previewEl) {
    previewEl.style = ""; // Clear all inline styles
    previewEl.textContent = "Your Text Here"; // Reset text
    previewContainerEl.style.backgroundColor = ""; // Clear background
  }
}
