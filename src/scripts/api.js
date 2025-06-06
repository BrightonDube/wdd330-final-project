// API Configuration
const API_KEYS = {
  EDA_APP_ID: 'YOUR_EDAMAM_APP_ID',
  EDA_APP_KEY: 'YOUR_EDAMAM_APP_KEY',
  NUTRIX_APP_ID: 'YOUR_NUTRITIONIX_APP_ID',
  NUTRIX_APP_KEY: 'YOUR_NUTRITIONIX_APP_KEY'
};

// Base URLs
const API_ENDPOINTS = {
  EDA_SEARCH: 'https://api.edamam.com/search',
  EDA_NUTRITION: 'https://api.edamam.com/api/nutrition-data',
  NUTRIX_NUTRITION: 'https://trackapi.nutritionix.com/v2/natural/nutrients'
};

/**
 * Search for recipes using Edamam API
 * @param {string} query - Search query
 * @param {Object} options - Additional options like diet, health, etc.
 * @returns {Promise} - Promise with recipe search results
 */
export const searchRecipes = async (query, options = {}) => {
  try {
    const { diet = '', health = '', calories = '', time = '' } = options;
    
    const params = new URLSearchParams({
      q: query,
      app_id: API_KEYS.EDA_APP_ID,
      app_key: API_KEYS.EDA_APP_KEY,
      from: 0,
      to: 20,
      ...(diet && { diet }),
      ...(health && { health }),
      ...(calories && { calories }),
      ...(time && { time })
    });

    const response = await fetch(`${API_ENDPOINTS.EDA_SEARCH}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    
    const data = await response.json();
    return data.hits.map(hit => hit.recipe);
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Get detailed nutrition information for a recipe
 * @param {Object} recipe - Recipe object containing ingredients and other details
 * @returns {Promise} - Promise with nutrition data
 */
export const getRecipeNutrition = async (recipe) => {
  try {
    // First try Edamam's nutrition API
    const edamamParams = new URLSearchParams({
      app_id: API_KEYS.EDA_APP_ID,
      app_key: API_KEYS.EDA_APP_KEY,
      ingr: recipe.ingredients.map(ing => ing.text).join('\n')
    });

    const response = await fetch(`${API_ENDPOINTS.EDA_NUTRITION}?${edamamParams}`);
    
    if (response.ok) {
      return await response.json();
    }
    
    // Fallback to Nutritionix if Edamam fails
    const nutritionixResponse = await fetch(API_ENDPOINTS.NUTRIX_NUTRITION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': API_KEYS.NUTRIX_APP_ID,
        'x-app-key': API_KEYS.NUTRIX_APP_KEY,
        'x-remote-user-id': '0'
      },
      body: JSON.stringify({
        query: recipe.ingredients.map(ing => ing.text).join(', ')
      })
    });
    
    if (!nutritionixResponse.ok) {
      throw new Error('Failed to fetch nutrition data');
    }
    
    return await nutritionixResponse.json();
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    throw error;
  }
};

/**
 * Get recipe by ID (using Edamam's URI)
 * @param {string} uri - Recipe URI
 * @returns {Promise} - Promise with recipe details
 */
export const getRecipeById = async (uri) => {
  try {
    const encodedUri = encodeURIComponent(uri);
    const response = await fetch(`${API_ENDPOINTS.EDA_SEARCH}?r=${encodedUri}&app_id=${API_KEYS.EDA_APP_ID}&app_key=${API_KEYS.EDA_APP_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data[0] : null;
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    throw error;
  }
};

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
