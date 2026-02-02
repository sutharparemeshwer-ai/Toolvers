// js/tools/password-generator.js

const CHAR_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHAR_NUM = '0123456789';
const CHAR_SYM = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

let formEl, slider, output, copyBtn, strengthBar, strengthText, entropyText;
let optUpper, optNum, optSym, lengthVal;

function calculateEntropy(password) {
    let poolSize = 26; // Lowercase base
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) poolSize += 30;

    const entropy = Math.log2(Math.pow(poolSize, password.length));
    return Math.floor(entropy);
}

function updateStrength(password) {
    const entropy = calculateEntropy(password);
    entropyText.textContent = `Entropy: ~${entropy} bits`;

    let strength = 0; // 0-100
    let label = "Weak";
    let color = "bg-danger";
    let textClass = "text-danger";

    if (entropy > 120) { strength = 100; label = "Unbreakable"; color = "bg-success"; textClass = "text-success"; }
    else if (entropy > 80) { strength = 75; label = "Strong"; color = "bg-success"; textClass = "text-success"; }
    else if (entropy > 50) { strength = 50; label = "Moderate"; color = "bg-warning"; textClass = "text-warning"; }
    else { strength = 25; }

    strengthBar.style.width = `${strength}%`;
    strengthBar.className = `progress-bar ${color}`;
    strengthText.textContent = label;
    strengthText.className = `fw-bold ${textClass}`;
}

function generate() {
    const len = +slider.value;
    let chars = CHAR_LOWER;
    if (optUpper.checked) chars += CHAR_UPPER;
    if (optNum.checked) chars += CHAR_NUM;
    if (optSym.checked) chars += CHAR_SYM;

    let pass = '';
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array); // Cryptographically secure

    for (let i = 0; i < len; i++) {
        pass += chars[array[i] % chars.length];
    }

    output.value = pass;
    updateStrength(pass);
}

function handleCopy() {
    navigator.clipboard.writeText(output.value);
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    copyBtn.classList.remove('btn-primary');
    copyBtn.classList.add('btn-success');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.add('btn-primary');
        copyBtn.classList.remove('btn-success');
    }, 2000);
}

export function init() {
    formEl = document.getElementById('generator-form');
    slider = document.getElementById('length-slider');
    lengthVal = document.getElementById('length-value');
    output = document.getElementById('password-output');
    copyBtn = document.getElementById('copy-btn');
    strengthBar = document.getElementById('strength-bar');
    strengthText = document.getElementById('strength-text');
    entropyText = document.getElementById('entropy-text');

    optUpper = document.getElementById('include-uppercase');
    optNum = document.getElementById('include-numbers');
    optSym = document.getElementById('include-symbols');

    formEl.addEventListener('submit', (e) => { e.preventDefault(); generate(); });
    slider.addEventListener('input', () => {
        lengthVal.textContent = slider.value;
        generate();
    });
    copyBtn.addEventListener('click', handleCopy);

    // Initial
    generate();
}

export function cleanup() {
    // Cleanup
}
