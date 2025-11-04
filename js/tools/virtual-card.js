// js/tools/virtual-card.js

// DOM Elements
let formEl, nameInput, titleInput, companyInput, emailInput, phoneInput;
let previewName, previewTitleCompany, previewEmail, previewPhone;

/**
 * Updates the preview card with the current values from the input fields.
 */
function updatePreview() {
    const name = nameInput.value.trim() || "Your Name";
    const title = titleInput.value.trim();
    const company = companyInput.value.trim();
    const email = emailInput.value.trim() || "your.email@example.com";
    const phone = phoneInput.value.trim() || "+1-000-000-0000";

    previewName.textContent = name;
    previewEmail.textContent = email;
    previewPhone.textContent = phone;

    // Combine title and company for a cleaner look
    let titleCompanyText = "";
    if (title && company) {
        titleCompanyText = `${title} at ${company}`;
    } else if (title) {
        titleCompanyText = title;
    } else if (company) {
        titleCompanyText = company;
    } else {
        titleCompanyText = "Your Title at Company";
    }
    previewTitleCompany.textContent = titleCompanyText;
}

/**
 * Attaches input event listeners to all form fields.
 */
function attachListeners() {
    formEl.addEventListener('input', updatePreview);
}

/**
 * Removes event listeners to prevent memory leaks.
 */
function removeListeners() {
    formEl.removeEventListener('input', updatePreview);
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    formEl = document.getElementById('vcard-form');
    nameInput = document.getElementById('vcard-name');
    titleInput = document.getElementById('vcard-title');
    companyInput = document.getElementById('vcard-company');
    emailInput = document.getElementById('vcard-email');
    phoneInput = document.getElementById('vcard-phone');
    previewName = document.getElementById('preview-name');
    previewTitleCompany = document.getElementById('preview-title-company');
    previewEmail = document.getElementById('preview-email');
    previewPhone = document.getElementById('preview-phone');

    // Attach listeners and run initial update
    attachListeners();
    updatePreview();
}

export function cleanup() {
    // Clean up listeners when the tool is closed
    removeListeners();
}
