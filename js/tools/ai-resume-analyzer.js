// js/tools/ai-resume-analyzer.js

// --- DOM Elements ---
let resumeInput, jobDescInput, analyzeBtn, resultsContainer;
let matchScoreEl, matchedKeywordsEl, missingKeywordsEl;

// --- "AI" Logic ---

// Common words to ignore during keyword extraction
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'what', 'who', 'when', 'where', 'why', 'how', 'about', 'as', 'from', 'into', 'like',
    'through', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
    'should', 'now', 'job', 'description', 'responsibilities', 'requirements', 'experience', 'skills'
]);

/**
 * Extracts unique, relevant keywords from a block of text.
 * @param {string} text - The input text.
 * @returns {Set<string>} A set of unique keywords.
 */
function extractKeywords(text) {
    if (!text) return new Set();
    return new Set(
        text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/) // Split into words
            .filter(word => word.length > 2 && !STOP_WORDS.has(word)) // Filter out stop words and short words
    );
}

function renderKeywords(element, keywords, isMatched) {
    element.innerHTML = `<strong>${isMatched ? 'Matched' : 'Missing'} Keywords:</strong> `;
    if (keywords.length === 0) {
        element.innerHTML += '<span class="text-muted">None</span>';
        return;
    }
    keywords.forEach(keyword => {
        const badge = document.createElement('span');
        badge.className = `badge me-1 ${isMatched ? 'bg-success' : 'bg-warning text-dark'}`;
        badge.textContent = keyword;
        element.appendChild(badge);
    });
}

// --- Event Handlers ---

function handleAnalysis() {
    const resumeText = resumeInput.value;
    const jobDescText = jobDescInput.value;

    if (!resumeText || !jobDescText) {
        alert('Please paste both your resume and the job description.');
        return;
    }

    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescText);

    if (jobKeywords.size === 0) {
        alert('Could not extract any keywords from the job description.');
        return;
    }

    const matched = [];
    const missing = [];

    jobKeywords.forEach(keyword => {
        if (resumeKeywords.has(keyword)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = Math.round((matched.length / jobKeywords.size) * 100);

    // Render results
    matchScoreEl.textContent = `${score}%`;
    renderKeywords(matchedKeywordsEl, matched, true);
    renderKeywords(missingKeywordsEl, missing, false);

    resultsContainer.classList.remove('d-none');
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    resumeInput = document.getElementById('resume-text-input');
    jobDescInput = document.getElementById('job-desc-input');
    analyzeBtn = document.getElementById('analyze-resume-btn');
    resultsContainer = document.getElementById('analysis-results');
    matchScoreEl = document.getElementById('match-score');
    matchedKeywordsEl = document.getElementById('matched-keywords');
    missingKeywordsEl = document.getElementById('missing-keywords');

    // Attach event listener
    analyzeBtn.addEventListener('click', handleAnalysis);
}

export function cleanup() {
    // Remove event listener
    analyzeBtn.removeEventListener('click', handleAnalysis);
}