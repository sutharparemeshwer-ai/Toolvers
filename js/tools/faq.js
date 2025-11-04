// js/tools/custom-accordion.js

let accordionHeaders;

function toggleAccordion(header) {
    const targetId = header.dataset.target;
    const content = document.getElementById(targetId);
    
    // Toggle the 'active' class on the header
    header.classList.toggle('active');

    // Toggle the content visibility using max-height for smooth CSS transition
    if (header.classList.contains('active')) {
        // Set max-height to the actual scroll height so CSS transition works
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        // Collapse by setting max-height to 0
        content.style.maxHeight = null;
    }
}

function handleAccordionClick(e) {
    const header = e.currentTarget;
    toggleAccordion(header);
}

// --- Router Hooks ---

export function init() {
    accordionHeaders = document.querySelectorAll('.accordion-header-custom');

    accordionHeaders.forEach(header => {
        // 1. Attach click listener
        header.addEventListener('click', handleAccordionClick);
        
        // 2. Initialize content height to 0 (for CSS collapse)
        const targetId = header.dataset.target;
        const content = document.getElementById(targetId);
        if (content) {
            content.style.maxHeight = null; // Ensure initial state is collapsed
        }
    });
}

export function cleanup() {
    if (accordionHeaders) {
        accordionHeaders.forEach(header => {
            header.removeEventListener('click', handleAccordionClick);
            
            // Optional: Reset active state on cleanup
            header.classList.remove('active');
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            if (content) {
                content.style.maxHeight = null;
            }
        });
    }
}