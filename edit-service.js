document.addEventListener('DOMContentLoaded', async () => {
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

    // 3. Fetch service data from the API
    try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (!response.ok) {
            throw new Error('Service not found.');
        }
        const serviceToEdit = await response.json();

        // The backend already secures the endpoints, but this provides a quick UI feedback.
        const userId = localStorage.getItem('agrohelp_user_id');
        // The providerId from the populated service is an object { _id: '...', name: '...' }.
        // We need to compare its _id property with the userId string from localStorage.
        if (!serviceToEdit.providerId || serviceToEdit.providerId._id.toString() !== userId) {
            throw new Error('You do not have permission to edit this service.');
        }

        // 4. Populate form with existing data
        form.elements['name'].value = serviceToEdit.name || '';
        form.elements['category'].value = serviceToEdit.category || '';
        form.elements['price'].value = serviceToEdit.price || '';
        form.elements['stock'].value = serviceToEdit.stock || '';
        form.elements['description'].value = serviceToEdit.description || '';
        form.elements['imageUrl'].value = serviceToEdit.imageUrl || '';

    } catch (error) {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>${error.message}</p>
            <a href="dashboard.html" class="cta-btn">Back to Dashboard</a>
        `;
        return;
    }

    // 5. Handle form submission (Update)
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        const updatedData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: formData.get('price'),
            stock: formData.get('stock'),
            description: formData.get('description'),
            imageUrl: formData.get('imageUrl'),
        };

        try {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update service.');
            alert('Service updated successfully!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // 6. Handle Delete
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this service? This will also remove all associated bookings. This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to delete service.');
                alert('Service has been deleted.');
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    });
});