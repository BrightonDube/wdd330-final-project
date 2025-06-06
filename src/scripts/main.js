// Wait for the DOM to be fully loaded
import { searchRecipes, getRecipeNutrition, getRecipeById, getSimilarRecipes } from './api.js';
import { toggleFavorite, isFavorite, getDetailedFavorites } from './storage.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
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
function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    noResultsElement.style.display = 'block';
    resultsContainer.innerHTML = '';
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
}

// Create a recipe card element
function createRecipeCard(recipe) {
  const isFav = isFavorite(recipe.uri);
  const cookingTime = recipe.totalTime ? `${recipe.totalTime} min` : 'N/A';
  const calories = recipe.calories ? Math.round(recipe.calories / recipe.yield) : 'N/A';
  
  return `
    <article class="recipe-card" data-id="${recipe.uri}">
      <div class="recipe-image">
        <img src="${recipe.image || 'src/assets/images/placeholder.jpg'}" alt="${recipe.label}">
        <button class="btn-favorite ${isFav ? 'active' : ''}" data-recipe-id="${recipe.uri}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        </button>
        ${recipe.healthLabels?.includes('VEGETARIAN') ? '<span class="recipe-badge">Vegetarian</span>' : ''}
      </div>
      <div class="recipe-content">
        <div class="recipe-header">
          <h3 class="recipe-title">${recipe.label}</h3>
          <div class="recipe-meta">
            <span><i class="fas fa-clock"></i> ${cookingTime}</span>
            <span><i class="fas fa-fire"></i> ${calories} cal</span>
            <span><i class="fas fa-utensils"></i> ${recipe.yield || 1} ${recipe.yield === 1 ? 'serving' : 'servings'}</span>
          </div>
        </div>
        <div class="recipe-actions">
          <a href="${recipe.url}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">View Recipe</a>
          <button class="btn-favorite ${isFav ? 'active' : ''}" data-recipe-id="${recipe.uri}">
            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

// Show recipe details in modal
async function showRecipeDetails(recipe) {
  showLoading(true, 'Loading recipe details...');
  
  try {
    // Get full recipe details
    const fullRecipe = await getRecipeById(recipe.uri);
    const nutrition = await getRecipeNutrition(fullRecipe);
    const similarRecipes = await getSimilarRecipes(fullRecipe);
    
    // Create modal content
    modalContent.innerHTML = createRecipeDetailMarkup(fullRecipe, nutrition, similarRecipes);
    
    // Show the modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Add event listeners for the new elements
    setupRecipeDetailListeners(fullRecipe);
  } catch (error) {
    console.error('Error showing recipe details:', error);
    showError('Failed to load recipe details. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Create HTML for recipe details
function createRecipeDetailMarkup(recipe, nutrition, similarRecipes) {
  const isFav = isFavorite(recipe.uri);
  
  return `
    <div class="recipe-detail">
      <!-- Recipe Header -->
      <div class="recipe-detail-header">
        <h2>${recipe.label}</h2>
        <p class="recipe-source">Source: ${recipe.source}</p>
        <div class="recipe-meta">
          <span><i class="fas fa-clock"></i> ${recipe.totalTime || 'N/A'} min</span>
          <span><i class="fas fa-utensils"></i> ${recipe.yield || 1} ${recipe.yield === 1 ? 'serving' : 'servings'}</span>
          <span><i class="fas fa-fire"></i> ${Math.round(recipe.calories / recipe.yield)} cal/serving</span>
          <button class="btn-favorite ${isFav ? 'active' : ''}" data-recipe-id="${recipe.uri}">
            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            ${isFav ? 'Saved' : 'Save Recipe'}
          </button>
        </div>
      </div>
      
      <div class="recipe-detail-content">
        <!-- Recipe Image and Summary -->
        <div class="recipe-summary">
          <div class="recipe-image-large">
            <img src="${recipe.image}" alt="${recipe.label}">
          </div>
          
          <!-- Health Labels -->
          ${recipe.healthLabels?.length ? `
            <div class="recipe-tags">
              ${recipe.healthLabels.slice(0, 5).map(label => `
                <span class="tag">${label}</span>
              `).join('')}
            </div>
          ` : ''}
          
          <!-- Nutrition Summary -->
          ${nutrition ? `
            <div class="nutrition-summary">
              <h3>Nutrition per serving</h3>
              <div class="nutrition-grid">
                <div class="nutrition-item">
                  <span class="nutrition-value">${Math.round(nutrition.calories / recipe.yield)}</span>
                  <span class="nutrition-label">Calories</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">${Math.round(nutrition.totalNutrients.PROCNT.quantity / recipe.yield)}g</span>
                  <span class="nutrition-label">Protein</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">${Math.round(nutrition.totalNutrients.FAT.quantity / recipe.yield)}g</span>
                  <span class="nutrition-label">Fat</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">${Math.round(nutrition.totalNutrients.CHOCDF.quantity / recipe.yield)}g</span>
                  <span class="nutrition-label">Carbs</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Ingredients and Instructions -->
        <div class="recipe-detail-main">
          <!-- Ingredients -->
          <div class="ingredients-section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
              ${recipe.ingredientLines.map(ingredient => `
                <li>${ingredient}</li>
              `).join('')}
            </ul>
            
            <button class="btn btn-primary" id="addToShoppingList">
              <i class="fas fa-shopping-cart"></i> Add to Shopping List
            </button>
          </div>
          
          <!-- Instructions -->
          <div class="instructions-section">
            <h3>Instructions</h3>
            ${recipe.url ? `
              <p>For detailed instructions, please visit the <a href="${recipe.url}" target="_blank" rel="noopener noreferrer">original recipe</a>.</p>
            ` : '<p>No instructions available.</p>'}
            
            ${recipe.shareAs ? `
              <div class="recipe-actions">
                <a href="${recipe.url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  <i class="fas fa-external-link-alt"></i> View Full Recipe
                </a>
                <button class="btn btn-secondary" id="printRecipe">
                  <i class="fas fa-print"></i> Print Recipe
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Similar Recipes -->
      ${similarRecipes?.length ? `
        <div class="similar-recipes">
          <h3>You Might Also Like</h3>
          <div class="recipe-grid">
            ${similarRecipes.slice(0, 3).map(recipe => createRecipeCard(recipe)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Setup event listeners for recipe detail page
function setupRecipeDetailListeners(recipe) {
  // Favorite button
  const favButton = document.querySelector('.recipe-detail .btn-favorite');
  if (favButton) {
    favButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const newFavState = toggleFavorite(recipe);
      updateFavoriteButton(favButton, newFavState);
    });
  }
  
  // Print button
  const printButton = document.getElementById('printRecipe');
  if (printButton) {
    printButton.addEventListener('click', () => window.print());
  }
  
  // Add to shopping list
  const addToListButton = document.getElementById('addToShoppingList');
  if (addToListButton) {
    addToListButton.addEventListener('click', () => addToShoppingList(recipe));
  }
  
  // Similar recipes
  document.querySelectorAll('.similar-recipes .recipe-card').forEach((card, index) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      closeRecipeModal();
      showRecipeDetails(recipe);
    });
  });
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
    <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
  `;
  noResultsElement.style.display = 'block';
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
