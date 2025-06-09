// Main app logic: orchestration, state, event listeners only
// Edamam API: Only /search endpoint is supported (Meal Planner Plan)
// Spoonacular API: Only /recipes/complexSearch and /recipes/{id}/nutritionWidget.json endpoints are allowed
import { searchEdamamRecipes, getEdamamRecipeById, searchSpoonacularRecipes, getSpoonacularRecipeNutrition } from './api.js';
import { toggleFavorite, isFavorite, getDetailedFavorites } from './storage.js';
import { createRecipeCard } from '../components/recipeCard.js';
import { createRecipeDetailMarkup } from '../components/recipeDetail.js';
import { showLoading, showError } from '../components/loading.js';
import { initializeFilters, applyFilters } from '../components/filters.js';
// Add other imports as needed (e.g., debounce)

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');
const loadingElement = document.getElementById('loading');
const noResultsElement = document.getElementById('no-results');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('recipeModal');
const modalContent = document.getElementById('recipeDetail');
const closeModal = document.querySelector('.close-modal');

// State
let currentRecipes = [];
let activeFilter = 'all';
let isFavoriteView = false;

// Initialize the application
function init() {
  setupEventListeners();
  loadInitialRecipes();
  updateActiveLink();
  initializeFilters();
}

// Set up event listeners
function setupEventListeners() {
  // Search functionality
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => handleFilterClick(button));
  });

  // Modal
  closeModal.addEventListener('click', closeRecipeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeRecipeModal();
  });

  // Navigation
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', handleNavClick);
  });
}

// Handle search
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  showLoading(true);
  isFavoriteView = false;
  
  try {
    const recipes = await searchRecipes(query);
    currentRecipes = recipes || [];
    displayRecipes(currentRecipes);
  } catch (error) {
    showError('Failed to fetch recipes. Please try again later.');
    console.error('Search error:', error);
  } finally {
    showLoading(false);
  }
}

// Handle filter click
function handleFilterClick(button) {
  // Update active filter
  filterButtons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  
  // Filter recipes
  let filteredRecipes = [...currentRecipes];
  
  if (activeFilter !== 'all') {
    filteredRecipes = currentRecipes.filter(recipe => {
      return recipe.healthLabels?.includes(activeFilter.toUpperCase()) ||
             recipe.dietLabels?.includes(activeFilter.toUpperCase());
    });
  }
  
  displayRecipes(filteredRecipes);
}

// Display recipes in the grid
function updateRecipeCount(count) {
  const recipeCount = document.getElementById('recipe-count');
  if (recipeCount) {
    recipeCount.textContent = `${count} ${count === 1 ? 'recipe' : 'recipes'} found`;
  }
}

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    noResultsElement.style.display = 'block';
    resultsContainer.innerHTML = '';
    updateRecipeCount(0);
    return;
  }
  
  noResultsElement.style.display = 'none';
  
  const recipeCards = recipes.map(recipe => createRecipeCard(recipe)).join('');
  resultsContainer.innerHTML = recipeCards;
  
  // Add event listeners to the new recipe cards
  document.querySelectorAll('.recipe-card').forEach((card, index) => {
    card.addEventListener('click', () => showRecipeDetails(recipes[index]));
  });
  
  // Update favorite buttons
  updateFavoriteButtons();
  updateRecipeCount(recipes.length);
}

