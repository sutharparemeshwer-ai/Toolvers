// js/tools/dog-generator.js

// --- DOM Elements ---
let imageEl, statusEl, newDogBtn, breedSelect;

// --- API ---
const RANDOM_DOG_API_URL = "https://dog.ceo/api/breeds/image/random";
const BREED_LIST_API_URL = "https://dog.ceo/api/breeds/list/all";
const BREED_IMAGE_API_URL = "https://dog.ceo/api/breed/"; // e.g., /breed/hound/images/random

// --- Functions ---

function showStatus(message, isError = false) {
  imageEl.classList.add("d-none");
  statusEl.innerHTML = isError
    ? `<p class="text-danger">${message}</p>`
    : `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2 text-muted">${message}</p>`;
}

function showImage(imageUrl) {
  statusEl.innerHTML = "";
  imageEl.src = imageUrl;
  imageEl.classList.remove("d-none");
}

async function fetchDogImage() {
  showStatus("Fetching a good boy/girl...");
  newDogBtn.disabled = true;

  const selectedBreed = breedSelect.value;
  let url = RANDOM_DOG_API_URL;

  if (selectedBreed) {
    // Format for sub-breeds is "mainbreed/subbreed"
    url = `${BREED_IMAGE_API_URL}${selectedBreed}/images/random`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error("API did not return a successful response.");
    }

    // Preload the image before showing it to avoid a flash of the old image
    const img = new Image();
    img.onload = () => {
      showImage(data.message);
      newDogBtn.disabled = false;
    };
    img.onerror = () => {
      throw new Error("Failed to load the dog image.");
    };
    img.src = data.message;
  } catch (error) {
    console.error("Dog Fetch Error:", error);
    showStatus(error.message, true);
    newDogBtn.disabled = false;
  }
}

async function populateBreedsDropdown() {
  try {
    const response = await fetch(BREED_LIST_API_URL);
    if (!response.ok) throw new Error("Could not fetch breed list.");
    const data = await response.json();

    const breeds = data.message;
    for (const breed in breeds) {
      if (breeds[breed].length === 0) {
        const option = document.createElement("option");
        option.value = breed;
        option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
        breedSelect.appendChild(option);
      } else {
        // Handle sub-breeds (e.g., Poodle -> Standard, Toy)
        breeds[breed].forEach((subBreed) => {
          const option = document.createElement("option");
          const breedValue = `${breed}/${subBreed}`;
          option.value = breedValue;
          option.textContent = `${
            subBreed.charAt(0).toUpperCase() + subBreed.slice(1)
          } ${breed.charAt(0).toUpperCase() + breed.slice(1)}`;
          breedSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Breed List Fetch Error:", error);
    // Optionally disable the dropdown or show an error
    breedSelect.disabled = true;
    const errorOption = document.createElement("option");
    errorOption.textContent = "Could not load breeds";
    breedSelect.appendChild(errorOption);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  imageEl = document.getElementById("dog-image");
  statusEl = document.getElementById("dog-status");
  newDogBtn = document.getElementById("new-dog-btn");
  breedSelect = document.getElementById("dog-breed-select");

  // Attach event listeners
  newDogBtn.addEventListener("click", fetchDogImage);

  // Fetch the first dog image on load
  fetchDogImage();
  // Populate the breed dropdown
  populateBreedsDropdown();
}

export function cleanup() {
  // Remove event listeners
  if (newDogBtn) {
    newDogBtn.removeEventListener("click", fetchDogImage);
  }
}
