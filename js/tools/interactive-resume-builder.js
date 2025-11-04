// js/tools/interactive-resume-builder.js

let formEl;

// A map to link input IDs to their corresponding preview element and default text
const fieldMap = {
    'resume-name': { preview: 'preview-name', default: 'Your Name' },
    'resume-job-title': { preview: 'preview-job-title', default: 'Your Job Title' },
    'resume-summary': { preview: 'preview-summary', default: 'A brief summary of your skills and experience...' },
    'exp-title': { preview: 'preview-exp-title', default: 'Job Title' },
    'exp-company': { preview: 'preview-exp-company', default: 'Company | Start Date - End Date' },
    'exp-desc': { preview: 'preview-exp-desc', default: 'Describe your responsibilities and achievements...' },
    'edu-degree': { preview: 'preview-edu-degree', default: 'Degree / Certificate' },
    'edu-school': { preview: 'preview-edu-school', default: 'School / University | Start Date - End Date' },
    'resume-skills': { preview: 'preview-skills', default: 'List your key skills here' },
};

/**
 * Updates the entire resume preview based on current form values.
 */
function updatePreview() {
    // Handle regular fields
    for (const inputId in fieldMap) {
        const inputEl = document.getElementById(inputId);
        const previewEl = document.getElementById(fieldMap[inputId].preview);
        
        if (inputEl && previewEl) {
            const value = inputEl.value.trim();
            previewEl.textContent = value || fieldMap[inputId].default;
        }
    }

    // Handle special combined fields like contact info
    updateContactInfo();
}

/**
 * Updates the combined contact info line in the preview.
 */
function updateContactInfo() {
    const emailInput = document.getElementById('resume-email');
    const phoneInput = document.getElementById('resume-phone');
    const contactPreview = document.getElementById('preview-contact');

    if (!emailInput || !phoneInput || !contactPreview) return;

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    let contactText = [];
    if (email) contactText.push(email);
    if (phone) contactText.push(phone);

    if (contactText.length > 0) {
        contactPreview.textContent = contactText.join(' | ');
    } else {
        contactPreview.textContent = 'your.email@example.com | +1 234 567 890';
    }
}

/**
 * Attaches the main input event listener to the form.
 */
function attachListeners() {
    formEl = document.getElementById('resume-form');
    if (formEl) {
        formEl.addEventListener('input', updatePreview);
    }
}

/**
 * Removes the event listener to prevent memory leaks.
 */
function removeListeners() {
    if (formEl) {
        formEl.removeEventListener('input', updatePreview);
    }
}

// --- Router Hooks ---

export function init() {
    attachListeners();
    // Run once on load to set initial state from placeholders or blank values
    updatePreview();
}

export function cleanup() {
    removeListeners();
}
