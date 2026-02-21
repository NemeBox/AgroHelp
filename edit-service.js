document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-service-form');
    const formContainer = document.getElementById('service-form-container');
    const authMessage = document.getElementById('auth-check-message');
    const deleteBtn = document.getElementById('delete-service-btn');

    if (!form || !formContainer || !authMessage || !deleteBtn) {
        console.error('AgroHelp: Missing critical elements on the edit page.');
        return;
    }

    // 1. Authentication Check
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userId = localStorage.getItem('agrohelp_user_id');

    if (!token || userRole !== 'provider') {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a service provider to edit a service.</p>
            <a href="auth_pro.html" class="cta-btn">Login as Provider</a>
        `;
        return;
    }

    // 2. Get serviceId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        formContainer.innerHTML = '<p class="no-services-message">No service ID provided. Cannot edit.</p>';
        return;
    }

    // 3. Fetch service and check ownership
    let allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const serviceToEdit = allServices.find(s => s.id === serviceId);

    if (!serviceToEdit) {
        formContainer.innerHTML = '<p class="no-services-message">Service not found.</p>';
        return;
    }

    // 4. Security check: Ensure the logged-in provider owns this service
    if (serviceToEdit.providerId !== userId) {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You do not have permission to edit this service.</p>
            <a href="dashboard.html" class="cta-btn">Back to Dashboard</a>
        `;
        return;
    }

    // 5. Populate form with existing data
    form.elements['name'].value = serviceToEdit.name || '';
    form.elements['category'].value = serviceToEdit.category || '';
    form.elements['price'].value = serviceToEdit.price || '';
    form.elements['stock'].value = serviceToEdit.stock || '';
    form.elements['description'].value = serviceToEdit.description || '';
    form.elements['imageUrl'].value = serviceToEdit.imageUrl || '';

    // 6. Handle form submission (Update)
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        const updatedService = {
            ...serviceToEdit, // Keep original id, providerId, etc.
            name: formData.get('name'),
            category: formData.get('category'),
            price: formData.get('price'),
            stock: formData.get('stock'),
            description: formData.get('description'),
            imageUrl: formData.get('imageUrl'),
        };

        const serviceIndex = allServices.findIndex(s => s.id === serviceId);
        if (serviceIndex > -1) {
            allServices[serviceIndex] = updatedService;
            localStorage.setItem('agrohelp_services', JSON.stringify(allServices));
            alert('Service updated successfully!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: Could not find the service to update.');
        }
    });

    // 7. Handle Delete
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this service? This will also remove all associated bookings. This action cannot be undone.')) {
            // Filter out the service to be deleted
            const updatedServices = allServices.filter(s => s.id !== serviceId);
            localStorage.setItem('agrohelp_services', JSON.stringify(updatedServices));

            // Also delete associated bookings for data integrity
            let allBookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
            const updatedBookings = allBookings.filter(b => b.serviceId !== serviceId);
            localStorage.setItem('agrohelp_bookings', JSON.stringify(updatedBookings));
            
            alert('Service and all associated bookings have been deleted.');
            window.location.href = 'dashboard.html';
        }
    });
});