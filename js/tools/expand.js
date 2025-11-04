// js/tools/expand-button.js

let expandBtn;
let targetEl;

// Function to check if fullscreen mode is currently active
function isFullscreen() {
    // Check various browser properties for fullscreen element
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
}

function toggleFullscreen() {
    if (!targetEl) return;

    if (isFullscreen()) {
        // Exit Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        }
    } else {
        // Enter Fullscreen
        const element = targetEl;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        }
    }
}

// Function to update the button and container appearance
function updateButtonUI() {
    if (isFullscreen()) {
        expandBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Exit Fullscreen';
        targetEl.classList.add('is-fullscreen');
    } else {
        expandBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Enter Fullscreen';
        targetEl.classList.remove('is-fullscreen');
    }
}

// --- Event Handlers ---

function handleToggleClick() {
    toggleFullscreen();
}

// We need to listen to the browser's own fullscreen change event
// to update the button text when the user presses ESC to exit.
function handleFullscreenChange() {
    if (expandBtn) {
        updateButtonUI();
    }
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    expandBtn = document.getElementById('expand-toggle-btn');
    targetEl = document.getElementById('fullscreen-target');

    if (!expandBtn || !targetEl) return;

    // 2. Attach listeners
    expandBtn.addEventListener('click', handleToggleClick);

    // 3. Attach listeners for browser's internal fullscreen change (e.g., when ESC is pressed)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    
    // 4. Initial UI update
    updateButtonUI();
}

export function cleanup() {
    // Remove listeners
    if (expandBtn) {
        expandBtn.removeEventListener('click', handleToggleClick);
    }
    
    // Remove fullscreen listeners
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    
    // Ensure cleanup of fullscreen state if somehow left active
    if (isFullscreen()) {
        document.exitFullscreen();
    }
}