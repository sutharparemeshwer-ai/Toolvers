// js/tools/emoji-keyboard.js

// A curated list of emojis with keywords for searching
const EMOJI_LIST = [
    { emoji: '😀', name: 'grinning face' }, { emoji: '😂', name: 'face with tears of joy' }, { emoji: '😍', name: 'smiling face with heart-eyes' },
    { emoji: '🤔', name: 'thinking face' }, { emoji: '👍', name: 'thumbs up' }, { emoji: '👎', name: 'thumbs down' }, { emoji: '❤️', name: 'red heart' },
    { emoji: '🔥', name: 'fire' }, { emoji: '🚀', name: 'rocket' }, { emoji: '🎉', name: 'party popper' }, { emoji: '💻', name: 'laptop computer' },
    { emoji: '🧠', name: 'brain' }, { emoji: '💡', name: 'light bulb' }, { emoji: '💰', name: 'money bag' }, { emoji: '📈', name: 'chart increasing' },
    { emoji: '⭐', name: 'star' }, { emoji: '✅', name: 'check mark button' }, { emoji: '❌', name: 'cross mark' }, { emoji: '👋', name: 'waving hand' },
    { emoji: '😊', name: 'smiling face with smiling eyes' }, { emoji: '😎', name: 'smiling face with sunglasses' }, { emoji: '😢', name: 'crying face' },
    { emoji: '🤯', name: 'exploding head' }, { emoji: '🙌', name: 'raising hands' }, { emoji: '🙏', name: 'folded hands' }, { emoji: '💪', name: 'flexed biceps' },
    { emoji: '👀', name: 'eyes' }, { emoji: '💯', name: 'hundred points' }, { emoji: '🤖', name: 'robot' }, { emoji: '👻', name: 'ghost' },
    { emoji: '🍕', name: 'pizza' }, { emoji: '🍔', name: 'hamburger' }, { emoji: '☕', name: 'coffee' }, { emoji: '🌍', name: 'earth globe europe-africa' },
    { emoji: '☀️', name: 'sun' }, { emoji: '🌙', 'name': 'crescent moon' }, { emoji: '🚗', name: 'car' }, { emoji: '✈️', name: 'airplane' }
];

// --- DOM Elements ---
let searchInput, emojiGrid, copyToastEl, copyToast;

// --- Rendering Functions ---

function renderEmojis(filter = '') {
    emojiGrid.innerHTML = '';
    const filteredList = EMOJI_LIST.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredList.length === 0) {
        emojiGrid.innerHTML = '<p class="text-muted">No emojis found.</p>';
        return;
    }

    filteredList.forEach(item => {
        const button = document.createElement('button');
        button.className = 'emoji-btn';
        button.textContent = item.emoji;
        button.dataset.emoji = item.emoji;
        button.setAttribute('aria-label', item.name);
        button.title = item.name;
        emojiGrid.appendChild(button);
    });
}

// --- Event Handlers ---

function handleSearch() {
    renderEmojis(searchInput.value);
}

function handleEmojiClick(event) {
    const target = event.target.closest('.emoji-btn');
    if (!target) return;

    const emojiToCopy = target.dataset.emoji;

    navigator.clipboard.writeText(emojiToCopy).then(() => {
        // Show a success notification
        if (copyToast) {
            copyToast.show();
        }
    }).catch(err => {
        console.error('Failed to copy emoji: ', err);
        alert('Failed to copy emoji to clipboard.');
    });
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    searchInput = document.getElementById('emoji-search-input');
    emojiGrid = document.getElementById('emoji-grid');
    copyToastEl = document.getElementById('emoji-copy-toast');

    // Initialize Bootstrap Toast
    if (copyToastEl) {
        copyToast = new bootstrap.Toast(copyToastEl);
    }

    // Initial render
    renderEmojis();

    // Attach event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (emojiGrid) {
        emojiGrid.addEventListener('click', handleEmojiClick);
    }
}

export function cleanup() {
    // Remove event listeners
    if (searchInput) {
        searchInput.removeEventListener('input', handleSearch);
    }
    if (emojiGrid) {
        emojiGrid.removeEventListener('click', handleEmojiClick);
    }
    if (copyToast) {
        copyToast.dispose();
    }
}