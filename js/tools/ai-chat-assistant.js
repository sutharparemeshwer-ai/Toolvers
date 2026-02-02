// js/tools/ai-chat-assistant.js

const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ"; 
const MODEL_NAME = "gemini-2.5-flash";

let chatWindow, chatInput, sendBtn;

// Auto-resize textarea
function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

function appendMessage(text, sender, isStreaming = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${sender}-message fade-in`;

    const avatar = document.createElement("div");
    avatar.className = `message-avatar ${sender}-avatar`;
    avatar.innerHTML = sender === 'ai' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    
    // Structure: Avatar -> Bubble (AI) OR Bubble -> Avatar (User)
    if (sender === 'ai') {
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
    } else {
        wrapper.appendChild(bubble);
        wrapper.appendChild(avatar);
    }

    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (sender === 'user') {
        bubble.textContent = text;
        return null; // No formatting needed for user
    }

    if (sender === 'ai') {
        if (isStreaming) {
            // Streaming Effect
            let index = 0;
            bubble.innerHTML = ''; // Start empty
            
            const interval = setInterval(() => {
                if (index < text.length) {
                    bubble.innerHTML = marked.parse(text.substring(0, index + 1)); // Parse markdown progressively
                    index++;
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                } else {
                    clearInterval(interval);
                }
            }, 10); // Speed of typing
            return bubble;
        } else {
             bubble.innerHTML = marked.parse(text);
        }
    }
}

async function getAIResponse(userInput) {
    if (!API_KEY || API_KEY.includes("YOUR_API")) {
        throw new Error("API Key missing. Please update js/tools/ai-chat-assistant.js");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userInput }] }] })
    });

    if (!response.ok) throw new Error("AI Service Unavailable");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Reset input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // User Message
    appendMessage(text, 'user');

    // AI Loading State (Temporary Bubble)
    const loadingWrapper = document.createElement("div");
    loadingWrapper.className = `message-wrapper ai-message`;
    loadingWrapper.innerHTML = `
        <div class="message-avatar ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-bubble text-secondary fst-italic">
            <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Thinking...
        </div>
    `;
    chatWindow.appendChild(loadingWrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await getAIResponse(text);
        chatWindow.removeChild(loadingWrapper); // Remove loading
        appendMessage(response, 'ai', true); // Add with streaming
    } catch (err) {
        chatWindow.removeChild(loadingWrapper);
        appendMessage("Error: " + err.message, 'ai');
    } finally {
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

export function init() {
    chatWindow = document.getElementById("chat-window");
    chatInput = document.getElementById("chat-input");
    sendBtn = document.getElementById("chat-send-btn");

    chatInput.addEventListener('input', autoResize);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    sendBtn.addEventListener('click', handleSend);

    // Intro Message
    if (chatWindow.children.length === 0) {
        setTimeout(() => appendMessage("Hello! I am Gemini. How can I assist you today?", 'ai', true), 500);
    }
}

export function cleanup() {
    // Cleanup listeners if needed
}