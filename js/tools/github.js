// js/tools/github.js

let form, input, card, errorEl, repoList;

async function search(e) {
    e.preventDefault();
    const user = input.value.trim();
    if (!user) return;

    card.classList.add('d-none');
    errorEl.classList.add('d-none');

    try {
        const [profile, repos] = await Promise.all([
            fetch(`https://api.github.com/users/${user}`).then(r => r.json()),
            fetch(`https://api.github.com/users/${user}/repos?sort=created&per_page=5`).then(r => r.json())
        ]);

        if (profile.message === "Not Found") throw new Error("User not found");

        renderProfile(profile);
        renderRepos(repos);
        card.classList.remove('d-none');

    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('d-none');
    }
}

function renderProfile(data) {
    document.getElementById('gh-avatar').src = data.avatar_url;
    document.getElementById('gh-name').textContent = data.name || data.login;
    document.getElementById('gh-login').textContent = `@${data.login}`;
    document.getElementById('gh-login').href = data.html_url;
    document.getElementById('gh-bio').textContent = data.bio || 'No bio available';
    
    document.getElementById('gh-repos').textContent = data.public_repos;
    document.getElementById('gh-followers').textContent = data.followers;
    document.getElementById('gh-following').textContent = data.following;
    
    document.getElementById('gh-location').innerHTML = `<i class="fa-solid fa-location-dot me-2"></i> ${data.location || 'Unknown'}`;
    document.getElementById('gh-date').innerHTML = `<i class="fa-regular fa-calendar me-2"></i> Joined ${new Date(data.created_at).toLocaleDateString()}`;
}

function renderRepos(repos) {
    repoList.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="text-decoration-none">
            <div class="p-3 bg-dark border border-white-10 rounded hover-bg-white-5">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-primary fw-bold">${repo.name}</span>
                    <span class="badge bg-black border border-white-10 text-secondary">★ ${repo.stargazers_count}</span>
                </div>
                <div class="small text-white-50 text-truncate">${repo.description || 'No description'}</div>
            </div>
        </a>
    `).join('');
}

export function init() {
    form = document.getElementById('gh-form');
    input = document.getElementById('gh-input');
    card = document.getElementById('profile-card');
    errorEl = document.getElementById('gh-error');
    repoList = document.getElementById('gh-repo-list');

    form.addEventListener('submit', search);
}

export function cleanup() {}
