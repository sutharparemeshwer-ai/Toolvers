// js/tools/github-finder.js

// The GitHub API base URL. No key is needed for public data, but rate limits apply.
const API_BASE_URL = 'https://api.github.com/users/';

let formEl, inputEl, profileContainerEl, messageAreaEl;

// --- Helper Functions ---

function showMessage(text, isError = false) {
    messageAreaEl.textContent = text;
    messageAreaEl.classList.remove('alert-info', 'alert-danger', 'd-none');
    messageAreaEl.classList.add(isError ? 'alert-danger' : 'alert-info');
    messageAreaEl.classList.remove('d-none');
}

function hideMessage() {
    messageAreaEl.classList.add('d-none');
}

/**
 * Renders the main user profile card.
 * @param {Object} profile - The user data from the GitHub API.
 */
function renderProfile(profile) {
    const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Profile Card HTML
    const profileCard = `
        <div class="profile-card mb-4">
            <div class="row g-0 align-items-center">
                <div class="col-md-4 text-center">
                    <img src="${profile.avatar_url}" class="profile-avatar" alt="${profile.login}'s avatar">
                    <a href="${profile.html_url}" target="_blank" class="btn btn-primary btn-sm mt-3 w-75">View Profile</a>
                </div>
                <div class="col-md-8">
                    <div class="profile-body p-3">
                        <h5 class="card-title">${profile.name || profile.login}</h5>
                        <p class="card-text">${profile.bio || 'No bio available.'}</p>
                        
                        <div class="badges-container">
                            <span class="badge bg-primary">Followers: ${profile.followers}</span>
                            <span class="badge bg-secondary">Following: ${profile.following}</span>
                            <span class="badge bg-success">Public Repos: ${profile.public_repos}</span>
                        </div>
                        
                        <p class="small mt-3 ">
                            <i class="fa-solid fa-calendar-alt"></i> Joined GitHub on ${joinedDate}
                            ${profile.location ? `<br><i class="fa-solid fa-map-marker-alt"></i> Location: ${profile.location}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <h5 class="text-center mt-4">Public Repositories (${profile.public_repos})</h5>
        <div id="repos-list" class="list-group">
            </div>
    `;
    profileContainerEl.innerHTML = profileCard;
}

/**
 * Renders the list of public repositories.
 * @param {Array<Object>} repos - The array of repository data.
 */
function renderRepos(repos) {
    const reposListEl = document.getElementById('repos-list');
    if (!reposListEl) return;
    
    if (repos.length === 0) {
        reposListEl.innerHTML = '<p class="text-center mt-3 ">No public repositories found.</p>';
        return;
    }
    
    // Sort by star count and take top 5 for brevity
    const topRepos = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);
        
    const reposHTML = topRepos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
                <strong>${repo.name}</strong>
                <p class="mb-0 small ">${repo.description || 'No description.'}</p>
            </div>
            <div>
                <span class="badge bg-warning me-2">Stars: ${repo.stargazers_count}</span>
                <span class="badge bg-info">Forks: ${repo.forks_count}</span>
            </div>
        </a>
    `).join('');

    reposListEl.innerHTML = reposHTML;
}

// --- Main API Functions ---

async function fetchProfile(username) {
    hideMessage();
    showMessage("Fetching profile...");
    profileContainerEl.innerHTML = '';
    
    try {
        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}${username}`);
        
        if (userResponse.status === 404) {
            hideMessage();
            showMessage(`Error: User "${username}" not found on GitHub.`, true);
            return;
        }
        
        const userData = await userResponse.json();
        
        // Fetch repositories (GitHub limits to 30 per page by default)
        const reposResponse = await fetch(`${API_BASE_URL}${username}/repos?per_page=30&sort=created`);
        const reposData = await reposResponse.json();

        hideMessage();
        
        // Render both parts
        renderProfile(userData);
        renderRepos(reposData);

    } catch (error) {
        console.error('GitHub Fetch error:', error);
        hideMessage();
        showMessage("An error occurred while fetching data. Check network connection or API limits.", true);
    }
}

// --- Event Handler ---

function handleFormSubmit(e) {
    e.preventDefault();
    const username = inputEl.value.trim();
    
    if (username) {
        fetchProfile(username);
    } else {
        showMessage("Please enter a GitHub username.", true);
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    formEl = document.getElementById('github-search-form');
    inputEl = document.getElementById('github-username-input');
    profileContainerEl = document.getElementById('profile-container');
    messageAreaEl = document.getElementById('message-area-github');

    // 2. Attach listener
    if (formEl) {
        formEl.addEventListener('submit', handleFormSubmit);
    }
}

export function cleanup() {
    if (formEl) {
        formEl.removeEventListener('submit', handleFormSubmit);
    }
    // Clear display on cleanup
    if (profileContainerEl) {
        profileContainerEl.innerHTML = '';
    }
}