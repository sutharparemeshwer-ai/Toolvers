// js/tools/film.js
import { Toast } from '../ui.js';

const API_KEY = 'fe5ffe31'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&t=`;

let form, input, content, empty, poster, title, year, runtime, genre, plot, director, cast, awards, rating;

async function search(e) {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    // Loading UI
    content.classList.add('d-none');
    empty.innerHTML = '<div class="spinner-border text-primary"></div>';
    empty.classList.remove('d-none');

    try {
        const res = await fetch(`${BASE_URL}${encodeURIComponent(q)}`);
        const data = await res.json();

        if (data.Response === 'False') throw new Error(data.Error);

        // Render
        title.textContent = data.Title;
        year.textContent = data.Year;
        runtime.textContent = data.Runtime;
        genre.textContent = data.Genre;
        plot.textContent = data.Plot;
        director.textContent = data.Director;
        cast.textContent = data.Actors;
        awards.textContent = data.Awards;
        rating.textContent = `IMDb ${data.imdbRating}`;
        
        poster.src = (data.Poster !== 'N/A') ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';

        empty.classList.add('d-none');
        content.classList.remove('d-none');

    } catch (err) {
        empty.innerHTML = `<i class="fa-solid fa-circle-exclamation text-danger fa-2x mb-3"></i><p class="text-white">${err.message}</p>`;
    }
}

export function init() {
    form = document.getElementById('film-search-form');
    input = document.getElementById('movie-title-input');
    content = document.getElementById('movie-content');
    empty = document.getElementById('empty-state');
    
    poster = document.getElementById('movie-poster');
    title = document.getElementById('movie-title');
    year = document.getElementById('movie-year');
    runtime = document.getElementById('movie-runtime');
    genre = document.getElementById('movie-genre');
    plot = document.getElementById('movie-plot');
    director = document.getElementById('movie-director');
    cast = document.getElementById('movie-cast');
    awards = document.getElementById('movie-awards');
    rating = document.getElementById('movie-rating');

    form.addEventListener('submit', search);
}

export function cleanup() {}
