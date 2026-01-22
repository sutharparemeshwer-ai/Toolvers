// js/ui.js

/**
 * UI Utilities for ToolVerse Enterprise Edition
 */

// --- Toast Notification System ---

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

export const Toast = {
    show(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-modern toast-${type}`;
        
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${icons[type]}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        // Close logic
        const close = () => {
            toast.classList.add('closing');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', close);
        setTimeout(close, duration);

        toastContainer.appendChild(toast);
    }
};

// --- Command Palette System ---

let paletteEl, backdropEl, inputEl, resultsEl;
let toolsCache = [];
let isOpen = false;

function buildPalette() {
    backdropEl = document.createElement('div');
    backdropEl.className = 'modal-backdrop-custom';
    
    paletteEl = document.createElement('div');
    paletteEl.className = 'cmd-palette';
    paletteEl.innerHTML = `
        <div class="cmd-header">
            <input type="text" class="cmd-input" placeholder="Type a command or search tools..." id="cmd-input">
        </div>
        <div class="cmd-body" id="cmd-results">
            <!-- Items injected here -->
        </div>
    `;

    document.body.appendChild(backdropEl);
    document.body.appendChild(paletteEl);

    inputEl = document.getElementById('cmd-input');
    resultsEl = document.getElementById('cmd-results');

    // Events
    backdropEl.addEventListener('click', closePalette);
    inputEl.addEventListener('input', handleInput);
    
    // Global shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            togglePalette();
        }
        if (e.key === 'Escape' && isOpen) {
            closePalette();
        }
    });
}

function togglePalette() {
    if (isOpen) closePalette();
    else openPalette();
}

function openPalette() {
    isOpen = true;
    backdropEl.classList.add('active');
    paletteEl.classList.add('active');
    inputEl.value = '';
    inputEl.focus();
    renderResults(toolsCache.slice(0, 5)); // Show recent/top tools
}

function closePalette() {
    isOpen = false;
    backdropEl.classList.remove('active');
    paletteEl.classList.remove('active');
}

function handleInput(e) {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        renderResults(toolsCache.slice(0, 5));
        return;
    }

    const matched = toolsCache.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.category.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8

    renderResults(matched);
}

function renderResults(items) {
    if (items.length === 0) {
        resultsEl.innerHTML = `<div class="p-3 text-secondary text-center small">No matching tools found.</div>`;
        return;
    }

    resultsEl.innerHTML = items.map(t => `
        <a href="#${t.id}" class="cmd-item" onclick="document.body.dispatchEvent(new CustomEvent('cmd-nav'))">
            <div class="cmd-icon"><i class="fa-solid fa-bolt"></i></div>
            <div>
                <div class="fw-bold">${t.name}</div>
                <div class="small opacity-50">${t.category}</div>
            </div>
            <div class="cmd-shortcut">Jump</div>
        </a>
    `).join('');

    // Hack: close palette when a link is clicked
    const links = resultsEl.querySelectorAll('.cmd-item');
    links.forEach(l => l.addEventListener('click', closePalette));
}

export const CommandPalette = {
    init(tools) {
        toolsCache = tools;
        buildPalette();
    }
};

// Legacy Upgrader (The "Magic" Script)
// Scans old HTML for bootstrap classes and upgrades them to glassmorphism
export const LegacyUpgrader = {
    run() {
        // Upgrade Cards
        document.querySelectorAll('.card').forEach(el => {
            if (!el.classList.contains('glass-panel')) {
                el.classList.add('glass-panel', 'border-0');
                el.classList.remove('card', 'bg-light', 'bg-white');
                el.style.backgroundColor = ''; // Remove inline styles
            }
        });

        // Upgrade Text
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, label').forEach(el => {
            el.classList.add('text-main');
            el.classList.remove('text-dark', 'text-muted');
        });
        
        document.querySelectorAll('p, small, span').forEach(el => {
            if (!el.classList.contains('text-white') && !el.classList.contains('badge') && !el.classList.contains('text-secondary')) {
                el.classList.add('text-secondary');
            }
        });

        // Upgrade Inputs
        document.querySelectorAll('.form-control, .form-select').forEach(el => {
            el.classList.add('modern-input');
            el.classList.remove('bg-white', 'bg-light');
        });

        // Upgrade Buttons (Bootstrap primary -> Our gradient)
        document.querySelectorAll('.btn-primary').forEach(el => {
            el.style.backgroundImage = 'var(--primary-gradient)';
            el.style.border = 'none';
        });
    }
};
