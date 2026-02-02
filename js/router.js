// js/router.js
import { Toast, CommandPalette, LegacyUpgrader } from "./ui.js";

const COMPONENTS_PATH = "components";
const TOOLS_HTML_PATH = "tools";
const TOOLS_MODULE_PATH = "./tools";
const TOOLS_JSON = "js/tools.json";

let currentToolModule = null;
let toolsList = [];
let favorites = JSON.parse(localStorage.getItem('toolverse_favorites')) || [];

function saveFavorites() {
  localStorage.setItem('toolverse_favorites', JSON.stringify(favorites));
  renderFavoritesBar(); // Re-render if on home
}

function isFavorite(id) {
  return favorites.includes(id);
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
}

// --- Component Loading & Setup ---
/* load static component (header/footer) */
async function loadComponent(targetId, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    document.getElementById(targetId).innerHTML = html;
  } catch (err) {
    console.error(err);
    document.getElementById(targetId).innerHTML = "";
  }
}

/* fetch JSON of tools */
async function loadToolsList() {
  try {
    const res = await fetch(TOOLS_JSON);
    if (!res.ok) throw new Error("tools.json not found");
    toolsList = await res.json();
    
    // Initialize Command Palette with loaded tools
    CommandPalette.init(toolsList);
    
    // Global Alert Override
    window.alert = (msg) => Toast.show('System Notification', msg, 'info');

  } catch (err) {
    console.error("Could not load tools list", err);
    toolsList = [];
  }
}

const CATEGORY_ICONS = {
  "AI Tools": "fa-solid fa-robot",
  "Games": "fa-solid fa-gamepad",
  "Calculators": "fa-solid fa-calculator",
  "Health & Fitness": "fa-solid fa-heart-pulse",
  "Forms & UI": "fa-solid fa-layer-group",
  "Generators": "fa-solid fa-wand-magic-sparkles",
  "System & Hardware": "fa-solid fa-microchip",
  "Data & API": "fa-solid fa-database",
  "Productivity & Organization": "fa-solid fa-check-double",
  "Finance & Calculators": "fa-solid fa-chart-line",
  "Text & Content": "fa-solid fa-file-pen",
  "Fun": "fa-solid fa-face-laugh-beam",
  "Creative": "fa-solid fa-palette",
  "Developer Tools": "fa-solid fa-terminal",
  "Utilities": "fa-solid fa-screwdriver-wrench",
  "Uncategorized": "fa-solid fa-box-open",
  "Settings": "fa-solid fa-gear"
};

/* build nav and home/sidebar */
function buildCategorizedView(toolList, parentId) {
  const parentEl = document.getElementById(parentId);
  if (!parentEl) return;

  // Group tools by category
  const groupedTools = toolList.reduce((acc, tool) => {
    const category = tool.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {});

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedTools).sort();

  // Generate HTML based on the view type (sidebar or home)
  if (parentId.includes("sidebar")) {
    // Sidebar Accordion View
    parentEl.innerHTML = sortedCategories
      .map((category, index) => {
        const iconClass = CATEGORY_ICONS[category] || "fa-solid fa-star";
        const linksHtml = groupedTools[category]
          .map(
            (t) => `
                <li class="nav-item">
                    <a href="#${t.id}" class="nav-link">
                        <span class="nav-icon"><i class="fa-solid fa-screwdriver-wrench"></i></span>
                        <span class="nav-text">${t.name}</span>
                    </a>
                </li>`
          )
          .join("");
        return `
                <div class="sidebar-section">
                    <div class="sidebar-section-header" data-bs-toggle="collapse" data-bs-target="#sidebar-cat-${index}">
                        <h6 class="sidebar-section-title">${category}</h6>
                        <i class="fa-solid fa-chevron-down category-chevron"></i>
                    </div>
                    <ul class="nav-list collapse" id="sidebar-cat-${index}">${linksHtml}</ul>
                </div>`;
      })
      .join("");
  } else {
    // Home Page Card View (Enterprise Edition)
    parentEl.innerHTML = sortedCategories
      .map((category) => {
        const iconClass = CATEGORY_ICONS[category] || "fa-solid fa-cube";
        const cardsHtml = groupedTools[category]
          .map(
            (t) => {
              const isFav = isFavorite(t.id);
              return `
                <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                    <div class="tool-card-premium group">
                        <a href="#${t.id}" class="stretched-link"></a>
                        <div class="premium-icon"><i class="${CATEGORY_ICONS[t.category] || 'fa-solid fa-microchip'}"></i></div>
                        <h5 class="premium-title">${t.name}</h5>
                        <p class="premium-desc">${t.description || "A powerful tool for your workflow."}</p>
                        
                        <div class="premium-action">
                           <span class="badge bg-white-5 border border-white-10 text-secondary fw-normal">${t.category}</span>
                           <button class="btn btn-link p-0 text-secondary z-2 position-relative favorite-btn" data-tool-id="${t.id}" style="font-size: 1.1rem;">
                              <i class="${isFav ? 'fa-solid text-warning' : 'fa-regular'} fa-star"></i>
                           </button>
                        </div>
                    </div>
                </div>`;
            }
          )
          .join("");
        
        // Category Section Header
        return `
            <div class="category-block" id="cat-${category.replace(/\s+/g, '-').toLowerCase()}">
                <div class="category-header-modern">
                    <div class="category-icon-box">
                        <i class="${iconClass}"></i>
                    </div>
                    <div>
                        <h4 class="category-title-text m-0">${category}</h4>
                        <small class="text-secondary">Collection of ${groupedTools[category].length} tools</small>
                    </div>
                </div>
                <div class="row">${cardsHtml}</div>
            </div>`;
      })
      .join("");
  }
}

