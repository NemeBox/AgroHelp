document.addEventListener('DOMContentLoaded', async () => {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) {
        console.error('AgroHelp: The services grid element with id "services-grid" was not found.');
        return;
    }

    // Display a loading message while fetching data
    servicesGrid.innerHTML = '<p class="no-services-message">Loading available services...</p>';

    try {
        // Fetch all public services from the backend API
        const response = await fetch('/api/services');
        if (!response.ok) {
            throw new Error('Failed to fetch services from the server.');
        }
        const services = await response.json();

        if (services.length === 0) {
            servicesGrid.innerHTML = '<p class="no-services-message">No services are available at the moment. Please check back later.</p>';
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
});

function createPublicServiceCard(service) {
    const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';
    const serviceId = service._id; // Use MongoDB's _id

    return `
        <div class="service-card">
            <div class="card-img-wrapper">
                <img src="${imageUrl}" alt="${service.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">Provider: ${service.providerName}</p>
                <p class="card-description">${service.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">₹${parseFloat(service.price).toFixed(2)}</span>
                    <a href="booking.html?serviceId=${serviceId}" class="cta-btn-small">Book Now</a>
                </div>
            </div>
        </div>
    `;
}