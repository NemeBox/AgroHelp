document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-service-form');
    if (!form) {
        console.error('AgroHelp: Create service form with id "create-service-form" not found!');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('agrohelp_token');
        if (!token) {
            alert('You must be logged in to create a service.');
            window.location.href = 'auth_pro.html';
            return;
        }

        const formData = new FormData(form);
        const serviceData = {
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            price: formData.get('price'),
            stock: formData.get('stock'),
            imageUrl: formData.get('imageUrl'),
        };

        if (!serviceData.name || !serviceData.category || !serviceData.price) {
            alert('Please fill in all required fields (Name, Category, Price).');
            return;
        }

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData)
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Failed to create service.');
            }

            alert('Service created successfully!');
            window.location.href = 'dashboard.html'; // Redirect to the provider dashboard

        } catch (error) {
            console.error('Error creating service:', error);
            alert(`Error: ${error.message}`);
        }
    });
});