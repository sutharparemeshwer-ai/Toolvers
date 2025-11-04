// js/tools/social-media-post-scheduler.js

// DOM Elements
let postForm, contentInput, platformSelect, timeInput, postsList, emptyMessage, clearAllBtn;

// Application State
let scheduledPosts = [];
const STORAGE_KEY = 'socialMediaPosts';

const platformIcons = {
    twitter: 'fa-brands fa-twitter text-info',
    facebook: 'fa-brands fa-facebook text-primary',
    linkedin: 'fa-brands fa-linkedin text-primary',
    instagram: 'fa-brands fa-instagram text-danger'
};

// --- Local Storage ---

function loadPosts() {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    scheduledPosts = storedPosts ? JSON.parse(storedPosts) : [];
}

function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledPosts));
}

// --- Rendering ---

function renderPosts() {
    postsList.innerHTML = ''; // Clear the list

    if (scheduledPosts.length === 0) {
        emptyMessage.classList.remove('d-none');
        postsList.appendChild(emptyMessage);
        return;
    }

    // Sort posts by date before rendering
    const sortedPosts = [...scheduledPosts].sort((a, b) => new Date(a.time) - new Date(b.time));

    sortedPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'list-group-item list-group-item-action flex-column align-items-start';

        const formattedDate = new Date(post.time).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        postEl.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1"><i class="${platformIcons[post.platform]} me-2"></i> ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}</h5>
                <small class="text-muted">${formattedDate}</small>
            </div>
            <p class="mb-1">${post.content.replace(/\n/g, '<br>')}</p>
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${post.id}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;
        postsList.appendChild(postEl);
    });
}

// --- Event Handlers ---

function handleFormSubmit(e) {
    e.preventDefault();
    const content = contentInput.value.trim();
    const platform = platformSelect.value;
    const time = timeInput.value;

    if (!content || !time) {
        alert('Please fill out both content and schedule time.');
        return;
    }

    const newPost = {
        id: Date.now(),
        content,
        platform,
        time
    };

    scheduledPosts.push(newPost);
    savePosts();
    renderPosts();
    postForm.reset();
}

function handleListClick(e) {
    if (e.target.closest('.delete-post-btn')) {
        const btn = e.target.closest('.delete-post-btn');
        const postId = parseInt(btn.dataset.id, 10);
        deletePost(postId);
    }
}

function deletePost(id) {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
        scheduledPosts = scheduledPosts.filter(post => post.id !== id);
        savePosts();
        renderPosts();
    }
}

function handleClearAll() {
    if (confirm('Are you sure you want to delete ALL scheduled posts? This cannot be undone.')) {
        scheduledPosts = [];
        savePosts();
        renderPosts();
    }
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    postForm = document.getElementById('post-form');
    contentInput = document.getElementById('post-content');
    platformSelect = document.getElementById('platform-select');
    timeInput = document.getElementById('schedule-time');
    postsList = document.getElementById('posts-list');
    emptyMessage = document.getElementById('empty-posts-message');
    clearAllBtn = document.getElementById('clear-all-posts-btn');

    // Load data and render
    loadPosts();
    renderPosts();

    // Attach listeners
    postForm.addEventListener('submit', handleFormSubmit);
    postsList.addEventListener('click', handleListClick);
    clearAllBtn.addEventListener('click', handleClearAll);
}

export function cleanup() {
    // Remove listeners to prevent memory leaks
    postForm.removeEventListener('submit', handleFormSubmit);
    postsList.removeEventListener('click', handleListClick);
    clearAllBtn.removeEventListener('click', handleClearAll);
}