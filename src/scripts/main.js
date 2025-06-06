// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsSection = document.getElementById('results');

    // Add event listener to search button
    searchButton.addEventListener('click', performSearch);
    
    // Also listen for Enter key in the search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Function to handle search
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            alert('Please enter a search term');
            return;
        }
        
        // For now, just display a message
        resultsSection.innerHTML = `<p>Searching for: ${searchTerm}</p>`;
        
        // TODO: Add actual API call here
        console.log('Searching for:', searchTerm);
    }

    // Function to display results (will be used later)
    function displayResults(recipes) {
        // This will be implemented when we have the API working
        console.log('Displaying results:', recipes);
    }
});
