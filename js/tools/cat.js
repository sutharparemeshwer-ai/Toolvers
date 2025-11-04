// js/tools/cat-generator.js

// API Endpoints
const CAT_IMAGE_API = 'https://api.thecatapi.com/v1/images/search';
const CAT_FACT_API = 'https://catfact.ninja/fact';

const imageElement = document.getElementById('cat-image');
const factElement = document.getElementById('cat-fact');
const button = document.getElementById('generate-cat-btn');

/**
 * Fetches a random cat image and a random cat fact simultaneously.
 */
async function generateCat() {
    if (!button) return;
    
    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Meow-loading...';
    imageElement.style.display = 'none';
    factElement.textContent = 'Fetching feline data...';
    
    try {
        // Use Promise.all to fetch image and fact concurrently
        const [imageResponse, factResponse] = await Promise.all([
            fetch(CAT_IMAGE_API),
            fetch(CAT_FACT_API)
        ]);

        const imageData = await imageResponse.json();
        const factData = await factResponse.json();

        // 1. Update Image
        if (imageData && imageData.length > 0) {
            imageElement.src = imageData[0].url;
            imageElement.style.display = 'block';
        } else {
            imageElement.style.display = 'none';
        }

        // 2. Update Fact
        if (factData && factData.fact) {
            factElement.textContent = factData.fact;
        } else {
            factElement.textContent = 'Could not retrieve a fun cat fact. 😿';
        }
        
    } catch (error) {
        console.error("Error fetching cat data:", error);
        factElement.textContent = 'An error occurred while fetching the cat data. Check console. 🚫';
        imageElement.style.display = 'none';
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Get Cat';
    }
}


// Initialization function for router
export function init() {
    if (button) {
        button.addEventListener('click', generateCat);
        // Load the first cat on tool load
        generateCat(); 
    }
}

// Cleanup function for router
export function cleanup() {
    if (button) {
        button.removeEventListener('click', generateCat);
    }
}