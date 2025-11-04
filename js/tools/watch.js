// js/tools/digital-watch.js

let watchInterval;
let watchDisplay;
let dateDisplay;

function updateWatch() {
    const now = new Date();

    // Format the time (Hours:Minutes:Seconds)
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false // Force 24-hour format
    };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    watchDisplay.textContent = timeString;

    // Format the date (Day, Month Day, Year)
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    dateDisplay.textContent = dateString;
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    watchDisplay = document.getElementById('watch-display');
    dateDisplay = document.getElementById('date-display');

    // 2. Start the watch interval
    // Update immediately, then every second
    updateWatch();
    watchInterval = setInterval(updateWatch, 1000);
}

export function cleanup() {
    // 1. Clear the running interval when the tool is left
    clearInterval(watchInterval);
    
    // 2. Clear displays
    if (watchDisplay) watchDisplay.textContent = '--:--:--';
    if (dateDisplay) dateDisplay.textContent = '-- / -- / ----';
}