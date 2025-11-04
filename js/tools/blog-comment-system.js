// js/tools/blog-comment-system.js

// --- State & Config ---
let comments = [];
const STORAGE_KEY = 'blogComments';

// --- DOM Elements ---
let commentForm, authorInput, textInput, commentsContainer;

// --- Local Storage ---

function loadComments() {
    const storedComments = localStorage.getItem(STORAGE_KEY);
    comments = storedComments ? JSON.parse(storedComments) : [];
}

function saveComments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

// --- Rendering ---

function renderComments() {
    commentsContainer.innerHTML = '';
    const topLevelComments = comments.filter(c => !c.parentId);

    if (topLevelComments.length === 0) {
        commentsContainer.innerHTML = '<p class="text-muted">No comments yet. Be the first to comment!</p>';
    } else {
        topLevelComments.forEach(comment => {
            const commentEl = createCommentElement(comment);
            commentsContainer.appendChild(commentEl);
        });
    }
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment mb-3';
    div.dataset.commentId = comment.id;

    const date = new Date(comment.timestamp).toLocaleString();

    div.innerHTML = `
        <div class="card border-light">
            <div class="card-body">
                <h6 class="card-title mb-1 text-light">${comment.author}</h6>
                <p class="card-text">${comment.text}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-light">${date}</small>
                    <div>
                        <button class="btn btn-sm btn-link reply-btn">Reply</button>
                        <button class="btn btn-sm btn-link text-danger delete-btn">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="replies ps-4 mt-2"></div>
    `;

    // Render replies
    const repliesContainer = div.querySelector('.replies');
    const replies = comments.filter(c => c.parentId === comment.id);
    replies.forEach(reply => {
        const replyEl = createCommentElement(reply);
        repliesContainer.appendChild(replyEl);
    });

    return div;
}

function showReplyForm(parentId) {
    // Remove any existing reply forms
    const existingForm = document.querySelector('.reply-form');
    if (existingForm) existingForm.remove();

    const parentCommentEl = document.querySelector(`.comment[data-comment-id='${parentId}'] > .card`);
    if (!parentCommentEl) return;

    const formEl = document.createElement('form');
    formEl.className = 'reply-form card-body border-top';
    formEl.innerHTML = `
        <h6 class="small">Replying to ${comments.find(c => c.id === parentId).author}</h6>
        <input type="text" class="form-control form-control-sm mb-2" placeholder="Your Name" required>
        <textarea class="form-control form-control-sm mb-2" rows="2" placeholder="Write your reply..." required></textarea>
        <button type="submit" class="btn btn-sm btn-primary">Post Reply</button>
        <button type="button" class="btn btn-sm btn-secondary cancel-reply-btn">Cancel</button>
    `;

    parentCommentEl.appendChild(formEl);

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = formEl.querySelector('input').value.trim();
        const text = formEl.querySelector('textarea').value.trim();
        if (author && text) {
            addComment(author, text, parentId);
            formEl.remove();
        }
    });

    formEl.querySelector('.cancel-reply-btn').addEventListener('click', () => {
        formEl.remove();
    });
}

// --- Logic ---

function addComment(author, text, parentId = null) {
    const newComment = {
        id: Date.now(),
        author,
        text,
        parentId,
        timestamp: new Date().toISOString(),
    };
    comments.push(newComment);
    saveComments();
    renderComments();
}

/**
 * Deletes a comment and all of its nested replies.
 * @param {number} commentId The ID of the comment to delete.
 */
function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment and all its replies? This cannot be undone.')) {
        return;
    }

    const idsToDelete = [commentId];

    // Recursive function to find all children IDs
    function findChildren(parentId) {
        const children = comments.filter(c => c.parentId === parentId);
        children.forEach(child => {
            idsToDelete.push(child.id);
            findChildren(child.id); // Find grandchildren, etc.
        });
    }

    findChildren(commentId);

    comments = comments.filter(c => !idsToDelete.includes(c.id));
    saveComments();
    renderComments();
}

// --- Event Handlers ---

function handleFormSubmit(e) {
    e.preventDefault();
    const author = authorInput.value.trim();
    const text = textInput.value.trim();

    if (author && text) {
        addComment(author, text);
        commentForm.reset();
    }
}

function handleCommentsClick(e) {
    const target = e.target;
    const parentCommentEl = target.closest('.comment');
    if (!parentCommentEl) return;

    const commentId = parseInt(parentCommentEl.dataset.commentId, 10);

    if (target.classList.contains('reply-btn')) {
        showReplyForm(commentId);
    } else if (target.classList.contains('delete-btn')) {
        deleteComment(commentId);
    }
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    commentForm = document.getElementById('comment-form');
    authorInput = document.getElementById('comment-author');
    textInput = document.getElementById('comment-text');
    commentsContainer = document.getElementById('comments-container');

    // Load data and render
    loadComments();
    renderComments();

    // Attach listeners
    commentForm.addEventListener('submit', handleFormSubmit);
    commentsContainer.addEventListener('click', handleCommentsClick);
}

export function cleanup() {
    // Remove listeners
    commentForm.removeEventListener('submit', handleFormSubmit);
    commentsContainer.removeEventListener('click', handleCommentsClick);
}