// js/tools/word-count.js

let input;

function update() {
    const text = input.value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const sentences = text.split(/[.?!]+/).length - 1;
    const time = Math.ceil(words / 200); // 200 wpm

    document.getElementById('count-words').textContent = words;
    document.getElementById('count-chars').textContent = chars;
    document.getElementById('count-sentences').textContent = sentences;
    document.getElementById('read-time').textContent = time + 'm';
}

export function init() {
    input = document.getElementById('zen-input');
    input.addEventListener('input', update);
    document.getElementById('clear-btn').addEventListener('click', () => {
        input.value = '';
        update();
        input.focus();
    });
}
export function cleanup() {}
