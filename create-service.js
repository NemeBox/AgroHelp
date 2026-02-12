document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-service-form');
    if (!form) {
        console.error('AgroHelp: Create service form with id "create-service-form" not found!');
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const user = {
            id: localStorage.getItem('agrohelp_user_id'),
            name: localStorage.getItem('agrohelp_user_name')
        };

        if (!user.id) {
            alert('You must be logged in to create a service.');
            window.location.href = 'prov-auth.html';
            return;
        }

        const newService = {
            id: `service_${Date.now()}`, // Unique ID for the service
            providerId: user.id,
            providerName: user.name,
            name: formData.get('serviceName'),
            category: formData.get('serviceCategory'), // e.g., 'rentals', 'consultancy'
            description: formData.get('serviceDescription'),
            price: formData.get('servicePrice'),
            imageUrl: formData.get('serviceImage'),
        };

        if (!newService.name || !newService.category || !newService.price) {
            alert('Please fill in all required fields (Name, Category, Price).');
            return;
        }

        const services = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
        services.push(newService);
        localStorage.setItem('agrohelp_services', JSON.stringify(services));

        alert('Service created successfully!');
        window.location.href = 'services.html'; // Redirect to the services page
    });
});