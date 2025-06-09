// Recipe Card UI rendering
import { isFavorite } from '../modules/storage.js';

export function createRecipeCard(recipe) {
  const isFav = isFavorite(recipe.uri);
  const cookingTime = recipe.totalTime ? `${recipe.totalTime} min` : 'N/A';
  const servings = recipe.yield || 1;
  const calories = recipe.calories ? Math.round(recipe.calories / servings) : 'N/A';
  const protein = recipe.totalNutrients?.PROCNT ? Math.round(recipe.totalNutrients.PROCNT.quantity / servings) : 'N/A';
  const fat = recipe.totalNutrients?.FAT ? Math.round(recipe.totalNutrients.FAT.quantity / servings) : 'N/A';
  const carbs = recipe.totalNutrients?.CHOCDF ? Math.round(recipe.totalNutrients.CHOCDF.quantity / servings) : 'N/A';
  
  // Map diet and health labels to tag styles
  const mapTagToClass = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('high-protein')) return 'high-protein';
    if (tagLower.includes('low-carb')) return 'low-carb';
    if (tagLower.includes('gluten-free')) return 'gluten-free';
    if (tagLower.includes('balanced')) return 'balanced';
    if (tagLower.includes('high-fiber')) return 'high-fiber';
    if (tagLower.includes('pescatarian')) return 'pescatarian';
    if (tagLower.includes('vegetarian')) return 'vegetarian';
    return '';
  };
  
  const tags = [
    ...(recipe.dietLabels || []),
    ...(recipe.healthLabels || [])
  ].slice(0, 3);
  return `
    <article class="recipe-card" data-id="${recipe.uri}">
      <div class="recipe-image">
        <img src="${recipe.image || 'src/assets/images/placeholder.jpg'}" alt="${recipe.label}">
        <button class="btn-favorite${isFav ? ' active' : ''}" data-recipe-id="${recipe.uri}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="recipe-card-body">
        <h3 class="recipe-title">${recipe.label}</h3>
        <div class="recipe-meta">
          <span><i class="fas fa-clock"></i> ${cookingTime}</span>
          <span><i class="fas fa-utensils"></i> ${servings} ${servings === 1 ? 'serving' : 'servings'}</span>
        </div>
        <div class="recipe-tags">
          ${tags.map(t => `<span class="tag ${mapTagToClass(t)}">${t.replace(/-/g, ' ')}</span>`).join('')}
        </div>
      </div>
      <div class="recipe-nutrition">
        <div class="nutrition-item">
          <span class="nutrition-value">${calories}</span>
          <span class="nutrition-label">cal</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${protein}g</span>
          <span class="nutrition-label">Protein</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${fat}g</span>
          <span class="nutrition-label">Fat</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-value">${carbs}g</span>
          <span class="nutrition-label">Carbs</span>
        </div>
      </div>
      <a href="#" class="view-details-btn" data-recipe-id="${recipe.uri}">View Details</a>
    </article>
  `;
}
