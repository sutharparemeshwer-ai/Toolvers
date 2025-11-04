// js/tools/pokedex.js

// --- DOM Elements ---
let searchForm, searchInput, statusEl, pokedexCard;
let nameEl, idEl, imageEl, typesEl, statsEl;

// --- API ---
const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

// --- Data ---
const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// --- Functions ---

function showStatus(message, isError = false) {
  pokedexCard.classList.add("d-none");
  statusEl.innerHTML = `<div class="alert ${
    isError ? "alert-danger" : "alert-info"
  }">${message}</div>`;
  statusEl.classList.remove("d-none");
}

function renderPokemon(data) {
  statusEl.classList.add("d-none");
  pokedexCard.classList.remove("d-none");

  // Basic Info
  nameEl.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  idEl.textContent = `#${data.id.toString().padStart(3, "0")}`;
  imageEl.src =
    data.sprites.other["official-artwork"].front_default ||
    data.sprites.front_default;

  // Types
  typesEl.innerHTML = "";
  data.types.forEach((typeInfo) => {
    const typeName = typeInfo.type.name;
    const typeBadge = document.createElement("span");
    typeBadge.className = "badge me-1";
    typeBadge.textContent = typeName.toUpperCase();
    typeBadge.style.backgroundColor = TYPE_COLORS[typeName] || "#777";
    typesEl.appendChild(typeBadge);
  });

  // Stats
  statsEl.innerHTML = "";
  data.stats.forEach((statInfo) => {
    const statName = statInfo.stat.name.replace("-", " ");
    const statValue = statInfo.base_stat;
    const statDiv = document.createElement("div");
    statDiv.className = "mb-2";
    statDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <span class="text-capitalize small">${statName}</span>
                <span class="small fw-bold">${statValue}</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar" role="progressbar" style="width: ${
                  statValue / 2.55
                }%;" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="255"></div>
            </div>
        `;
    statsEl.appendChild(statDiv);
  });
}

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  showStatus("Searching for Pokémon...");

  try {
    const response = await fetch(`${API_BASE_URL}${query}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Pokémon "${query}" not found. Check the name or number.`
        );
      } else {
        throw new Error(`API Error: ${response.statusText}`);
      }
    }
    const data = await response.json();
    renderPokemon(data);
  } catch (error) {
    console.error("Pokémon Fetch Error:", error);
    showStatus(error.message, true);
  }
}

// --- Router Hooks ---

export function init() {
  // Get DOM elements
  searchForm = document.getElementById("pokedex-search-form");
  searchInput = document.getElementById("pokemon-search-input");
  statusEl = document.getElementById("pokedex-status");
  pokedexCard = document.getElementById("pokedex-card");
  nameEl = document.getElementById("pokemon-name");
  idEl = document.getElementById("pokemon-id");
  imageEl = document.getElementById("pokemon-image");
  typesEl = document.getElementById("pokemon-types");
  statsEl = document.getElementById("pokemon-stats");

  // Attach event listeners
  searchForm.addEventListener("submit", handleSearch);
}

export function cleanup() {
  // Remove event listeners
  if (searchForm) {
    searchForm.removeEventListener("submit", handleSearch);
  }
}
