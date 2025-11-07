// js/tools/blog-with-ai-content-generator.js

// --- DOM Elements ---
let form,
  titleInput,
  contentInput,
  idInput,
  savedPostsList,
  noPostsMsg,
  clearFormBtn;
let generateBtn, topicInput, aiStatus;

// --- State ---
let blogPosts = [];
const STORAGE_KEY = "aiBlogPostsData";

// --- AI Configuration ---
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ"; // Using the key from your other AI tools
const MODEL_NAME = "gemini-2.5-flash";

async function generateContentWithAI(topic) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/blog-with-ai-content-generator.js'"
    );
  }

  const prompt = `
        Write a short blog post about "${topic}".
        The response should be structured with a title and content.
        Format the response exactly like this, with no extra text:

        TITLE: [Your generated title here]
        CONTENT: [Your generated blog post content here, about 3-4 paragraphs long]
    `;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || "The AI service failed to respond."
    );
  }

  const data = await response.json();
  try {
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const titleMatch = aiResponseText.match(/TITLE:\s*([\s\S]*?)\s*CONTENT:/);
    const contentMatch = aiResponseText.match(/CONTENT:\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : "AI Generated Title";
    const content = contentMatch
      ? contentMatch[1].trim()
      : "AI could not generate content for this topic.";

    return { title, content };
  } catch (e) {
    throw new Error("Could not understand the AI's response format.");
  }
}

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
  savedPostsList.innerHTML = "";
  if (blogPosts.length === 0) {
    noPostsMsg.classList.remove("d-none");
    return;
  }
  noPostsMsg.classList.add("d-none");

  blogPosts.forEach((post) => {
    const item = document.createElement("div");
    item.className =
      "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
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

const handleGenerateContent = async () => {
  const topic = topicInput.value.trim();
  if (!topic) {
    alert("Please enter a topic for the AI to write about.");
    return;
  }

  aiStatus.innerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <span class="ms-2 text-white">Generating...</span>
  `;
  generateBtn.disabled = true;

  try {
    const aiData = await generateContentWithAI(topic);
    titleInput.value = aiData.title;
    contentInput.value = aiData.content;
    idInput.value = "";
    aiStatus.textContent = "Content generated!";
    setTimeout(() => (aiStatus.textContent = ""), 3000);
  } catch (error) {
    aiStatus.textContent = `Error: ${error.message}`;
  } finally {
    generateBtn.disabled = false;
  }
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const id = idInput.value;
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  if (id) {
    // Editing existing post
    const index = blogPosts.findIndex((p) => p.id == id);
    if (index > -1) {
      blogPosts[index] = { id: parseInt(id), title, content };
    }
  } else {
    // Adding new post
    const newPost = { id: Date.now(), title, content };
    blogPosts.push(newPost);
  }

  savePosts();
  renderPostsList();
  clearForm();
};

const handleListClick = (event) => {
  const target = event.target;
  const postItem = target.closest(".list-group-item");
  if (!postItem) return;

  const id = target.closest("button")?.dataset.id;

  if (
    target.closest(".edit-post-btn") ||
    target.classList.contains("post-title-link")
  ) {
    const postId = id || postItem.querySelector(".edit-post-btn").dataset.id;
    const post = blogPosts.find((p) => p.id == postId);
    if (post) {
      idInput.value = post.id;
      titleInput.value = post.title;
      contentInput.value = post.content;
    }
  }

  if (target.closest(".delete-post-btn")) {
    if (confirm("Are you sure you want to delete this post?")) {
      blogPosts = blogPosts.filter((p) => p.id != id);
      savePosts();
      renderPostsList();
      clearForm();
    }
  }
};

const clearForm = () => {
  form.reset();
  idInput.value = "";
};

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  form = document.getElementById("blog-post-form");
  titleInput = document.getElementById("post-title-input");
  contentInput = document.getElementById("post-content-input");
  idInput = document.getElementById("post-id-input");
  savedPostsList = document.getElementById("saved-posts-list");
  noPostsMsg = document.getElementById("no-posts-message");
  generateBtn = document.getElementById("generate-content-btn");
  topicInput = document.getElementById("ai-topic-input");
  aiStatus = document.getElementById("ai-status");
  clearFormBtn = document.getElementById("clear-form-btn");

  // Check for API Key
  if (API_KEY === "YOUR_API_KEY") {
    aiStatus.textContent = "Warning: API key is not set.";
    generateBtn.disabled = true;
  }

  // Load data and render
  loadPosts();
  renderPostsList();

  // Attach event listeners
  generateBtn.addEventListener("click", handleGenerateContent);
  form.addEventListener("submit", handleFormSubmit);
  savedPostsList.addEventListener("click", handleListClick);
  clearFormBtn.addEventListener("click", clearForm);
}

export function cleanup() {
  // Remove event listeners
  generateBtn.removeEventListener("click", handleGenerateContent);
  form.removeEventListener("submit", handleFormSubmit);
  savedPostsList.removeEventListener("click", handleListClick);
  clearFormBtn.removeEventListener("click", clearForm);
}
