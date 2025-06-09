// Filter Dropdown Component
export function initializeFilters() {
  const filterBtn = document.getElementById('filterBtn');
  const filterDropdown = document.getElementById('filterDropdown');
  const filterOptions = document.querySelectorAll('.filter-option input');
  
  // Toggle filter dropdown visibility
  if (filterBtn && filterDropdown) {
    filterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = filterDropdown.hasAttribute('hidden');
      if (isHidden) {
        filterDropdown.removeAttribute('hidden');
        filterBtn.classList.add('active');
      } else {
        filterDropdown.setAttribute('hidden', '');
        filterBtn.classList.remove('active');
      }
      e.stopPropagation(); // Prevent outside click from immediately closing
    });

    // Close dropdown when clicking outside, but only if open
    document.addEventListener('click', (e) => {
      if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target) && !filterDropdown.hasAttribute('hidden')) {
        filterDropdown.setAttribute('hidden', '');
        filterBtn.classList.remove('active');
      }
    });
  }
  
  // Handle filter checkboxes
  if (filterOptions) {
    filterOptions.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        applyFilters();
      });
    });
  }
}

// Apply selected filters to recipe cards
export function applyFilters() {
  const selectedFilters = Array.from(document.querySelectorAll('.filter-option input:checked'))
    .map(checkbox => checkbox.dataset.filter);
  
  // Filter the recipe cards based on selected filters
  const recipeCards = document.querySelectorAll('.recipe-card');
  let visibleCount = 0;
  
  recipeCards.forEach(card => {
    const tags = Array.from(card.querySelectorAll('.tag'))
      .map(tag => tag.textContent.toLowerCase().trim());
    
    // Show card if no filters are selected or if it matches at least one filter
    const shouldShow = selectedFilters.length === 0 || 
      selectedFilters.some(filter => tags.some(tag => tag.includes(filter)));
    
    card.style.display = shouldShow ? '' : 'none';
    if (shouldShow) visibleCount++;
  });
  
  // Update recipe count display
  if (typeof updateRecipeCount === 'function') {
    updateRecipeCount(visibleCount);
  } else {
    const recipeCount = document.getElementById('recipe-count');
    if (recipeCount) {
      recipeCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'recipe' : 'recipes'} found`;
      recipeCount.style.display = '';
    }
  }
}
