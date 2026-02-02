// js/tools/ai-resume-analyzer.js

// Stop words to ignore
const IGNORE = new Set(['and','the','to','of','in','a','with','for','on','as','an','is','at','by','from','or','that','be','are','this','it']);

function extract(text) {
    if (!text) return new Set();
    return new Set(text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !IGNORE.has(w)));
}

function analyze() {
    const resume = document.getElementById('resume-text').value;
    const job = document.getElementById('job-desc').value;

    if (!resume || !job) {
        alert("Please fill in both fields.");
        return;
    }

    const resWords = extract(resume);
    const jobWords = extract(job);

    const matched = [];
    const missing = [];

    jobWords.forEach(w => {
        if (resWords.has(w)) matched.push(w);
        else missing.push(w);
    });

    const score = Math.round((matched.length / jobWords.size) * 100) || 0;

    // Render
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('results-dashboard').classList.remove('d-none');

    document.getElementById('score-val').textContent = score + '%';
    document.getElementById('keywords-found').textContent = matched.length;
    document.getElementById('keywords-missing').textContent = missing.length;

    const missList = document.getElementById('missing-list');
    missList.innerHTML = missing.length ? missing.map(w => `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">${w}</span>`).join('') : '<span class="text-success small">Great job! No obvious keywords missing.</span>';

    const matchList = document.getElementById('matched-list');
    matchList.innerHTML = matched.length ? matched.map(w => `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">${w}</span>`).join('') : '<span class="text-secondary small">No matches found.</span>';
}

export function init() {
    document.getElementById('analyze-btn').addEventListener('click', analyze);
    document.getElementById('empty-state').classList.remove('d-none');
    document.getElementById('results-dashboard').classList.add('d-none');
}

export function cleanup() {}