/**
 * Builds the featured tools grid for the homepage.
 */
function buildFeaturedToolsGrid() {
  const grid = document.getElementById("core-categories-grid");
  if (!grid) return;

  // Group tools by category
  const groupedTools = toolsList.reduce((acc, tool) => {
    const category = tool.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {});

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedTools).sort();

  // Generate HTML
  grid.innerHTML = sortedCategories
    .map((category, index) => {
      const iconClass = CATEGORY_ICONS[category] || "fa-solid fa-star";
      const cardsHtml = groupedTools[category]
        .map(
          (t) => `
          
            <div class="col-auto mb-3">
                <a href="#${t.id}" class="btn tool-name-btn">${t.name}</a>
            </div>`
        )
        .join("");
      const marginClass = index > 0 ? "mt-4" : ""; // Add margin to all but the first category

      return `
            <div class="category-block py-3 ${marginClass}">
                <div class="row mb-4"><div class="col-12 text-center"><h3 class="category-header"><i class="${iconClass} me-2"></i>${category}</h3></div></div><div class="row g-2 justify-content-center">${cardsHtml}</div>
                
            </div>`;
    })
    .join("");
}

/**
 * Handles clicks within the featured tools grid.
 */
function setupFeaturedToolsGridLinks() {
  const grid = document.getElementById("core-categories-grid");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const link = e.target.closest("a.core-tool-card");
    if (!link) return;
  });
}

/**
 * Builds the grid for the "Recently Added" section on the homepage.
 */
function buildRecentlyAddedGrid() {
  const grid = document.getElementById("recently-added-grid");

  // Get the last 8 tools added to the JSON file, and reverse to show newest first.
  const recentTools = toolsList.slice(-8).reverse();

  recentTools.forEach((tool) => {
    const iconClass = CATEGORY_ICONS[tool.category] || "fa-solid fa-star";
    const isFav = isFavorite(tool.id);
    const card = `
            <div class="col">
                <div class="tool-card-premium h-100">
                    <a href="#${tool.id}" class="stretched-link"></a>
                    <div class="premium-icon"><i class="${iconClass}"></i></div>
                    <h5 class="premium-title">${tool.name}</h5>
                    <p class="premium-desc">${tool.description || ""}</p>
                    <div class="premium-action">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">New</span>
                    </div>
                </div>
            </div>
        `;
    grid.insertAdjacentHTML("beforeend", card);
  });
}

/**
 * Sets up the hero section's "Explore Now" button to scroll smoothly.
 */
