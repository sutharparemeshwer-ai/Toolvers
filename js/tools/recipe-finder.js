// js/tools/recipe-finder.js

const SEARCH_API = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const DETAILS_API = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

// DOM Elements
let searchInputEl, searchBtnEl, resultsContainerEl, initialMessageEl;
let modalEl;

// --- Helper Functions ---

/**
 * Renders the results (a list of meal cards) into the container.
 */
function displayMeals(meals) {
    resultsContainerEl.innerHTML = ''; // Clear previous results
    initialMessageEl.classList.add('d-none'); // Hide the initial message

    if (!meals) {
        resultsContainerEl.innerHTML = `<p class="text-center text-danger w-100">No recipes found. Try a different search term!</p>`;
        return;
    }

    meals.forEach(meal => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 mytool recipe-card" data-id="${meal.idMeal}">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <p class="card-text small text-muted">${meal.strArea} Dish</p>
                        <button class="btn btn-warning view-recipe-btn w-100" data-bs-toggle="modal" data-bs-target="#recipeModal">View Recipe</button>
                    </div>
                </div>
            </div>
        `;
        resultsContainerEl.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Attach listener to all new 'View Recipe' buttons
    document.querySelectorAll('.view-recipe-btn').forEach(button => {
        button.addEventListener('click', handleViewRecipe);
    });
}


/**
 * Constructs and displays the full recipe details in the modal.
 */
function renderRecipeDetails(meal) {
    const detailsContentEl = document.getElementById('recipe-details-content');
    
    // 1. Collect ingredients and measures (API has up to 20!)
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            ingredientsList += `<li>${measure} - ${ingredient}</li>`;
        }
    }
    
    // 2. Format instructions (optional: replace newlines with paragraphs)
    const instructions = meal.strInstructions.replace(/\n/g, '<p>');

    // 3. Generate HTML
    const html = `
        <h3 class="text-warning">${meal.strMeal}</h3>
        <p class="text-muted small">${meal.strArea} | Category: ${meal.strCategory}</p>
        
        <div class="row">
            <div class="col-md-5">
                <img src="${meal.strMealThumb}" class="img-fluid rounded mb-3" alt="${meal.strMeal}">
            </div>
            <div class="col-md-7">
                <h6>Ingredients:</h6>
                <ul>${ingredientsList}</ul>
            </div>
        </div>
        
        <h6>Instructions:</h6>
        <p class="small">${instructions}</p>
        
        ${meal.strYoutube ? `<p class="mt-3"><a href="${meal.strYoutube}" target="_blank" class="btn btn-danger btn-sm"><i class="fab fa-youtube"></i> Watch Video</a></p>` : ''}
    `;

    detailsContentEl.innerHTML = html;
    // Set the modal title
    document.getElementById('recipeModalLabel').textContent = meal.strMeal;
}


// --- Event Handlers ---

/**
 * Main search function triggered by the button click.
 */
async function handleSearch() {
    const searchTerm = searchInputEl.value.trim();
    if (searchTerm === "") {
        alert("Please enter a meal name or ingredient.");
        return;
    }
    
    // Set loading state
    resultsContainerEl.innerHTML = `<p class="text-center text-info w-100">Searching for recipes...</p>`;
    searchBtnEl.disabled = true;

    try {
        const response = await fetch(SEARCH_API + searchTerm);
        const data = await response.json();
        
        displayMeals(data.meals);

    } catch (error) {
        console.error("Error during search:", error);
        resultsContainerEl.innerHTML = `<p class="text-center text-danger w-100">A connection error occurred. Try running with Live Server.</p>`;
    } finally {
        searchBtnEl.disabled = false;
    }
}


/**
 * Fetches and displays the full recipe when the user clicks 'View Recipe'.
 */
async function handleViewRecipe(e) {
    // Get the meal ID from the parent card element
    const mealId = e.target.closest('.recipe-card').dataset.id;
    
    const detailsContentEl = document.getElementById('recipe-details-content');
    detailsContentEl.innerHTML = '<p class="text-center text-info">Loading full recipe...</p>';

    try {
        const response = await fetch(DETAILS_API + mealId);
        const data = await response.json();
        
        if (data.meals && data.meals.length > 0) {
            renderRecipeDetails(data.meals[0]);
        } else {
            detailsContentEl.innerHTML = '<p class="text-center text-danger">Details not found.</p>';
        }

    } catch (error) {
        console.error("Error fetching recipe details:", error);
        detailsContentEl.innerHTML = '<p class="text-center text-danger">Error fetching details.</p>';
    }
}


// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    searchInputEl = document.getElementById('search-input');
    searchBtnEl = document.getElementById('search-btn');
    resultsContainerEl = document.getElementById('results-container');
    initialMessageEl = document.getElementById('initial-message');
    modalEl = document.getElementById('recipeModal'); // Reference to the modal container

    // 2. Attach listeners
    if (searchBtnEl) {
        searchBtnEl.addEventListener('click', handleSearch);
    }
    // Allow pressing Enter key to search
    if (searchInputEl) {
        searchInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // IMPORTANT: The Bootstrap modal requires the library to be loaded (which your router should handle)
}

export function cleanup() {
    // Remove listeners
    if (searchBtnEl) {
        searchBtnEl.removeEventListener('click', handleSearch);
    }
    if (searchInputEl) {
        searchInputEl.removeEventListener('keypress', handleSearch);
    }
    document.querySelectorAll('.view-recipe-btn').forEach(button => {
        button.removeEventListener('click', handleViewRecipe);
    });
    
    // Clear the container
    if (resultsContainerEl) resultsContainerEl.innerHTML = '';
}