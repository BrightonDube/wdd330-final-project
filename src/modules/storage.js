// Local Storage Keys
const STORAGE_KEYS = {
  FAVORITES: 'recipe_finder_favorites'
};

/**
 * Get all favorite recipes from local storage
 * @returns {Array} - Array of favorite recipes
 */
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites from storage:', error);
    return [];
  }
};

/**
 * Save a recipe to favorites
 * @param {Object} recipe - Recipe to save
 * @returns {boolean} - True if successful, false otherwise
 */
export const addToFavorites = (recipe) => {
  try {
    if (!recipe || !recipe.uri) return false;
    
    const favorites = getFavorites();
    
    // Check if recipe already exists in favorites
    const exists = favorites.some(fav => fav.uri === recipe.uri);
    if (exists) return true; // Already in favorites
    
    // Add to favorites
    favorites.push({
      uri: recipe.uri,
      label: recipe.label,
      image: recipe.image,
      source: recipe.source,
      url: recipe.url,
      yield: recipe.yield,
      calories: recipe.calories,
      totalTime: recipe.totalTime,
      addedAt: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

/**
 * Remove a recipe from favorites
 * @param {string} recipeUri - URI of the recipe to remove
 * @returns {boolean} - True if successful, false otherwise
 */
export const removeFromFavorites = (recipeUri) => {
  try {
    let favorites = getFavorites();
    const initialLength = favorites.length;
    
    // Filter out the recipe
    favorites = favorites.filter(fav => fav.uri !== recipeUri);
    
    // If length changed, save the updated list
    if (favorites.length !== initialLength) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

/**
 * Check if a recipe is in favorites
 * @param {string} recipeUri - URI of the recipe to check
 * @returns {boolean} - True if recipe is in favorites
 */
export const isFavorite = (recipeUri) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.uri === recipeUri);
};

/**
 * Toggle favorite status of a recipe
 * @param {Object} recipe - Recipe to toggle
 * @returns {boolean} - New favorite status (true if now favorited, false if removed)
 */
export const toggleFavorite = (recipe) => {
  if (!recipe || !recipe.uri) return false;
  
  if (isFavorite(recipe.uri)) {
    removeFromFavorites(recipe.uri);
    return false;
  } else {
    addToFavorites(recipe);
    return true;
  }
};

/**
 * Clear all favorites from local storage
 * @returns {boolean} - True if successful
 */
export const clearFavorites = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};

/**
 * Get favorite recipes with additional details
 * @returns {Promise<Array>} - Promise with detailed favorite recipes
 */
export const getDetailedFavorites = async () => {
  try {
    const favorites = getFavorites();
    const { getEdamamRecipeById } = await import('./api.js');
    // Only fetch details for Edamam recipes (uri starts with http)
    const detailedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        if (fav.uri && fav.uri.startsWith('http')) {
          try {
            const fullRecipe = await getEdamamRecipeById(fav.uri);
            return { ...fav, ...fullRecipe };
          } catch (error) {
            console.error(`Error fetching details for ${fav.uri}:`, error);
            return fav;
          }
        } else {
          // For Spoonacular or others, just return the stored info
          return fav;
        }
      })
    );
    return detailedFavorites;
  } catch (error) {
    console.error('Error getting detailed favorites:', error);
    return [];
  }
};
