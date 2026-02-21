document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('review-form');
    const formContainer = document.getElementById('review-form-container');
    const authMessage = document.getElementById('auth-check-message');
    const serviceNameDisplay = document.getElementById('service-name-for-review');

    if (!form || !formContainer || !authMessage || !serviceNameDisplay) {
        console.error('AgroHelp: Missing critical elements on the review page.');
        return;
    }

    // 1. Authentication Check
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userId = localStorage.getItem('agrohelp_user_id');

    if (!token || userRole !== 'customer') {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a customer to leave a review.</p>
            <a href="auth_cus.html" class="cta-btn">Login as Customer</a>
        `;
        return;
    }

    // 2. Get IDs from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    const providerId = urlParams.get('providerId');
    const serviceId = urlParams.get('serviceId');

    if (!bookingId || !providerId || !serviceId) {
        formContainer.innerHTML = '<p class="no-services-message">Missing booking information. Cannot leave a review.</p>';
        return;
    }

    // 3. Check if review is valid
    const allBookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
    const booking = allBookings.find(b => b.bookingId === bookingId);

    if (!booking || booking.customerId !== userId || booking.status !== 'Completed' || booking.reviewLeft) {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Review Not Allowed</h2>
            <p>You cannot leave a review for this booking. It may not be completed or a review may have already been submitted.</p>
            <a href="my-bookings.html" class="cta-btn">Back to My Bookings</a>
        `;
        return;
    }

    // Display service name
    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const service = allServices.find(s => s.id === serviceId);
    if (service) {
        serviceNameDisplay.textContent = `For service: "${service.name}"`;
    }

    // 4. Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const rating = formData.get('rating');
        const comment = formData.get('comment');

        if (!rating) {
            alert('Please select a star rating.');
            return;
        }

        const newReview = {
            reviewId: `review_${Date.now()}`,
            bookingId: bookingId,
            serviceId: serviceId,
            providerId: providerId,
            customerId: userId,
            customerName: localStorage.getItem('agrohelp_user_name'),
            rating: parseInt(rating),
            comment: comment,
            date: new Date().toISOString()
        };

        // Save the new review
        const reviews = JSON.parse(localStorage.getItem('agrohelp_reviews')) || [];
        reviews.push(newReview);
        localStorage.setItem('agrohelp_reviews', JSON.stringify(reviews));

        // Mark the booking as having a review
        const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
        allBookings[bookingIndex].reviewLeft = true;
        localStorage.setItem('agrohelp_bookings', JSON.stringify(allBookings));

        alert('Thank you! Your review has been submitted.');
        window.location.href = 'my-bookings.html';
    });
});