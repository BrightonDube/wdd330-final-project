// Recipe Detail UI rendering
export function createRecipeDetailMarkup(recipe, nutrition, similarRecipes) {
  // Edamam vs Spoonacular detection
  const isEdamam = recipe.uri && recipe.uri.startsWith('http');
  const servings = recipe.yield || recipe.servings || 1;
  const image = recipe.image || 'src/assets/images/placeholder.jpg';
  const title = recipe.label || recipe.title || 'Recipe';
  const source = recipe.source || (recipe.creditsText || '');
  const url = recipe.url || recipe.sourceUrl || '';
  const calories = nutrition?.ENERC_KCAL?.quantity || nutrition?.calories || 'N/A';
  const protein = nutrition?.PROCNT?.quantity || nutrition?.protein || 'N/A';
  const fat = nutrition?.FAT?.quantity || nutrition?.fat || 'N/A';
  const carbs = nutrition?.CHOCDF?.quantity || nutrition?.carbs || 'N/A';
  const ingredientLines = recipe.ingredientLines || recipe.extendedIngredients?.map(i => i.original) || [];
  const tags = [
    ...(recipe.dietLabels || []),
    ...(recipe.healthLabels || []),
    ...(recipe.diets || []),
    ...(recipe.cuisines || [])
  ].slice(0, 4);

  return `
    <div class="recipe-detail-modal">
      <div class="recipe-detail-header">
        <img src="${image}" alt="${title}" class="recipe-detail-image">
        <h2 class="recipe-detail-title">${title}</h2>
        <div class="recipe-detail-meta">
          <span><i class="fas fa-user-friends"></i> ${servings} ${servings === 1 ? 'serving' : 'servings'}</span>
          ${source ? `<span><i class="fas fa-link"></i> ${source}</span>` : ''}
        </div>
        <div class="recipe-detail-tags">
          ${tags.map(t => `<span class="tag">${t.replace(/-/g, ' ')}</span>`).join('')}
        </div>
      </div>
      <div class="recipe-detail-body">
        <h3>Ingredients</h3>
        <ul class="ingredient-list">
          ${ingredientLines.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h3>Nutrition (per serving)</h3>
        <div class="recipe-nutrition">
          <div class="nutrition-item">
            <span class="nutrition-value">${Math.round(calories / servings)}</span>
            <span class="nutrition-label">Cal</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${Math.round(protein / servings)}</span>
            <span class="nutrition-label">Protein</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${Math.round(fat / servings)}</span>
            <span class="nutrition-label">Fat</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${Math.round(carbs / servings)}</span>
            <span class="nutrition-label">Carbs</span>
          </div>
        </div>
        <div class="recipe-detail-actions">
          ${url ? `<a href="${url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-external-link-alt"></i> View Full Recipe
          </a>` : ''}
        </div>
      </div>
    </div>
  `;
}
