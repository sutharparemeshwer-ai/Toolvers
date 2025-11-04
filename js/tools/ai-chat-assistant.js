// js/tools/ai-chat-assistant.js

// --- Configuration ---
// 🚨 IMPORTANT: Get your free API key from Google AI Studio (https://aistudio.google.com/app/apikey) and replace 'YOUR_API_KEY'
const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ"; // This was the line with the error. It is now fixed.
// The model name to use. "gemini-pro" is the standard model.
const MODEL_NAME = "gemini-2.5-flash";

// --- DOM Elements ---
let chatWindow, chatForm, chatInput, sendBtn, typingIndicator;

/**
 * Appends a message to the chat window.
 * @param {string} text The message content.
 * @param {string} sender 'user' or 'ai'.
 */
function appendMessage(text, sender) {
  const messageBubble = document.createElement("div");
  messageBubble.className = `message-bubble ${sender}`;
  messageBubble.textContent = text;
  chatWindow.appendChild(messageBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
}

/**
 * Makes an API call to the Google Gemini API to get a response.
 * @param {string} userInput The user's message.
 * @returns {Promise<string>} A promise that resolves with the AI's response.
 */
async function getAIResponse(userInput) {
  if (API_KEY === "YOUR_API_KEY") {
    return Promise.reject(
      "Please add your Google Gemini API key to 'js/tools/ai-chat-assistant.js' to use this tool."
    );
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: userInput,
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(
      errorData.error?.message || "The AI service failed to respond."
    );
  }

  const data = await response.json();

  // Extract the text from the response
  try {
    const text = data.candidates[0].content.parts[0].text;
    return text.trim();
  } catch (e) {
    console.error("Error parsing AI response:", data);
    throw new Error("Could not understand the AI's response format.");
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const userInput = chatInput.value.trim();
  if (!userInput) return;

  appendMessage(userInput, "user");
  chatInput.value = "";
  sendBtn.disabled = true;
  typingIndicator.style.display = "block";

  try {
    const aiResponse = await getAIResponse(userInput);
    appendMessage(aiResponse, "ai");
  } catch (error) {
    console.error("AI response error:", error);
    appendMessage(`Sorry, an error occurred: ${error.message}`, "ai");
  } finally {
    sendBtn.disabled = false;
    typingIndicator.style.display = "none";
    chatInput.focus();
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  chatWindow = document.getElementById("chat-window");
  chatForm = document.getElementById("chat-form");
  chatInput = document.getElementById("chat-input");
  sendBtn = document.getElementById("chat-send-btn");
  typingIndicator = document.getElementById("ai-typing-indicator");

  // Update initial message if API key is missing
  if (API_KEY === "YOUR_API_KEY") {
    document.querySelector(".message-bubble.ai").textContent =
      "Welcome! To enable the AI, please get a free API key from Google AI Studio and add it to the `ai-chat-assistant.js` file.";
  }

  // Attach event listeners
  if (chatForm) {
    chatForm.addEventListener("submit", handleFormSubmit);
  }
}

export function cleanup() {
  // Remove event listeners
  if (chatForm) {
    chatForm.removeEventListener("submit", handleFormSubmit);
  }
}
