// js/tools/ai-image-generator.js

// --- Configuration ---
// 🚨 IMPORTANT: Get your free API key from Stability AI (https://platform.stability.ai/account/keys) and replace 'YOUR_API_KEY'
const STABILITY_API_KEY = "sk-4PMtsVc4hRf2nAxWPFsL8zXjdVQlDV6KXId8WjNCEGvLp44C";

// --- DOM Elements ---
let promptInput,
  generateBtn,
  resultContainer,
  statusEl,
  imagePreview,
  downloadBtn;

/**
 * Simulates generating an image from a text prompt.
 * In a real application, this would make an API call to a service like DALL-E or Stable Diffusion. This is now a real implementation.
 */
async function handleImageGeneration() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  // --- Simulation Starts Here ---
  resultContainer.classList.remove("d-none");
  imagePreview.style.display = "none";
  downloadBtn.classList.add("d-none");
  statusEl.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Generating "${prompt}"...</p>
    `;
  generateBtn.disabled = true;

  if (STABILITY_API_KEY === "YOUR_API_KEY") {
    statusEl.innerHTML =
      '<p class="text-danger">Please add your Stability AI API key to `js/tools/ai-image-generator.js` to use this tool.</p>';
    generateBtn.disabled = false;
    return;
  }

  try {
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${await response.text()}`
      );
    }

    const data = await response.json();
    const image = data.artifacts[0];
    const imageUrl = `data:image/png;base64,${image.base64}`;

    imagePreview.src = imageUrl;
    downloadBtn.href = imageUrl;
    statusEl.innerHTML = "";
    imagePreview.style.display = "block";
    downloadBtn.classList.remove("d-none");
  } catch (error) {
    console.error("Image generation failed:", error);
    statusEl.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  } finally {
    generateBtn.disabled = false;
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  promptInput = document.getElementById("image-prompt-input");
  generateBtn = document.getElementById("generate-image-btn");
  resultContainer = document.getElementById("image-result-container");
  statusEl = document.getElementById("image-status");
  imagePreview = document.getElementById("generated-image-preview");
  downloadBtn = document.getElementById("download-image-btn");

  // Attach event listeners
  generateBtn.addEventListener("click", handleImageGeneration);
}

export function cleanup() {
  if (generateBtn) {
    generateBtn.removeEventListener("click", handleImageGeneration);
  }
}