function setupHeroButton() {
  const exploreBtn = document.getElementById("hero-explore-btn");
  const targetSection = document.getElementById("explore-tools-section");

  if (exploreBtn && targetSection) {
    exploreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}

/* build nav and home/sidebar */
function buildNavAndHome() {
  buildCategorizedView(toolsList, "home-list"); // Only build the home page list
  buildCategorizedView(toolsList, "tools-sidebar-list"); // Build the sidebar list
}

/* load tool html + optional module */
async function loadTool(name) {
  const app = document.getElementById("app");
  if (!app) return;

  // cleanup previous module
  if (currentToolModule && currentToolModule.cleanup) {
    try {
      await currentToolModule.cleanup();
    } catch (e) {
      console.warn(e);
    }
    currentToolModule = null;
  }

  // if no name -> show home (optional)
  if (!name) {
    app.innerHTML = `
      <!-- HERO SECTION -->
      <div class="hero-section-modern">
        <div class="hero-bg-glow"></div>
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill border border-white-10 bg-white-5 mb-4 animate-fade-in">
             <span class="status-dot"></span>
             <span class="small text-secondary fw-bold text-uppercase">v2.0 Enterprise Edition</span>
        </div>
        <h1 class="hero-title-modern">
            The Operating System for <br>
            <span class="text-gradient">Modern Developers</span>
        </h1>
        <p class="hero-subtitle-modern">
            Access ${toolsList.length}+ powerful utilities, AI agents, and security tools in one unified workspace. 
            No logins, no paywalls, privacy-first.
        </p> 
        
        <div class="search-wrapper-modern mt-4 mb-3">
            <i class="fa-solid fa-magnifying-glass search-icon-absolute"></i>
            <input id="homepage-tool-search" class="search-input-modern" type="search" placeholder="Search tools (e.g., 'json', 'pdf', 'game')..." aria-label="Search">
            <div class="position-absolute end-0 top-50 translate-middle-y me-3 d-none d-md-block">
                <span class="badge bg-dark border border-white-10 text-secondary">Ctrl K</span>
            </div>
            <div class="search-results-dropdown" id="home-search-dropdown"></div>
        </div>
        
        <div class="d-flex justify-content-center gap-4 text-secondary small mt-4">
            <span><i class="fa-solid fa-check text-success me-1"></i> Open Source</span>
            <span><i class="fa-solid fa-check text-success me-1"></i> Local Processing</span>
            <span><i class="fa-solid fa-check text-success me-1"></i> No Ads</span>
        </div>
      </div>

      <!-- Favorites Section -->
      <div class="container mb-5" id="favorites-container" style="display: none;">
        <h3 class="section-title-modern"><i class="fa-solid fa-star text-warning"></i> Quick Access</h3>
        <div class="favorites-bar" id="favorites-bar"></div>
      </div>

      <!-- FEATURE GRID (Why ToolVerse?) -->
      <div class="container py-5 border-bottom border-white-10">
          <div class="row g-4 text-center">
              <div class="col-md-4">
                  <div class="p-4 rounded-4 glass-panel h-100 hover-lift">
                      <div class="mb-3 text-primary fs-3"><i class="fa-solid fa-bolt"></i></div>
                      <h5 class="text-white fw-bold">Blazing Fast</h5>
                      <p class="text-secondary small">Built on vanilla JS with zero bloat. Tools load instantly and work offline via PWA capabilities.</p>
                  </div>
              </div>
              <div class="col-md-4">
                  <div class="p-4 rounded-4 glass-panel h-100 hover-lift">
                      <div class="mb-3 text-success fs-3"><i class="fa-solid fa-shield-halved"></i></div>
                      <h5 class="text-white fw-bold">Privacy First</h5>
                      <p class="text-secondary small">Data stays on your device. We don't track your calculations, conversions, or generated content.</p>
                  </div>
              </div>
              <div class="col-md-4">
                  <div class="p-4 rounded-4 glass-panel h-100 hover-lift">
                      <div class="mb-3 text-info fs-3"><i class="fa-solid fa-microchip"></i></div>
                      <h5 class="text-white fw-bold">AI Powered</h5>
                      <p class="text-secondary small">Integrated with next-gen models for code generation, writing assistance, and data analysis.</p>
                  </div>
              </div>
          </div>
      </div>

      <!-- "Our Core Tools" Section -->
      <div class="core-tools-container pt-5" id="explore-tools-section">
        <div class="container">
            <div id="core-categories-grid"></div>
        </div>
      </div>

      <!-- "Recently Added" Section -->
      <div class="container my-5">
        <h3 class="section-title-modern"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Fresh Updates</h3>
        <div id="recently-added-grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        </div>
      </div>
      
      <div class="container mt-5">
        <div id="home-list" class="row" style="display: none;"></div>
      </div>
      <br>
    `;
    
    // Render Favorites
    renderFavoritesBar();
    
    buildNavAndHome();
    buildFeaturedToolsGrid();
    setupFeaturedToolsGridLinks();
    buildRecentlyAddedGrid();
    setupHeroButton();
    setupSearch(); 
    return;
  }

  // Handle the dedicated "All Tools" page
  if (name === "all-tools") {
    try {
      const res = await fetch(`${TOOLS_HTML_PATH}/all-tools.html?v=${Date.now()}`);
      const urlParams = new URLSearchParams(window.location.search);
      if (!res.ok) throw new Error("all-tools.html not found");
      app.innerHTML = await res.text();
      
      // Update the count
      const countEl = document.getElementById('total-tools-count');
      if(countEl) countEl.textContent = toolsList.length;

      setupAllToolsSearch(urlParams.get("q")); // Activate search, passing any query
    } catch (err) {
      console.error("Error loading all-tools page:", err);
      app.innerHTML = `<div class="alert alert-danger">Could not load the tool suite page.</div>`;
    }
    return;
  }

  // fetch HTML fragment for tool
  try {
    const res = await fetch(`${TOOLS_HTML_PATH}/${name}.html?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Tool HTML not found for "${name}"`);
    const html = await res.text();
    // Wrap tool content in a standard container for consistent layout
    app.innerHTML = `
      <div class="container">
        ${html}
      </div>
    `;
    
    // Auto-Upgrade Legacy Tools
    setTimeout(() => LegacyUpgrader.run(), 50);

  } catch (err) {
    console.error(`Error loading tool ${name}:`, err);
    app.innerHTML = `<div class="alert alert-danger">Tool "${name}" not found.</div>`;
    return;
  }

  // try dynamic import for tool logic module (js/tools/{name}.js)
  try {
    const module = await import(`${TOOLS_MODULE_PATH}/${name}.js?v=${Date.now()}`);
    currentToolModule = module;
    if (module.init) await module.init();
  } catch (err) {
    console.info("No JS module for tool or import failed:", err.message);
  }
}

/**
 * Renders the favorites bar on the homepage.
 */
function renderFavoritesBar() {
  const container = document.getElementById('favorites-container');
  const bar = document.getElementById('favorites-bar');
  
  if (!container || !bar) return;
  
  if (favorites.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  
  // Find tool objects for the favorite IDs
  const favTools = favorites.map(id => toolsList.find(t => t.id === id)).filter(Boolean);
  
  bar.innerHTML = favTools.map(t => `
    <a href="#${t.id}" class="fav-chip">
      <i class="${CATEGORY_ICONS[t.category] || 'fa-solid fa-star'}"></i>
      ${t.name}
    </a>
  `).join('');
}

/* search helper: simple text match on name + description + tags */
function setupSearch() {
  const input = document.getElementById("homepage-tool-search"); // Use the specific ID for the homepage search
  const form = input ? input.closest("form") : null; // Find the parent form
  if (!input || !form) return;

  // Create and inject the dropdown element
  const dropdown = document.createElement("div");
  dropdown.className = "search-results-dropdown";
  form.style.position = "relative"; // Needed for absolute positioning of dropdown
  form.appendChild(dropdown);

  const renderDropdown = (results) => {
    if (results.length === 0) {
      dropdown.style.display = "none";
      return;
    }
    dropdown.innerHTML = results
      .slice(0, 7)
      .map((tool) => {
        const categoryIcon =
          CATEGORY_ICONS[tool.category] || "fa-solid fa-star";
        return `
                <a href="#${tool.id}" class="search-result-item">
                    <i class="search-result-icon ${categoryIcon}"></i>
                    <div class="search-result-text">
                        <strong class="search-result-name">${tool.name}</strong>
                        <span class="search-result-desc">${tool.description}</span>
                    </div>
                </a>`;
      })
      .join("");
    dropdown.style.display = "block";
  };

  const handleSearch = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      dropdown.style.display = "none";
      return;
    }
    const filtered = toolsList.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.tags && t.tags.join(" ").toLowerCase().includes(query))
    );
    renderDropdown(filtered);
  };

  // Debounce function to limit how often the search runs
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  input.addEventListener("input", debounce(handleSearch, 300)); // 300ms debounce delay

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.hash = `#all-tools?q=${encodeURIComponent(
      input.value.trim()
    )}`;
    dropdown.style.display = "none"; // Hide dropdown on submit
  });
}

