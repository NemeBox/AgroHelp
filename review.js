document.addEventListener('DOMContentLoaded', async () => {
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

    if (!bookingId) {
        formContainer.innerHTML = '<p class="no-services-message">Missing booking information. Cannot leave a review.</p>';
        return;
    }

    try {
        // 3. Fetch booking details from API to validate if a review can be left
        const response = await fetch(`/api/bookings/${bookingId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Could not find the specified booking.');
        }

        const booking = await response.json();

        // The backend should verify ownership, but we can do a client-side check too.
        if (booking.customerId !== userId || booking.status !== 'Completed' || booking.reviewLeft) {
            formContainer.style.display = 'none';
            authMessage.style.display = 'block';
            authMessage.innerHTML = `
                <h2>Review Not Allowed</h2>
                <p>You cannot leave a review for this booking. It may not be completed or a review may have already been submitted.</p>
                <a href="my-bookings.html" class="cta-btn">Back to My Bookings</a>
            `;
            return;
        }

        // Display service name (service should be populated)
        if (booking.serviceId && booking.serviceId.name) {
            serviceNameDisplay.textContent = `For service: "${booking.serviceId.name}"`;
        }

        // 4. Handle form submission
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const rating = formData.get('rating');
            const comment = formData.get('comment');

            if (!rating) {
                alert('Please select a star rating.');
                return;
            }

            const reviewData = {
                bookingId: booking._id,
                serviceId: booking.serviceId._id,
                providerId: booking.providerId,
                rating: parseInt(rating),
                comment: comment,
            };

            try {
                const reviewResponse = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reviewData)
                });

                if (!reviewResponse.ok) {
                    const errorData = await reviewResponse.json();
                    throw new Error(errorData.message || 'Failed to submit review.');
                }

                alert('Thank you! Your review has been submitted.');
                window.location.href = 'my-bookings.html';
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        });
    } catch (error) {
        formContainer.innerHTML = `<p class="no-services-message">${error.message}</p>`;
    }
});