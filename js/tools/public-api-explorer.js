// js/tools/public-api-explorer.js

// --- DOM Elements ---
let searchInput, apiListContainer, noResultsMsg;

// --- State & API ---
let allAPIs = []; // This will hold the data.

// A curated list of APIs, inspired by the public-apis project.
// This removes the dependency on a live API call that was failing.
const STATIC_API_LIST = [
  {
    API: "Cat Facts",
    Description: "Daily cat facts",
    Auth: "No",
    Link: "https://alexwohlbruck.github.io/cat-facts/",
    Category: "Animals",
  },
  {
    API: "Dogs",
    Description: "Based on the Stanford Dogs Dataset",
    Auth: "No",
    Link: "https://dog.ceo/dog-api/",
    Category: "Animals",
  },
  {
    API: "RandomFox",
    Description: "Random pictures of foxes",
    Auth: "No",
    Link: "https://randomfox.ca/floof/",
    Category: "Animals",
  },
  {
    API: "Studio Ghibli",
    Description: "Resources from Studio Ghibli films",
    Auth: "No",
    Link: "https://ghibliapi.herokuapp.com",
    Category: "Anime",
  },
  {
    API: "Open Library",
    Description: "Books, book covers and related data",
    Auth: "No",
    Link: "https://openlibrary.org/developers/api",
    Category: "Books",
  },
  {
    API: "British National Bibliography",
    Description: "Books",
    Auth: "No",
    Link: "http://bnb.data.bl.uk/",
    Category: "Books",
  },
  {
    API: "Bored",
    Description: "Find random activities to fight boredom",
    Auth: "No",
    Link: "https://www.boredapi.com/",
    Category: "Development",
  },
  {
    API: "JSON 2 JSONP",
    Description: "Convert JSON to JSONP (on-the-fly)",
    Auth: "No",
    Link: "https://json2jsonp.com/",
    Category: "Development",
  },
  {
    API: "GitHub",
    Description: "Access public repositories, users, and gists.",
    Auth: "OAuth",
    Link: "https://docs.github.com/en/rest",
    Category: "Development",
  },
  {
    API: "Rick and Morty",
    Description: "All the Rick and Morty information, including images",
    Auth: "No",
    Link: "https://rickandmortyapi.com",
    Category: "Games & Comics",
  },
  {
    API: "Open Trivia",
    Description: "Trivia Questions",
    Auth: "No",
    Link: "https://opentdb.com/api_config.php",
    Category: "Games & Comics",
  },
  {
    API: "PokéAPI",
    Description: "All the Pokémon data you'll ever need in one place.",
    Auth: "No",
    Link: "https://pokeapi.co/",
    Category: "Games & Comics",
  },
  {
    API: "GeoNames",
    Description: "Place names and other geographical data",
    Auth: "No",
    Link: "http://www.geonames.org/export/web-services.html",
    Category: "Geocoding",
  },
  {
    API: "Postcodes.io",
    Description: "Postcode lookup & Geolocation for the UK",
    Auth: "No",
    Link: "https://postcodes.io",
    Category: "Geocoding",
  },
  {
    API: "Data USA",
    Description: "US Public Data",
    Auth: "No",
    Link: "https://datausa.io/about/api/",
    Category: "Government",
  },
  {
    API: "openFDA",
    Description: "Public FDA data about drugs, devices and foods",
    Auth: "No",
    Link: "https://open.fda.gov",
    Category: "Health",
  },
  {
    API: "Lyrics.ovh",
    Description: "Simple API to retrieve the lyrics of a song",
    Auth: "No",
    Link: "http://docs.lyricsovh.apiary.io/",
    Category: "Music",
  },
  {
    API: "MusicBrainz",
    Description: "Music",
    Auth: "No",
    Link: "https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2",
    Category: "Music",
  },
  {
    API: "NASA",
    Description: "NASA data, including imagery",
    Auth: "No",
    Link: "https://api.nasa.gov",
    Category: "Science & Math",
  },
  {
    API: "Numbers",
    Description: "Facts about numbers",
    Auth: "No",
    Link: "http://numbersapi.com",
    Category: "Science & Math",
  },
  {
    API: "HackerNews",
    Description: "Social news for CS and entrepreneurship",
    Auth: "No",
    Link: "https://github.com/HackerNews/API",
    Category: "Social",
  },
  {
    API: "TVMaze",
    Description: "TV Show Data",
    Auth: "No",
    Link: "http://www.tvmaze.com/api",
    Category: "Video",
  },
  {
    API: "MetaWeather",
    Description: "Weather",
    Auth: "No",
    Link: "https://www.metaweather.com/api/",
    Category: "Weather",
  },
  {
    API: "CoinGecko",
    Description: "Cryptocurrency prices and market data",
    Auth: "No",
    Link: "https://www.coingecko.com/en/api",
    Category: "Cryptocurrency",
  },
  {
    API: "CoinMarketCap",
    Description: "Cryptocurrencies Prices",
    Auth: "No",
    Link: "https://coinmarketcap.com/api/",
    Category: "Cryptocurrency",
  },
  {
    API: "Financial Modeling Prep",
    Description: "Stock information and data",
    Auth: "No",
    Link: "https://financialmodelingprep.com/",
    Category: "Finance",
  },
  {
    API: "Recipe Puppy",
    Description: "Food",
    Auth: "No",
    Link: "http://www.recipepuppy.com/about/api/",
    Category: "Food & Drink",
  },
  {
    API: "GNews",
    Description: "Search for articles from various sources.",
    Auth: "apiKey",
    Link: "https://gnews.io/",
    Category: "News",
  },
  {
    API: "OpenWeatherMap",
    Description: "Access current weather data for any location.",
    Auth: "apiKey",
    Link: "https://openweathermap.org/api",
    Category: "Weather",
  },
  {
    API: "Advice Slip",
    Description: "Generate random advice slips",
    Auth: "No",
    Link: "http://api.adviceslip.com/",
    Category: "Personality",
  },
  {
    API: "icanhazdadjoke",
    Description: "The largest selection of dad jokes on the internet",
    Auth: "No",
    Link: "https://icanhazdadjoke.com/api",
    Category: "Personality",
  },
  {
    API: "HTTPCat",
    Description: "Cat images for every HTTP status code.",
    Auth: "No",
    Link: "https://http.cat/",
    Category: "Fun",
  },
  {
    API: "TheMealDB",
    Description: "An open, crowd-sourced database of recipes from around the world.",
    Auth: "apiKey",
    Link: "https://www.themealdb.com/api.php",
    Category: "Food & Drink",
  },
  {
    API: "Jservice (Jeopardy)",
    Description: "A database of Jeopardy questions.",
    Auth: "No",
    Link: "http://jservice.io",
    Category: "Games & Comics",
  },
  {
    API: "IPinfo",
    Description: "Get geolocation information for an IP address.",
    Auth: "apiKey",
    Link: "https://ipinfo.io/",
    Category: "Geocoding",
  },
  {
    API: "Open Brewery DB",
    Description: "A free dataset of breweries, cideries, and craft beer bottle shops.",
    Auth: "No",
    Link: "https://www.openbrewerydb.org",
    Category: "Food & Drink",
  },
  {
    API: "Deck of Cards",
    Description: "An API to simulate a deck of cards.",
    Auth: "No",
    Link: "http://deckofcardsapi.com/",
    Category: "Games & Comics",
  },
  {
    API: "ExchangeRate-API",
    Description: "Free currency conversion and exchange rate data.",
    Auth: "apiKey",
    Link: "https://www.exchangerate-api.com/",
    Category: "Currency Exchange",
  },
  {
    API: "JSONPlaceholder",
    Description: "Fake REST API for testing and prototyping.",
    Auth: "No",
    Link: "http://jsonplaceholder.typicode.com/",
    Category: "Development",
  },
  {
    API: "RandomUser",
    Description: "Generate random user data for testing.",
    Auth: "No",
    Link: "https://randomuser.me",
    Category: "Development",
  },
];

