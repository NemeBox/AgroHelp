document.addEventListener('DOMContentLoaded', () => {
    const services = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const gridContainer = document.getElementById('all-services-grid');

    if (!gridContainer) {
        console.error('AgroHelp: The main service grid container with id "all-services-grid" was not found.');
        return;
    }

    if (services.length === 0) {
        gridContainer.innerHTML = `<p class="no-services-message">No services are available at the moment. Please check back later!</p>`;
        return;
    }

    // Populate services
    services.forEach(service => {
        const serviceCardHTML = createServiceCard(service);
        gridContainer.innerHTML += serviceCardHTML;
    });
});

function createServiceCard(service) {
    // This function creates the HTML for a single service card.
    return `
        <div class="service-card">
            <div class="card-img-wrapper">
                <img src="${service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600'}" alt="${service.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">By: ${service.providerName || 'AgroHelp'}</p>
                <p class="card-description">${service.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">$${parseFloat(service.price).toFixed(2)}</span>
                    <a href="#" class="cta-btn-small">View Details</a>
                </div>
            </div>
        </div>
    `;
}