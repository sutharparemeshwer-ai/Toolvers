// js/tools/morse-code-translator.js

let textInput, morseInput, swapBtn;

const MORSE_CODE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': '/'
};

const REVERSE_MORSE_MAP = Object.fromEntries(Object.entries(MORSE_CODE_MAP).map(([key, value]) => [value, key]));

function textToMorse() {
    const text = textInput.value.toUpperCase();
    morseInput.value = text.split('').map(char => MORSE_CODE_MAP[char] || '').join(' ');
}

function morseToText() {
    const morse = morseInput.value.trim().split(' ');
    textInput.value = morse.map(code => REVERSE_MORSE_MAP[code] || '').join('');
}

function swapContent() {
    const tempText = textInput.value;
    textInput.value = morseInput.value;
    morseInput.value = tempText;
}

export function init() {
    textInput = document.getElementById('text-input');
    morseInput = document.getElementById('morse-input');
    swapBtn = document.getElementById('swap-btn');

    textInput.addEventListener('input', textToMorse);
    morseInput.addEventListener('input', morseToText);
    swapBtn.addEventListener('click', swapContent);

    // Set placeholder example
    textInput.value = "HELLO WORLD";
    textToMorse();
}

export function cleanup() {
    textInput?.removeEventListener('input', textToMorse);
    morseInput?.removeEventListener('input', morseToText);
    swapBtn?.removeEventListener('click', swapContent);
}