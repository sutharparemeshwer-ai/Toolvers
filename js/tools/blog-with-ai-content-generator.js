// js/tools/blog-with-ai-content-generator.js

// --- DOM Elements ---
let form, titleInput, contentInput, idInput, savedPostsList, noPostsMsg;
let generateBtn, topicSelect, aiStatus, clearFormBtn;

// --- State ---
let blogPosts = [];
const STORAGE_KEY = 'aiBlogPostsData';

// --- "AI" Content Simulation ---
const AI_CONTENT = {
    tech: {
        title: "The Unfolding Future of Technology",
        content: "Artificial intelligence, quantum computing, and biotechnology are no longer concepts of science fiction; they are shaping our present reality. As we look ahead, the integration of these technologies promises a future of unprecedented efficiency and connectivity. From smart cities that manage resources autonomously to personalized medicine tailored to our genetic makeup, the potential for positive change is immense. However, we must also navigate the ethical challenges that arise with such powerful tools, ensuring that progress serves all of humanity."
    },
    health: {
        title: "Five Simple Tips for a Healthier Lifestyle",
        content: "Embarking on a journey to better health doesn't have to be overwhelming. Start with small, manageable changes. First, prioritize hydration by drinking plenty of water throughout the day. Second, incorporate at least 30 minutes of moderate exercise, like a brisk walk, into your daily routine. Third, focus on whole foods, including fruits, vegetables, and lean proteins. Fourth, ensure you get 7-8 hours of quality sleep each night. Finally, practice mindfulness or meditation to reduce stress. These simple steps can lead to significant long-term benefits."
    },
    travel: {
        title: "The Ultimate Guide to Safe and Rewarding Solo Travel",
        content: "Traveling alone can be one of the most liberating and empowering experiences of your life. To ensure a safe and enjoyable journey, planning is key. Research your destination thoroughly, understanding local customs and safety precautions. Always share your itinerary with someone back home. Pack light but smart, including a first-aid kit and a portable charger. While traveling, stay aware of your surroundings, trust your instincts, and don't be afraid to connect with fellow travelers or locals. The freedom of a solo trip is an unparalleled opportunity for self-discovery."
    },
    finance: {
        title: "Beginner's Guide to Investing",
        content: "Investing can seem intimidating, but it's a powerful tool for building wealth over time. The key is to start early and be consistent. Consider low-cost index funds or ETFs to diversify your portfolio without needing to pick individual stocks. Remember that the market has ups and downs, so a long-term perspective is crucial for success."
    },
    creativity: {
        title: "How to Overcome Creative Block",
        content: "Every creative person faces a block at some point. To overcome it, try changing your environment or stepping away from your project for a short break. Expose yourself to new inspiration by visiting a museum, reading a book in a different genre, or listening to new music. Sometimes, the best ideas come when you're not actively searching for them."
    }
};

// --- Local Storage Functions ---
const loadPosts = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    blogPosts = stored ? JSON.parse(stored) : [];
};

const savePosts = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogPosts));
};

// --- Rendering Functions ---

const renderPostsList = () => {
    savedPostsList.innerHTML = '';
    if (blogPosts.length === 0) {
        noPostsMsg.classList.remove('d-none');
        return;
    }
    noPostsMsg.classList.add('d-none');

    blogPosts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span class="post-title-link" style="cursor: pointer;">${post.title}</span>
            <div>
                <button class="btn btn-sm btn-outline-light edit-post-btn" data-id="${post.id}"><i class="fa-solid fa-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${post.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        savedPostsList.appendChild(item);
    });
};

// --- Event Handlers ---

const handleGenerateContent = () => {
    const topic = topicSelect.value;
    const aiData = AI_CONTENT[topic];

    aiStatus.textContent = 'Generating...';
    generateBtn.disabled = true;

    // Simulate AI thinking time
    setTimeout(() => {
        titleInput.value = aiData.title;
        contentInput.value = aiData.content;
        idInput.value = ''; // Clear ID when generating new content
        aiStatus.textContent = 'Content generated!';
        generateBtn.disabled = false;
        setTimeout(() => aiStatus.textContent = '', 2000);
    }, 1000);
};

const handleFormSubmit = (event) => {
    event.preventDefault();
    const id = idInput.value;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) return;

    if (id) { // Editing existing post
        const index = blogPosts.findIndex(p => p.id == id);
        if (index > -1) {
            blogPosts[index] = { id: parseInt(id), title, content };
        }
    } else { // Adding new post
        const newPost = { id: Date.now(), title, content };
        blogPosts.push(newPost);
    }

    savePosts();
    renderPostsList();
    clearForm();
};

const handleListClick = (event) => {
    const target = event.target;
    const postItem = target.closest('.list-group-item');
    if (!postItem) return;

    const id = target.closest('button')?.dataset.id;

    if (target.closest('.edit-post-btn') || target.classList.contains('post-title-link')) {
        const postId = id || postItem.querySelector('.edit-post-btn').dataset.id;
        const post = blogPosts.find(p => p.id == postId);
        if (post) {
            idInput.value = post.id;
            titleInput.value = post.title;
            contentInput.value = post.content;
        }
    }

    if (target.closest('.delete-post-btn')) {
        if (confirm('Are you sure you want to delete this post?')) {
            blogPosts = blogPosts.filter(p => p.id != id);
            savePosts();
            renderPostsList();
            clearForm();
        }
    }
};

const clearForm = () => {
    form.reset();
    idInput.value = '';
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    form = document.getElementById('blog-post-form');
    titleInput = document.getElementById('post-title-input');
    contentInput = document.getElementById('post-content-input');
    idInput = document.getElementById('post-id-input');
    savedPostsList = document.getElementById('saved-posts-list');
    noPostsMsg = document.getElementById('no-posts-message');
    generateBtn = document.getElementById('generate-content-btn');
    topicSelect = document.getElementById('ai-topic-select');
    aiStatus = document.getElementById('ai-status');
    clearFormBtn = document.getElementById('clear-form-btn');

    // Load data and render
    loadPosts();
    renderPostsList();

    // Attach event listeners
    generateBtn.addEventListener('click', handleGenerateContent);
    form.addEventListener('submit', handleFormSubmit);
    savedPostsList.addEventListener('click', handleListClick);
    clearFormBtn.addEventListener('click', clearForm);
}

export function cleanup() {
    // Remove event listeners
    generateBtn.removeEventListener('click', handleGenerateContent);
    form.removeEventListener('submit', handleFormSubmit);
    savedPostsList.removeEventListener('click', handleListClick);
    clearFormBtn.removeEventListener('click', clearForm);
}