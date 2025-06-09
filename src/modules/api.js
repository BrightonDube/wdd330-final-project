// API Configuration

// SPOONACULAR API
const SPOONACULAR_API_KEY = 'd74be1d78648485ba6d5227c23197343'; // <-- replace with your actual key
const SPOONACULAR_API_BASE = 'https://api.spoonacular.com';

// EDAMAM API (Meal Planner Plan)
// Only the /search endpoint is allowed on this plan.
// Do NOT use nutrition-details, food database, or POST endpoints for Edamam.
// Nutrition info is available in each recipe result as calories, protein, fat, carbs, etc.

const EDA_APP_ID = '899be8e2';
const EDA_APP_KEY = '2f7eb6e7759383d7a555802683bdc917';
const EDA_SEARCH_URL = 'https://api.edamam.com/search';

// --- Edamam Functions (ONLY /search endpoint) ---
// Allowed: /search endpoint only (Meal Planner Plan)
export async function searchEdamamRecipes(query, options = {}) {
  const { diet = '', health = '', calories = '', time = '', mealType = '', cuisineType = '', from = 0, to = 20 } = options;
  const params = new URLSearchParams({
    q: query,
    app_id: EDA_APP_ID,
    app_key: EDA_APP_KEY,
    from,
    to,
    ...(diet && { diet }),
    ...(health && { health }),
    ...(calories && { calories }),
    ...(time && { time }),
    ...(mealType && { mealType }),
    ...(cuisineType && { cuisineType })
  });
  const response = await fetch(`${EDA_SEARCH_URL}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch recipes from Edamam');
  const data = await response.json();
  return data.hits.map(hit => hit.recipe);
}

export async function getEdamamRecipeById(uri) {
  // This uses the /search endpoint with ?r=... to get a single recipe by URI
  const encodedUri = encodeURIComponent(uri);
  const response = await fetch(`${EDA_SEARCH_URL}?r=${encodedUri}&app_id=${EDA_APP_ID}&app_key=${EDA_APP_KEY}`);
  if (!response.ok) throw new Error('Failed to fetch recipe from Edamam');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : null;
}
// --- END Edamam Functions ---

// --- Spoonacular Functions (ONLY allowed endpoints) ---
// Only these endpoints are allowed:
// 1. GET /recipes/complexSearch (with addRecipeInformation=true)
// 2. GET /recipes/{id}/nutritionWidget.json

export async function searchSpoonacularRecipes(query, options = {}) {
  const { diet = '', cuisine = '', number = 10 } = options;
  const params = new URLSearchParams({
    query,
    number,
    addRecipeInformation: 'true',
    apiKey: SPOONACULAR_API_KEY,
    ...(diet && { diet }),
    ...(cuisine && { cuisine })
  });
  const response = await fetch(`${SPOONACULAR_API_BASE}/recipes/complexSearch?${params}`);
  if (!response.ok) throw new Error('Failed to fetch recipes from Spoonacular');
  const data = await response.json();
  return data.results;
}

export async function getSpoonacularRecipeNutrition(id) {
  // Only allowed nutrition endpoint
  const url = `${SPOONACULAR_API_BASE}/recipes/${id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch nutrition from Spoonacular');
  return await response.json();
}
// --- END Spoonacular Functions ---

// Do NOT use /information, /analyze, /guess, or any other endpoints for Spoonacular

// WARNING: Do not hardcode API keys in production. Use environment variables or secure storage.

// --- Edamam Functions (ONLY /search endpoint) ---
// Allowed: /search endpoint only (Meal Planner Plan)
export async function searchEdamamRecipes(query, options = {}) {
  const { diet = '', health = '', calories = '', time = '', mealType = '', cuisineType = '', from = 0, to = 20 } = options;
  const params = new URLSearchParams({
    q: query,
    app_id: EDA_APP_ID,
    app_key: EDA_APP_KEY,
    from,
    to,
    ...(diet && { diet }),
    ...(health && { health }),
    ...(calories && { calories }),
    ...(time && { time }),
    ...(mealType && { mealType }),
    ...(cuisineType && { cuisineType })
  });
  const response = await fetch(`${EDA_SEARCH_URL}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch recipes from Edamam');
  const data = await response.json();
  return data.hits.map(hit => hit.recipe);
}

export async function getEdamamRecipeById(uri) {
  // This uses the /search endpoint with ?r=... to get a single recipe by URI
  const encodedUri = encodeURIComponent(uri);
  const response = await fetch(`${EDA_SEARCH_URL}?r=${encodedUri}&app_id=${EDA_APP_ID}&app_key=${EDA_APP_KEY}`);
  if (!response.ok) throw new Error('Failed to fetch recipe from Edamam');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : null;
}
// --- END Edamam Functions ---

// --- Spoonacular Functions (ONLY allowed endpoints) ---
// Only these endpoints are allowed:
// 1. GET /recipes/complexSearch (with addRecipeInformation=true)
// 2. GET /recipes/{id}/nutritionWidget.json

export async function searchSpoonacularRecipes(query, options = {}) {
  const { diet = '', cuisine = '', number = 10 } = options;
  const params = new URLSearchParams({
    query,
    number,
    addRecipeInformation: 'true',
    apiKey: SPOONACULAR_API_KEY,
    ...(diet && { diet }),
    ...(cuisine && { cuisine })
  });
  const response = await fetch(`${SPOONACULAR_API_BASE}/recipes/complexSearch?${params}`);
  if (!response.ok) throw new Error('Failed to fetch recipes from Spoonacular');
  const data = await response.json();
  return data.results;
}

export async function getSpoonacularRecipeNutrition(id) {
  // Only allowed nutrition endpoint
  const url = `${SPOONACULAR_API_BASE}/recipes/${id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch nutrition from Spoonacular');
  return await response.json();
}
// --- END Spoonacular Functions ---

/**
 * Get similar recipes based on a recipe (Edamam only)
 * @param {Object} recipe - Base recipe
 * @returns {Promise} - Promise with similar recipes
 */
export async function getSimilarRecipes(recipe) {
  try {
    // Extract key ingredients for similar recipes
    const mainIngredients = recipe.ingredientLines
      .slice(0, 3)
      .map(ing => ing.split(' ').slice(0, 2).join(' '))
      .join(' ');
    return searchEdamamRecipes(mainIngredients, {
      diet: recipe.dietLabels[0] || '',
      health: recipe.healthLabels[0] || ''
    });
  } catch (error) {
    console.error('Error finding similar recipes:', error);
    throw error;
  }
}

/**
 * Get similar recipes based on a recipe
 * @param {Object} recipe - Base recipe
 * @returns {Promise} - Promise with similar recipes
 */
export const getSimilarRecipes = async (recipe) => {
  try {
    // Extract key ingredients for similar recipes
    const mainIngredients = recipe.ingredientLines
      .slice(0, 3)
      .map(ing => ing.split(' ').slice(0, 2).join(' '))
      .join(' ');
    
    return searchRecipes(mainIngredients, {
      diet: recipe.dietLabels[0] || '',
      health: recipe.healthLabels[0] || ''
    });
  } catch (error) {
    console.error('Error finding similar recipes:', error);
    throw error;
  }
};
