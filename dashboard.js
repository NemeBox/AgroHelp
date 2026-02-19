document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const gridContainer = document.getElementById('my-services-grid');
    const authMessage = document.getElementById('auth-check-message');

    if (!token || userRole !== 'expert') {
        gridContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a service provider to view this page.</p>
            <a href="auth_pro.html" class="cta-btn">Login as Provider</a>
        `;
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const services = await response.json();

        if (!response.ok) {
            throw new Error(services.error || 'Failed to fetch your services.');
        }

        if (services.length === 0) {
            gridContainer.innerHTML = `<p class="no-services-message">You have not created any services yet. <a href="create-service.html">Create one now!</a></p>`;
            return;
        }

        gridContainer.innerHTML = '';
        services.forEach(service => {
            const serviceCardHTML = createDashboardServiceCard(service);
            gridContainer.innerHTML += serviceCardHTML;
        });

    } catch (error) {
        console.error('Error fetching services:', error);
        gridContainer.innerHTML = `<p class="no-services-message">Could not load your services. Please try again later.</p>`;
    }
});

function createDashboardServiceCard(service) {
    const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';

    return `
        <div class="service-card">
            <div class="card-img-wrapper">
                <img src="${imageUrl}" alt="${service.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">Category: ${service.category}</p>
                <p class="card-description">${service.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">₹${parseFloat(service.price).toFixed(2)}</span>
                    <div>
                        <a href="edit-service.html?id=${service._id}" class="cta-btn-small">Edit / View</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}