// Show recipe details in modal (modular, unified Edamam/Spoonacular logic)
async function showRecipeDetails(recipe) {
  showLoading(true, 'Loading recipe details...');
  try {
    // Detect Edamam vs Spoonacular
    // Edamam: uri starts with 'http', Spoonacular: has numeric id
    let detailMarkup = '';
    if (recipe.uri && recipe.uri.startsWith('http')) {
      // Edamam
      let fullRecipe = recipe;
      if (!recipe.ingredientLines) {
        fullRecipe = await getEdamamRecipeById(recipe.uri);
      }
      // Nutrition from Edamam recipe object
      detailMarkup = createRecipeDetailMarkup(fullRecipe, fullRecipe.totalNutrients, []);
    } else if (recipe.id) {
      // Spoonacular
      const nutrition = await getSpoonacularRecipeNutrition(recipe.id);
      detailMarkup = createRecipeDetailMarkup(recipe, nutrition, []);
    } else {
      throw new Error('Unknown recipe source.');
    }
    modalContent.innerHTML = detailMarkup;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Error showing recipe details:', error);
    showError('Failed to load recipe details. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Close recipe modal
function closeRecipeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = '';
  modalContent.innerHTML = '';
}

// Update favorite buttons
function updateFavoriteButtons() {
  document.querySelectorAll('.btn-favorite').forEach(button => {
    const recipeId = button.dataset.recipeId;
    if (recipeId) {
      const isFav = isFavorite(recipeId);
      const icon = button.querySelector('i');
      
      if (icon) {
        icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
      }
      
      button.classList.toggle('active', isFav);
      button.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
      
      // Update click handler
      button.onclick = (e) => {
        e.stopPropagation();
        const newFavState = toggleFavorite({
          uri: recipeId,
          ...currentRecipes.find(r => r.uri === recipeId)
        });
        updateFavoriteButton(button, newFavState);
      };
    }
  });
}

// Update a single favorite button
function updateFavoriteButton(button, isFav) {
  const icon = button.querySelector('i');
  
  if (icon) {
    icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
  }
  
  button.classList.toggle('active', isFav);
  button.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
  
  // If it's a text button, update the text
  if (button.textContent.includes('Save') || button.textContent.includes('Saved')) {
    button.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? 'Saved' : 'Save Recipe'}`;
  }
  
  return isFav;
}

// Add ingredients to shopping list
function addToShoppingList(recipe) {
  // In a real app, this would add to a shopping list in local storage
  alert(`Added ${recipe.ingredientLines.length} ingredients to your shopping list!`);
}

// Load initial recipes
async function loadInitialRecipes() {
  showLoading(true);
  
  try {
    // Check if we're on the favorites page
    if (window.location.hash === '#favorites') {
      await showFavorites();
    } else {
      // Load some default recipes or recently viewed
      const defaultQuery = 'healthy';
      searchInput.value = defaultQuery;
      const recipes = await searchRecipes(defaultQuery);
      currentRecipes = recipes || [];
      displayRecipes(currentRecipes);
    }
  } catch (error) {
    showError('Failed to load recipes. Please try again later.');
    console.error('Initial load error:', error);
  } finally {
    showLoading(false);
  }
}

// Show favorites
async function showFavorites() {
  showLoading(true, 'Loading your favorite recipes...');
  isFavoriteView = true;
  
  try {
    const favorites = await getDetailedFavorites();
    currentRecipes = favorites;
    displayRecipes(favorites);
    
    // Update UI
    document.querySelector('h2').textContent = 'Your Favorite Recipes';
    searchInput.value = '';
    document.querySelector('.filters').style.display = 'none';
  } catch (error) {
    showError('Failed to load favorites. Please try again.');
    console.error('Favorites error:', error);
  } finally {
    showLoading(false);
  }
}

// Handle navigation
function handleNavClick(e) {
  e.preventDefault();
  const target = e.target.closest('a');
  
  if (!target) return;
  
  // Update active link
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
  target.classList.add('active');
  
  // Handle different navigation targets
  const href = target.getAttribute('href');
  
  if (href === '#favorites') {
    showFavorites();
  } else if (href === '#about') {
    // Show about page
    showAboutPage();
  } else {
    // Default to home
    window.location.hash = '';
    loadInitialRecipes();
  }
}

// Show about page
function showAboutPage() {
  resultsContainer.innerHTML = `
    <div class="about-page">
      <h2>About Recipe & Nutrition Finder</h2>
      <p>Find delicious and healthy recipes tailored to your dietary needs and preferences.</p>
      
      <div class="features">
        <div class="feature">
          <i class="fas fa-utensils"></i>
          <h3>Discover Recipes</h3>
          <p>Find thousands of recipes from around the world.</p>
        </div>
        <div class="feature">
          <i class="fas fa-heartbeat"></i>
          <h3>Nutrition Info</h3>
          <p>Get detailed nutritional information for every recipe.</p>
        </div>
        <div class="feature">
          <i class="fas fa-filter"></i>
          <h3>Smart Filters</h3>
          <p>Filter by dietary restrictions and preferences.</p>
        </div>
      </div>
      
      <div class="team">
        <h3>Our Team</h3>
        <p>Created with ❤️ by the Recipe Finder team.</p>
      </div>
    </div>
  `;
}

// Update active navigation link based on URL hash
function updateActiveLink() {
  const hash = window.location.hash || '#';
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}

// Show loading state
function showLoading(show, message = 'Loading...') {
  if (show) {
    loadingElement.style.display = 'flex';
    loadingElement.querySelector('p').textContent = message;
  } else {
    loadingElement.style.display = 'none';
  }
}

// Show error message
function showError(message) {
  noResultsElement.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Something went wrong</h3>
    <p>${message}</p>
    <button class="btn btn-primary" id="try-again-btn">Try Again</button>
  `;
  noResultsElement.style.display = 'block';
  // Remove any previous listeners to avoid stacking
  const tryAgainBtn = document.getElementById('try-again-btn');
  if (tryAgainBtn) {
    tryAgainBtn.onclick = () => window.location.reload();
  }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle window hash changes
window.addEventListener('hashchange', () => {
  updateActiveLink();
  
  if (window.location.hash === '#favorites') {
    showFavorites();
  } else if (window.location.hash === '#about') {
    showAboutPage();
  } else if (!window.location.hash) {
    loadInitialRecipes();
  }
});

// --- Service Worker Logic (inlined from sw.js) ---
if ('serviceWorker' in navigator) {
  // Service worker code as a string
  const swCode = `
    const CACHE_NAME = 'recipe-finder-v1';
    const ASSETS_TO_CACHE = [
      '/',
      '/index.html',
      '/src/styles/main.css',
      '/src/styles/desktop.css',
      '/src/modules/main.js',
      '/src/modules/api.js',
      '/src/modules/storage.js',
      '/src/assets/icons/logo.svg',
      '/src/assets/images/placeholder.jpg',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
    ];

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
          })
      );
    });

    self.addEventListener('activate', event => {
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
          );
        })
      );
    });

    self.addEventListener('fetch', event => {
      if (!event.request.url.startsWith(self.location.origin)) {
        return;
      }
      if (event.request.url.includes('/api/')) {
        event.respondWith(
          fetch(event.request)
            .then(response => {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
              return response;
            })
            .catch(() => caches.match(event.request))
        );
      } else {
        event.respondWith(
          caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) return cachedResponse;
              return fetch(event.request)
                .then(response => {
                  if (!response || response.status !== 200 || response.type !== 'basic') return response;
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
                  return response;
                });
            })
        );
      }
    });

    self.addEventListener('message', event => {
      if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        });
      }
    });

    self.addEventListener('sync', event => {
      if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
      }
    });

    async function syncFavorites() {
      // Placeholder for background sync logic
      console.log('Syncing favorites in the background...');
    }
  `;
  const swBlob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(swBlob);
  navigator.serviceWorker.register(swUrl)
    .then(reg => {
      console.log('Service worker registered (inlined)', reg);
    })
    .catch(err => {
      console.error('Service worker registration failed', err);
    });
}
// --- End Service Worker Logic ---
