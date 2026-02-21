document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.getElementById('services-grid'); // Assuming this ID exists in services.html
    if (!servicesGrid) {
        console.error("AgroHelp: Element with ID 'services-grid' not found.");
        return;
    }

    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const currentUserRole = localStorage.getItem('agrohelp_user_role');
    const currentUserId = localStorage.getItem('agrohelp_user_id');

    if (allServices.length === 0) {
        servicesGrid.innerHTML = `<p class="no-services-message">No services are available at the moment. Please check back later.</p>`;
        return;
    }

    servicesGrid.innerHTML = '';
    allServices.forEach(service => {
        const serviceCard = createServiceCard(service, currentUserRole, currentUserId);
        servicesGrid.insertAdjacentHTML('beforeend', serviceCard);
    });
});

function createServiceCard(service, userRole, userId) {
    const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';
    
    let actionButton = '';
    // Show "Book Now" button only to 'customer' role
    // And don't show it if the customer is the provider of the service
    if (userRole === 'customer' && service.providerId !== userId) {
        actionButton = `<a href="booking.html?serviceId=${service.id}" class="cta-btn-small">Book Now</a>`;
    } else if (!userRole) {
        // If user is not logged in, prompt to login
        actionButton = `<a href="auth_cus.html" class="cta-btn-small">Login to Book</a>`;
    } else if (service.providerId === userId) {
        // If the user is the provider of this service
        actionButton = `<span class="cta-btn-small" style="background-color: #aaa; cursor: default;">Your Service</span>`;
    }

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
                    ${actionButton}
                </div>
            </div>
        </div>
    `;
}