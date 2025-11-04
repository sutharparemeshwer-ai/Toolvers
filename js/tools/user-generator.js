// js/tools/user-generator.js

const API_URL = 'https://randomuser.me/api/';

// DOM Elements
let userPhotoEl, userNameEl, userEmailEl, userPhoneEl, userLocationEl, generateUserBtnEl;

// --- Core Logic ---

/**
 * Fetches a random user profile and updates the DOM.
 */
async function fetchUser() {
    // Set loading state
    userNameEl.textContent = "Loading...";
    generateUserBtnEl.disabled = true;
    userPhotoEl.src = ""; // Clear existing image
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // The API returns an array of results, we only need the first one
        const user = data.results[0];
        
        // Extract and format nested data
        const fullName = `${user.name.first} ${user.name.last}`;
        const location = `${user.location.city}, ${user.location.country}`;
        const photoUrl = user.picture.large;
        
        // Update the DOM elements
        userPhotoEl.src = photoUrl;
        userNameEl.textContent = fullName;
        userEmailEl.textContent = user.email;
        userPhoneEl.textContent = user.phone;
        userLocationEl.textContent = location;

    } catch (error) {
        console.error("Error fetching user:", error);
        userNameEl.textContent = "Error Loading User";
        userEmailEl.textContent = "Check console for details.";
        userPhoneEl.textContent = "";
        userLocationEl.textContent = "API connection failed.";
    } finally {
        generateUserBtnEl.disabled = false;
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    userPhotoEl = document.getElementById('user-photo');
    userNameEl = document.getElementById('user-name');
    userEmailEl = document.getElementById('user-email');
    userPhoneEl = document.getElementById('user-phone');
    userLocationEl = document.getElementById('user-location');
    generateUserBtnEl = document.getElementById('generate-user-btn');

    // 2. Attach listeners
    if (generateUserBtnEl) {
        generateUserBtnEl.addEventListener('click', fetchUser);
    }
    
    // 3. Fetch the first user when the tool loads
    fetchUser();
}

export function cleanup() {
    // Remove listeners
    if (generateUserBtnEl) {
        generateUserBtnEl.removeEventListener('click', fetchUser);
    }
}