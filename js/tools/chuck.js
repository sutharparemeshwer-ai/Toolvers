// js/tools/chuck.js

const API_URL = 'https://api.chucknorris.io/jokes/random';
let jokeOutput;
let generateBtn;

async function fetchJoke() {
    // 1. Set loading state
    jokeOutput.innerHTML = '<span class="text-info">Loading...</span>';
    generateBtn.disabled = true;

    try {
        // 2. Fetch data from the API
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();

        // 3. Display the joke. The joke text sometimes includes 'Chuck Norris' (all caps)
        // We replace it with the correctly cased name for better presentation.
        const jokeText = data.value.replace(/Chuck Norris/g, 'Chuck Norris');
        jokeOutput.innerHTML = jokeText;

    } catch (error) {
        // 4. Handle errors
        console.error('Error fetching Chuck Norris joke:', error);
        jokeOutput.innerHTML = '<span class="text-danger">❌ Failed to load joke. Try again later!</span>';
    } finally {
        // 5. Re-enable the button
        generateBtn.disabled = false;
    }
}

function handleGenerateClick() {
    fetchJoke();
}


// --- Router Hooks ---

export function init() {
    // Get DOM elements
    jokeOutput = document.getElementById('joke-output');
    generateBtn = document.getElementById('generate-btn');
    
    // Attach listener
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateClick);
    }
    
    // Load the first joke automatically when the tool loads
    if (jokeOutput) {
        fetchJoke();
    }
}

export function cleanup() {
    // Remove listener
    if (generateBtn) {
        generateBtn.removeEventListener('click', handleGenerateClick);
    }
    
    // Reset output when switching tools
    if (jokeOutput) {
        jokeOutput.innerHTML = 'Click the button to generate a joke!';
    }
}