/**
 * Renders a list of APIs to the container.
 * @param {Array} apis - The array of API objects to render.
 */
function renderAPIs(apis) {
  apiListContainer.innerHTML = "";

  if (apis.length === 0) {
    noResultsMsg.classList.remove("d-none");
    return;
  }
  noResultsMsg.classList.add("d-none");

  apis.forEach((api) => {
    const col = document.createElement("div");
    col.className = "col";

    let authBadge = "";
    const authType = api.Auth ? api.Auth.toLowerCase() : "no";
    switch (authType) {
      case "apikey":
        authBadge = '<span class="badge bg-info">API Key</span>';
        break;
      case "oauth":
        authBadge = '<span class="badge bg-warning text-dark">OAuth</span>';
        break;
      default:
        authBadge = '<span class="badge bg-success">No Auth</span>';
    }

    col.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${api.API}</h5>
                    <p class="card-text small flex-grow-1">${api.Description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-secondary">${api.Category}</span>
                            ${authBadge}
                        </div>
                        <a href="${api.Link}" target="_blank" class="btn btn-sm btn-outline-primary">
                            Visit <i class="fa-solid fa-arrow-up-right-from-square ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    apiListContainer.appendChild(col);
  });
}

/**
 * Handles the search input to filter the displayed APIs.
 */
function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderAPIs(allAPIs);
    return;
  }

  const filteredAPIs = allAPIs.filter(
    (api) =>
      api.API.toLowerCase().includes(query) ||
      api.Description.toLowerCase().includes(query) ||
      api.Category.toLowerCase().includes(query)
  );

  renderAPIs(filteredAPIs);
}

/**
 * Loads and displays the list of public APIs from the static list.
 */
function loadPublicAPIs() {
  allAPIs = STATIC_API_LIST.sort((a, b) => a.API.localeCompare(b.API));
  renderAPIs(allAPIs);
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchInput = document.getElementById("api-search-input");
  apiListContainer = document.getElementById("api-list-container");
  noResultsMsg = document.getElementById("no-apis-found");

  // Attach event listeners
  searchInput.addEventListener("input", handleSearch);

  // Load data from the static list
  loadPublicAPIs();
}

export function cleanup() {
  // Remove event listeners
  if (searchInput) {
    searchInput.removeEventListener("input", handleSearch);
  }
  allAPIs = []; // Clear the data on cleanup
}