/* theme switcher logic */
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const currentTheme = localStorage.getItem("theme") || "dark";

  const applyTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      document.body.classList.remove("light-theme");
      toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  };

  applyTheme(currentTheme);

  toggleBtn.addEventListener("click", () => {
    let newTheme = "dark";
    if (!document.body.classList.contains("light-theme")) {
      newTheme = "light";
    }
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  // Also add a button for the mobile search toggle area
  const mobileToggle = document.createElement("button");
  mobileToggle.id = "theme-toggle-btn-mobile";
  mobileToggle.className = "btn btn-outline-secondary ms-2 d-lg-none";
  mobileToggle.innerHTML = toggleBtn.innerHTML;
  mobileToggle.addEventListener("click", () => toggleBtn.click());
  document
    .querySelector(".navbar-toggler")
    .insertAdjacentElement("beforebegin", mobileToggle);
}

/* "Back to Top" button logic */
function setupBackToTopButton() {
  const backToTopBtn = document.getElementById("back-to-top-btn");
  if (!backToTopBtn) return;

  // Show or hide the button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      // Show button after scrolling 300px
      backToTopBtn.style.display = "flex";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Scroll to top on click
  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling animation
    });
  });
}

/**
 * Sets up the search functionality for the "All Tools" page.
 * @param {string|null} initialQuery - An initial search query from URL params.
 */
