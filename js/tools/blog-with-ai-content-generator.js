// js/tools/blog-with-ai-content-generator.js
import { Toast } from '../ui.js';

const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL = "gemini-2.5-flash";
const STORE_KEY = "toolverse_blog_drafts";

let topicInput, toneSelect, genBtn, titleInput, contentInput;
let saveBtn, newBtn, draftsList, loadingOverlay;
let currentId = null;

function getDrafts() {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
}

function saveDrafts(drafts) {
    localStorage.setItem(STORE_KEY, JSON.stringify(drafts));
    renderDrafts();
}

async function generate() {
    const topic = topicInput.value.trim();
    if (!topic) return Toast.show('Input Required', 'Please enter a topic.', 'warning');

    loadingOverlay.classList.remove('d-none');
    
    const prompt = `Write a blog post about "${topic}". Tone: ${toneSelect.value}.
    Format:
    TITLE: [Title Here]
    CONTENT: [Body Content Here]`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await res.json();
        
        if (!data.candidates || !data.candidates[0].content) {
             throw new Error(data.error?.message || "AI Safety Block or Network Error");
        }

        const text = data.candidates[0].content.parts[0].text;
        
        // Parse
        const titleMatch = text.match(/TITLE:\s*(.*)/);
        const contentMatch = text.split(/CONTENT:\s*/)[1] || text;

        titleInput.value = titleMatch ? titleMatch[1].trim() : 'AI Blog Post';
        contentInput.value = contentMatch.trim();
        
        Toast.show('Success', 'Blog post generated!', 'success');
    } catch (e) {
        console.error(e);
        Toast.show('Error', `Generation failed: ${e.message}`, 'error');
    } finally {
        loadingOverlay.classList.add('d-none');
    }
}

function savePost() {
    if(!titleInput.value.trim()) {
        return Toast.show('Validation', 'Cannot save an empty post.', 'warning');
    }
    
    const drafts = getDrafts();
    const post = {
        id: currentId || Date.now(),
        title: titleInput.value,
        content: contentInput.value,
        date: new Date().toLocaleDateString()
    };

    if(currentId) {
        const idx = drafts.findIndex(d => d.id === currentId);
        if(idx > -1) drafts[idx] = post;
    } else {
        drafts.unshift(post);
        currentId = post.id;
    }
    
    saveDrafts(drafts);
    Toast.show('Saved', 'Draft saved locally.', 'success');
}

function renderDrafts() {
    const drafts = getDrafts();
    draftsList.innerHTML = drafts.map(d => `
        <div class="draft-item ${d.id === currentId ? 'active' : ''}" onclick="window.loadDraft(${d.id})">
            <div class="fw-bold text-white text-truncate">${d.title}</div>
            <div class="small text-secondary d-flex justify-content-between">
                <span>${d.date}</span>
                <i class="fa-solid fa-trash text-danger opacity-50 hover-opacity-100" onclick="event.stopPropagation(); window.deleteDraft(${d.id})"></i>
            </div>
        </div>
    `).join('');
}

window.loadDraft = (id) => {
    const drafts = getDrafts();
    const draft = drafts.find(d => d.id === id);
    if(draft) {
        currentId = draft.id;
        titleInput.value = draft.title;
        contentInput.value = draft.content;
        renderDrafts();
    }
};

window.deleteDraft = (id) => {
    if(!confirm('Delete this draft?')) return;
    const drafts = getDrafts().filter(d => d.id !== id);
    saveDrafts(drafts);
    if(currentId === id) resetEditor();
};

function resetEditor() {
    currentId = null;
    titleInput.value = '';
    contentInput.value = '';
    renderDrafts();
}

export function init() {
    topicInput = document.getElementById('ai-topic');
    toneSelect = document.getElementById('ai-tone');
    genBtn = document.getElementById('generate-btn');
    titleInput = document.getElementById('post-title');
    contentInput = document.getElementById('post-content');
    saveBtn = document.getElementById('save-post-btn');
    newBtn = document.getElementById('new-post-btn');
    draftsList = document.getElementById('drafts-list');
    loadingOverlay = document.getElementById('ai-loading');

    // Use .onclick for safer re-initialization
    if(genBtn) genBtn.onclick = generate;
    if(saveBtn) saveBtn.onclick = savePost;
    if(newBtn) newBtn.onclick = resetEditor;

    renderDrafts();
}

export function cleanup() {
    window.loadDraft = undefined;
    window.deleteDraft = undefined;
    if(genBtn) genBtn.onclick = null;
    if(saveBtn) saveBtn.onclick = null;
    if(newBtn) newBtn.onclick = null;
}
