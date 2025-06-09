// Loading and error UI
export function showLoading(show, message = 'Loading...') {
  const loadingElement = document.getElementById('loading');
  if (!loadingElement) return;
  loadingElement.style.display = show ? 'flex' : 'none';
  loadingElement.querySelector('p').textContent = message;
}

export function showError(message) {
  const noResultsElement = document.getElementById('no-results');
  if (!noResultsElement) return;
  noResultsElement.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Something went wrong</h3>
    <p>${message}</p>
    <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
  `;
  noResultsElement.style.display = 'block';
}