function setupAllToolsSearch(initialQuery = null) {
  const searchInput = document.getElementById("all-tools-search-input");
  if (!searchInput) return;

  const filterAndRender = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredTools = toolsList.filter(
      (t) =>
        t.name.toLowerCase().includes(normalizedQuery) ||
        (t.description &&
          t.description.toLowerCase().includes(normalizedQuery)) ||
        (t.tags && t.tags.join(" ").toLowerCase().includes(normalizedQuery))
    );
    buildAllToolsGrid(filteredTools);
  };

  if (initialQuery) {
    searchInput.value = initialQuery;
    filterAndRender(initialQuery);
  } else {
    buildAllToolsGrid(toolsList); // Show all tools if no query
  }

  searchInput.addEventListener("input", () =>
    filterAndRender(searchInput.value)
  );
}

/* start the app */
window.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header", `${COMPONENTS_PATH}/header.html`);
  // Footer is now static in index.html, no need to load it dynamically
  await loadToolsList();
  buildNavAndHome();
  setupSearch();
  setupThemeToggle();
  setupBackToTopButton();

  // route on hashchange
  window.addEventListener("hashchange", () => loadTool(location.hash.slice(1)));
  // initial route
  loadTool(location.hash.slice(1));
});
/**
 * Builds the grid for the "All Tools" page.
 * @param {Array} toolList - The list of tools to display.
 */
function buildAllToolsGrid(toolList) {
  const grid = document.getElementById("all-tools-grid");
  const noResultsEl = document.getElementById("no-tools-found");
  if (!grid || !noResultsEl) return;

  grid.innerHTML = ""; // Clear previous results

  if (toolList.length === 0) {
    noResultsEl.classList.remove("d-none");
  } else {
    noResultsEl.classList.add("d-none");
  }

  toolList.forEach((tool) => {
    const categoryIcon = CATEGORY_ICONS[tool.category] || "fa-solid fa-star";
    const favoriteIconClass = isFavorite(tool.id) ? "fa-solid" : "fa-regular";
    const card = `
            <div class="col">
                <div class="card h-100 all-tools-card">
                    <a href="#${tool.id}" class="stretched-link"></a>
                    <button class="btn favorite-btn" data-tool-id="${tool.id}" title="Add to Favorites">
                        <i class="${favoriteIconClass} fa-star"></i>
                    </button>
                    <div class="card-body d-flex flex-column">
                        <div class="tool-icon mb-3"><i class="${categoryIcon}"></i></div>
                        <h5 class="card-title">${tool.name}</h5>
                        <p class="card-text small flex-grow-1">${tool.description}</p>
                        <span class="badge tool-category-badge align-self-start">${tool.category}</span>
                    </div>
                </div>
            </div>
        `;
    grid.insertAdjacentHTML("beforeend", card);
  });
}

// Hide splash screen after a delay
window.addEventListener("load", () => {
  setTimeout(() => {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      splashScreen.style.opacity = "0";
    }
  }, 1000); // 1000ms = 1 second

  // --- Global Event Delegation for Favorites ---
  document.body.addEventListener("click", (e) => {
    const favoriteBtn = e.target.closest(".favorite-btn");
    if (!favoriteBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const toolId = favoriteBtn.dataset.toolId;
    toggleFavorite(toolId);

    // Update UI (Icon)
    const isNowFavorite = isFavorite(toolId);
    const icon = favoriteBtn.querySelector("i");
    if(icon) {
        icon.className = `fa-star ${isNowFavorite ? "fa-solid text-warning" : "fa-regular"}`;
    }
  });
});
