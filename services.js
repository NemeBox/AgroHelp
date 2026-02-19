document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('all-services-grid');

    if (!gridContainer) {
        console.error('AgroHelp: The main service grid container with id "all-services-grid" was not found.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:4000/api/products/public');
        const services = await response.json();

        if (!response.ok) {
            throw new Error(services.error || 'Failed to fetch services.');
        }

        if (services.length === 0) {
            gridContainer.innerHTML = `<p class="no-services-message">No services are available at the moment. Please check back later!</p>`;
            return;
        }

        // Clear any existing content and populate with fetched services
        gridContainer.innerHTML = '';
        services.forEach(service => {
            const serviceCardHTML = createServiceCard(service);
            gridContainer.innerHTML += serviceCardHTML;
        });

        // Add event listener for details buttons using event delegation
        gridContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('view-details-btn')) {
                const button = event.target;
                const cardBody = button.closest('.card-body');
                const stockInfo = cardBody.querySelector('.card-stock');
                const description = cardBody.querySelector('.card-description');

                const isDetailsVisible = description.style.display === 'block';

                if (isDetailsVisible) {
                    description.style.display = 'none';
                    stockInfo.style.display = 'block';
                    button.textContent = 'View Details';
                } else {
                    description.style.display = 'block';
                    stockInfo.style.display = 'none';
                    button.textContent = 'Hide Details';
                }
            }
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        gridContainer.innerHTML = `<p class="no-services-message">Could not load services. Please try again later.</p>`;
    }
});

function createServiceCard(service) {
    // Default image if none is provided in the future
    const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';

    // This function creates the HTML for a single service card.
    return `
        <div class="service-card">
            <div class="card-img-wrapper">
                <img src="${imageUrl}" alt="${service.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">Category: ${service.category}</p>
                <p class="card-stock" style="flex-grow: 1; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;">Available Stock: ${service.stock}</p>
                <div class="card-description" style="display: none;">
                    <h4>Details</h4>
                    <p>${service.description || 'No description provided.'}</p>
                </div>
                <div class="card-footer">
                    <span class="card-price">₹${parseFloat(service.price).toFixed(2)}</span>
                    <button type="button" class="cta-btn-small view-details-btn">View Details</button>
                </div>
            </div>
        </div>
    `;
}