document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('hero-search-input');
    const searchButton = document.getElementById('hero-search-btn');

    if (searchButton && searchInput) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to services page with the search query
                window.location.href = `service.html?q=${encodeURIComponent(query)}`;
            } else {
                // If search is empty, just go to the services page
                window.location.href = 'service.html';
            }
        };

        searchButton.addEventListener('click', performSearch);

        // Allow searching by pressing Enter
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
});