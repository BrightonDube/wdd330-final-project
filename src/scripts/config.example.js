/**
 * Configuration file for API keys and other settings.
 * Rename this file to 'config.js' and replace the placeholder values with your actual API keys.
 */

const CONFIG = {
  // Edamam API credentials
  EDA_APP_ID: 'YOUR_EDAMAM_APP_ID',
  EDA_APP_KEY: 'YOUR_EDAMAM_APP_KEY',
  
  // Nutritionix API credentials
  NUTRIX_APP_ID: 'YOUR_NUTRITIONIX_APP_ID',
  NUTRIX_APP_KEY: 'YOUR_NUTRITIONIX_APP_KEY',
  
  // API endpoints
  API_ENDPOINTS: {
    EDA_SEARCH: 'https://api.edamam.com/search',
    EDA_NUTRITION: 'https://api.edamam.com/api/nutrition-data',
    NUTRIX_NUTRITION: 'https://trackapi.nutritionix.com/v2/natural/nutrients'
  },
  
  // Default search parameters
  DEFAULTS: {
    SEARCH_QUERY: 'healthy',
    SEARCH_LIMIT: 20,
    NUTRITION_SERVING: 1 // Default number of servings for nutrition info
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    FAVORITES: 'recipe_finder_favorites',
    RECENT_SEARCHES: 'recipe_finder_recent_searches',
    SHOPPING_LIST: 'recipe_finder_shopping_list'
  }
};

export default CONFIG;
