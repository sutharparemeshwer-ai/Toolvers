// js/tools/began.js (Full code with stability and direction fix)

let color1, color2, gradientType, gradientDirection, preview, cssCode, copyBtn;
let updateHandler, copyHandler;

function updateBackground() {
  const type = gradientType.value;
  const c1 = color1.value;
  const c2 = color2.value;
  const direction = gradientDirection.value;
  let gradient = '';

  if (type === 'linear') {
    gradient = `linear-gradient(${direction}, ${c1}, ${c2})`;
  } else {
    gradient = `radial-gradient(circle, ${c1}, ${c2})`;
  }

  preview.style.background = gradient;
  cssCode.value = `background: ${gradient};`;
}

function handleCopy() {
  cssCode.select();
  document.execCommand('copy');
  // Simple, better UX for confirmation
  copyBtn.textContent = 'CSS Copied! ✅';
  setTimeout(() => {
    copyBtn.textContent = 'Copy CSS';
  }, 1500);
}

export function init() {
  color1 = document.getElementById('color1');
  color2 = document.getElementById('color2');
  gradientType = document.getElementById('gradientType');
  gradientDirection = document.getElementById('gradientDirection'); // NEW
  preview = document.getElementById('preview');
  cssCode = document.getElementById('cssCode');
  copyBtn = document.getElementById('copyCSS');

  // Show/Hide direction control based on type
  gradientType.addEventListener('change', () => {
    gradientDirection.parentElement.style.display = (gradientType.value === 'linear') ? 'block' : 'none';
  });

  // Attach handlers
  updateHandler = updateBackground;
  copyHandler = handleCopy;
  color1.addEventListener('input', updateHandler);
  color2.addEventListener('input', updateHandler);
  gradientType.addEventListener('change', updateHandler);
  gradientDirection.addEventListener('change', updateHandler); // NEW
  copyBtn.addEventListener('click', copyHandler);

  // Initialize
  updateBackground();
}

export function cleanup() {
  if (color1) color1.removeEventListener('input', updateHandler);
  if (color2) color2.removeEventListener('input', updateHandler);
  if (gradientType) gradientType.removeEventListener('change', updateHandler);
  if (gradientDirection) gradientDirection.removeEventListener('change', updateHandler); // NEW
  if (copyBtn) copyBtn.removeEventListener('click', copyHandler);
}