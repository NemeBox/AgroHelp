document.addEventListener('DOMContentLoaded', async () => {
    const servicesGrid = document.getElementById('services-grid');
    const searchInput = document.getElementById('services-search-input');
    const searchButton = document.getElementById('services-search-btn');

    if (!servicesGrid) {
        console.error('AgroHelp: The services grid element with id "services-grid" was not found.');
        return;
    }

    // Function to fetch and render services based on a query
    const loadServices = async (query = '') => {
        servicesGrid.innerHTML = '<p class="no-services-message">Loading available services...</p>';
        try {
            const url = query ? `/api/services?q=${encodeURIComponent(query)}` : '/api/services';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch services from the server.');
            }
            const services = await response.json();

            if (services.length === 0) {
                if (query) {
                    servicesGrid.innerHTML = `<p class="no-services-message">No services found for "${query}". Please try a different search.</p>`;
                } else {
                    servicesGrid.innerHTML = '<p class="no-services-message">No services are available at the moment. Please check back later.</p>';
                }
            } else {
                servicesGrid.innerHTML = ''; // Clear the loading message
                services.forEach(service => {
                    const serviceCardHTML = createPublicServiceCard(service);
                    servicesGrid.insertAdjacentHTML('beforeend', serviceCardHTML);
                });
            }
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = '<p class="no-services-message" style="color: var(--error-red);">Could not load services. Please check your network connection and try again.</p>';
        }
    };

    // Initial load: Check for a query from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }
    await loadServices(initialQuery || '');

    // Handle search functionality on the services page itself
    if (searchInput && searchButton) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            // Update URL for shareability, without reloading the page
            const newUrl = query ? `${window.location.pathname}?q=${encodeURIComponent(query)}` : window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);
            // Fetch and display filtered services
            loadServices(query);
        };

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
});

function createPublicServiceCard(service) {
    const serviceId = service._id; // Use MongoDB's _id

    return `
        <div class="service-card">
            <div class="card-icon-wrapper">
                <i class="${service.icon || 'fa-solid fa-gear'}"></i>
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">Provider: ${service.providerId ? service.providerId.name : 'N/A'}</p>
                <p class="card-description">${service.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">₹${parseFloat(service.price).toFixed(2)}</span>
                    ${
                        service.providerId
                            ? `<a href="booking.html?serviceId=${serviceId}" class="cta-btn-small">Book Now</a>`
                            : `<span class="cta-btn-small disabled" title="This service cannot be booked as the provider is not available.">Unavailable</span>`
                    }
                </div>
            </div>
        </div>
    `;
}