// js/tools/fake-post-generator.js

// --- DOM Elements ---
let form, postTypeSelect, generateBtn, downloadBtn, canvas;
let tweetFields, tweetName, tweetHandle, tweetPfp, tweetVerified;
let newsFields, newsSource, newsDate;
let postContent;
let previewContainer;

// --- Helper Functions ---

/**
 * Loads a script dynamically.
 * @param {string} url - The URL of the script to load.
 * @returns {Promise<void>}
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Renders the preview of the post based on form inputs.
 */
async function renderPreview() {
  const postType = postTypeSelect.value;
  let previewHtml = "";

  // Disable buttons during generation
  generateBtn.disabled = true;
  generateBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

  if (postType === "tweet") {
    const name = tweetName.value || "Display Name";
    const handle = tweetHandle.value || "@username";
    const pfpUrl =
      tweetPfp.value || "https://via.placeholder.com/48/2c302f/FFFFFF?text=PFP";
    const content =
      postContent.value.replace(/\n/g, "<br>") || "This is the tweet content.";
    const verifiedBadge = tweetVerified.checked
      ? `<svg viewBox="0 0 22 22" class="ms-1" style="width: 1.2em; height: 1.2em; fill: #1DA1F2;" aria-label="Verified account" role="img" data-testid="icon-verified"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.706-1.084-1.246-1.438-.54-.354-1.17-.552-1.816-.57-.647-.018-1.276.215-1.817.57-.54.354-.972.852-1.246 1.438-.608-.223-1.264-.27-1.898-.14-.634.13-1.218.438-1.687.882-.445.47-.75 1.053-.882 1.688-.13.633-.083 1.29.14 1.897-.586.274-1.084.706-1.438 1.246-.354.54-.552 1.17-.57 1.816-.018.646.215 1.275.57 1.817.354.54.852.972 1.438 1.246-.223.607-.27 1.264-.14 1.897.13.634.438 1.218.882 1.687.47.445 1.054.75 1.688.882.633.13 1.29.083 1.897-.14.274.587.706 1.084 1.246 1.438.54.354 1.17.552 1.816.57.646.018 1.275-.215 1.817-.57.54-.354.972-.852 1.246-1.438.607.223 1.264.27 1.897.14.633-.13 1.218-.438 1.687-.882.445-.47.75-1.053.882-1.687.13-.633.083-1.29-.14-1.897.587-.273 1.084-.706 1.438-1.246.355-.54.552-1.17.57-1.816zM9.663 14.85l-3.42-3.418 1.414-1.414 2.006 2.006 4.415-4.414 1.414 1.414-5.829 5.828z"></path></g></svg>`
      : "";

    previewHtml = `
            <div class="p-3" style="background-color: #15202B; color: #FFFFFF; width: 550px; font-family: 'Helvetica Neue', sans-serif; border-radius: 16px;">
                <div class="d-flex align-items-start">
                    <img src="${pfpUrl}" class="rounded-circle" style="width: 48px; height: 48px; object-fit: cover;" crossorigin="anonymous" />
                    <div class="ms-3 flex-grow-1">
                        <div class="d-flex align-items-center">
                            <span class="fw-bold">${name}</span>
                            ${verifiedBadge}
                            <span class="ms-2 text-muted">${handle}</span>
                        </div>
                        <div class="mt-1" style="font-size: 15px; line-height: 1.4;">
                            ${content}
                        </div>
                        <div class="text-muted mt-3" style="font-size: 14px;">
                           <span>8:16 PM · Oct 26, 2023</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
  } else if (postType === "news") {
    const headline = postContent.value || "This is a News Headline";
    const source = newsSource.value || "News Source";
    const date = newsDate.value || "Date";

    previewHtml = `
            <div class="p-3" style="background-color: #FFFFFF; color: #000000; width: 550px; font-family: 'Georgia', serif; border: 1px solid #ddd;">
                <h2 style="font-weight: bold; font-size: 28px; line-height: 1.2;">${headline}</h2>
                <p class="text-muted mt-2" style="font-size: 14px; font-family: 'Helvetica Neue', sans-serif;">By <strong>${source}</strong> &bull; ${date}</p>
            </div>
        `;
  }

  // Use html2canvas to render the HTML to the canvas
  try {
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.innerHTML = previewHtml;
    document.body.appendChild(tempContainer);

    const generatedCanvas = await html2canvas(tempContainer.firstElementChild, {
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    // Copy to our visible canvas
    canvas.width = generatedCanvas.width;
    canvas.height = generatedCanvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(generatedCanvas, 0, 0);

    // Update download link
    downloadBtn.href = canvas.toDataURL("image/png");
    downloadBtn.classList.remove("disabled");

    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error("Error generating canvas:", error);
    previewContainer.innerHTML = `<div class="alert alert-danger">Error generating preview. Check console for details. An image URL might be invalid or blocked by CORS.</div>`;
  } finally {
    // Re-enable button
    generateBtn.disabled = false;
    generateBtn.innerHTML =
      '<i class="fa-solid fa-sync-alt me-2"></i>Update Preview';
  }
}

/**
 * Toggles the visibility of form fields based on the selected post type.
 */
function handlePostTypeChange() {
  const postType = postTypeSelect.value;
  if (postType === "tweet") {
    tweetFields.classList.remove("d-none");
    newsFields.classList.add("d-none");
    postContent.placeholder = "What's happening?!";
  } else if (postType === "news") {
    tweetFields.classList.add("d-none");
    newsFields.classList.remove("d-none");
    postContent.placeholder = "Enter the news headline...";
  }
  renderPreview();
}

// --- Router Hooks ---

export async function init() {
  // Get DOM elements
  form = document.getElementById("fake-post-form");
  postTypeSelect = document.getElementById("post-type");
  generateBtn = document.getElementById("generate-btn");
  downloadBtn = document.getElementById("download-btn");
  canvas = document.getElementById("post-canvas");
  previewContainer = document.getElementById("preview-container");

  tweetFields = document.getElementById("tweet-fields");
  tweetName = document.getElementById("tweet-name");
  tweetHandle = document.getElementById("tweet-handle");
  tweetPfp = document.getElementById("tweet-pfp");
  tweetVerified = document.getElementById("tweet-verified");

  newsFields = document.getElementById("news-fields");
  newsSource = document.getElementById("news-source");
  newsDate = document.getElementById("news-date");

  postContent = document.getElementById("post-content");

  // Load html2canvas library
  try {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    );

    // Attach event listeners
    postTypeSelect.addEventListener("change", handlePostTypeChange);
    generateBtn.addEventListener("click", renderPreview);
    // Use 'input' for live updates as the user types
    form.addEventListener("input", renderPreview);

    // Initial render
    handlePostTypeChange();
  } catch (error) {
    console.error(error);
    previewContainer.innerHTML = `<div class="alert alert-danger">Could not load required library (html2canvas). Please check your internet connection.</div>`;
    generateBtn.disabled = true;
  }
}

export function cleanup() {
  if (form) {
    postTypeSelect.removeEventListener("change", handlePostTypeChange);
    generateBtn.removeEventListener("click", renderPreview);
    form.removeEventListener("input", renderPreview);
  }
}
