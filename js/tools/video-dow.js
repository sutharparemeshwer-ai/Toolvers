export function init() {
  const loadBtn = document.getElementById("loadBtn");
  const videoUrlInput = document.getElementById("videoUrl");
  const preview = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");
  const videoContainer = document.getElementById("videoContainer");

  loadBtn.addEventListener("click", () => {
    const url = videoUrlInput.value.trim();
    if (!url) {
      alert("Please enter a valid video URL!");
      return;
    }

    // Load the video
    preview.src = url;
    downloadBtn.href = url;
    videoContainer.classList.remove("hidden");
  });

  // Add error handling for the video element
  preview.addEventListener('error', () => {
    videoContainer.classList.add("hidden");
    alert("Could not load video. Please ensure you are using a direct link to a video file (e.g., .mp4) and that the server allows cross-origin access.");
  });
}

export function cleanup() { /* No listeners to clean up in this simple version */ }
