// js/tools/dad-joke-generator.js

const API_URL = 'https://icanhazdadjoke.com/';

let jokeTextEl, newJokeBtn;

async function fetchJoke() {
    jokeTextEl.textContent = 'Fetching joke...';
    newJokeBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        jokeTextEl.textContent = data.joke;
    } catch (error) {
        console.error('Error fetching joke:', error);
        jokeTextEl.textContent = 'Could not fetch a joke. Please try again later.';
    } finally {
        newJokeBtn.disabled = false;
    }
}

export function init() {
    jokeTextEl = document.getElementById('joke-text');
    newJokeBtn = document.getElementById('new-joke-btn');

    newJokeBtn.addEventListener('click', fetchJoke);

    // Fetch initial joke
    fetchJoke();
}

export function cleanup() {
    newJokeBtn?.removeEventListener('click', fetchJoke);
}