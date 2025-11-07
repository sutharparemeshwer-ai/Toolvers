// js/router.js
const COMPONENTS_PATH = "components";
const TOOLS_HTML_PATH = "tools";
const TOOLS_MODULE_PATH = "./tools";
const TOOLS_JSON = "js/tools.json";

let currentToolModule = null;
let toolsList = [];

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
  } catch (err) {
    console.error("Could not load tools list", err);
    toolsList = [];
  }
}

const CATEGORY_ICONS = {
  "AI Tools": "fa-solid fa-brain",
  Games: "fa-solid fa-gamepad",
  Calculators: "fa-solid fa-calculator",
  "Health & Fitness": "fa-solid fa-heart-pulse",
  "Forms & UI": "fa-solid fa-object-group",
  Generators: "fa-solid fa-wand-magic-sparkles",
  "System & Hardware": "fa-solid fa-microchip",
  "Data & API": "fa-solid fa-database",
  "Productivity & Organization": "fa-solid fa-list-check",
  "Finance & Calculators": "fa-solid fa-sack-dollar",
  "Text & Content": "fa-solid fa-file-alt",
  Fun: "fa-solid fa-face-laugh-beam",
  Creative: "fa-solid fa-palette",
  "Developer Tools": "fa-solid fa-code",
  Utilities: "fa-solid fa-screwdriver-wrench",
  Uncategorized: "fa-solid fa-shapes",
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
    // Home Page Card View
    parentEl.innerHTML = sortedCategories
      .map((category) => {
        const iconClass = CATEGORY_ICONS[category] || "fa-solid fa-star";
        const cardsHtml = groupedTools[category]
          .map(
            (t) => `
                <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 home-tool-card">
                        <div class="card-body mytool d-flex flex-column">
                            <h5 class="card-title mb-2">${t.name}</h5>
                            <p class="card-text small flex-grow-1">${
                              t.description || ""
                            }</p>
                            <div class="card-icon-bottom"><i class="fa-solid fa-arrow-right"></i></div>
                            <a class="stretched-link" href="#${t.id}"></a>
                        </div>
                    </div>
                </div>`
          )
          .join("");
        // Create a safe ID for the anchor link
        const categoryId = `category-${category
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase()}`;
        return `<div class="row mb-4" id="${categoryId}"><div class="col-12"><h4 class="category-header"><i class="${iconClass} me-2"></i>${category}</h4></div>${cardsHtml}</div>`;
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

    // The default behavior of clicking a link (e.g., <a href="#code-editor">)
    // is to change the hash, which is exactly what our router needs.
    // So, we don't need to preventDefault() or add any special logic here.
    // The hashchange event listener will handle the navigation.
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
    const categoryIcon = CATEGORY_ICONS[tool.category] || "fa-solid fa-star";
    // Re-use the card style from the "All Tools" page for consistency
    const card = `
            <div class="col">
                <a href="#${tool.id}" class="card h-100 all-tools-card">
                    <div class="card-body d-flex flex-column">
                        <div class="tool-icon mb-3"><i class="${categoryIcon}"></i></div>
                        <h5 class="card-title">${tool.name}</h5>
                        <p class="card-text small flex-grow-1">${tool.description}</p>
                        <span class="badge tool-category-badge align-self-start">${tool.category}</span>
                    </div>
                </a>
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
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">A Suite of Powerful Web Tools</h1>
          <p class="hero-subtitle">Discover ${toolsList.length} meticulously crafted utilities, games, and generators, all in one place.</p> 
          <a href="#" id="hero-explore-btn" class="btn hero-cta-btn">Explore Now</a>
        </div>
        <div class="hero-background-animation"></div>
      </div>

      <!-- Homepage Search Bar -->
      <div class="homepage-search-container container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <!-- The form needs a position-relative class for the dropdown -->
            <form class="search-form-home position-relative" role="search">
              <input id="homepage-tool-search" class="form-control form-control-lg" type="search" placeholder="🔍 Search for a tool by name, tag, or description..." aria-label="Search">
            </form>
          </div>
        </div>
      </div>

      <!-- "Our Core Tools" Section -->
      <div class="core-tools-container" id="explore-tools-section">
        <div class="container">
            <h1 class="text-center mb-5">Explore Our Tools</h1>
            <div id="core-categories-grid"></div>
        </div>
      </div>

      <!-- "Recently Added" Section -->
      <div class="container my-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Recently Added</h2>
        </div>
        <div id="recently-added-grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        </div>
      </div>

      <!-- "We deal with" Section -->
      <div class="tool-slider-container-fluid">
          <h1 class="text-center mb-5">We deal with</h1>
          <div class="scrolling-wrapper">
              <div class="scrolling-track">
                  <!-- Cards are duplicated for seamless looping -->
                  <a href="#" class="tool-card"><i class="fa-solid fa-brain"></i> AI Analytics</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cloud"></i> Cloud Storage</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-shield-halved"></i> Data Security</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-users"></i> CRM Integration</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-code-branch"></i> API Management</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-chart-line"></i> Business Intel</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cubes"></i> DevOps</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-mobile-screen-button"></i> Mobile Solutions</a>
                  <!-- Duplicate Set -->
                  <a href="#" class="tool-card"><i class="fa-solid fa-brain"></i> AI Analytics</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cloud"></i> Cloud Storage</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-shield-halved"></i> Data Security</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-users"></i> CRM Integration</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-code-branch"></i> API Management</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-chart-line"></i> Business Intel</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cubes"></i> DevOps</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-mobile-screen-button"></i> Mobile Solutions</a>
              </div>
          </div>
      </div>
      
      <!-- End "We deal with" Section -->
      
      <div class="container mt-5">
        <div id="home-list" class="row" style="display: none;">
        
        </div>
      </div>
      <br>
    `;
    buildNavAndHome();
    buildFeaturedToolsGrid();
    setupFeaturedToolsGridLinks();
    buildRecentlyAddedGrid();
    setupHeroButton();
    setupSearch(); // Call the search setup for the homepage
    return;
  }

  // Handle the dedicated "All Tools" page
  if (name === "all-tools") {
    try {
      const res = await fetch(`${TOOLS_HTML_PATH}/all-tools.html`);
      const urlParams = new URLSearchParams(window.location.search);
      if (!res.ok) throw new Error("all-tools.html not found");
      app.innerHTML = await res.text();
      setupAllToolsSearch(urlParams.get("q")); // Activate search, passing any query
    } catch (err) {
      console.error("Error loading all-tools page:", err);
      app.innerHTML = `<div class="alert alert-danger">Could not load the tool suite page.</div>`;
    }
    return;
  }

  // fetch HTML fragment for tool
  try {
    const res = await fetch(`${TOOLS_HTML_PATH}/${name}.html`);
    if (!res.ok) throw new Error(`Tool HTML not found for "${name}"`);
    const html = await res.text();
    // Wrap tool content in a standard container for consistent layout
    app.innerHTML = `
      <div class="container">
        ${html}
      </div>
    `;
  } catch (err) {
    console.error(`Error loading tool ${name}:`, err);
    app.innerHTML = `<div class="alert alert-danger">Tool "${name}" not found.</div>`;
    return;
  }

  // try dynamic import for tool logic module (js/tools/{name}.js)
  try {
    const module = await import(`${TOOLS_MODULE_PATH}/${name}.js`);
    currentToolModule = module;
    if (module.init) await module.init();
  } catch (err) {
    console.info("No JS module for tool or import failed:", err.message);
  }
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
  await loadComponent("footer", `${COMPONENTS_PATH}/footer.html`);
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
    const isNowFavorite = !isFavorite(toolId);

    // Toggle state
    const index = favorites.indexOf(toolId);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(toolId);
    saveFavorites();

    // Update UI
    favoriteBtn.querySelector("i").className = `fa-star ${
      isNowFavorite ? "fa-solid" : "fa-regular"
    }`;
  });
});
