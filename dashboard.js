document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const servicesGrid = document.getElementById('my-services-grid');
    const bookingsGrid = document.getElementById('my-bookings-grid'); // Assumes a new element for bookings in dashboard.html
    const authMessage = document.getElementById('auth-check-message');

    if (!token || userRole !== 'provider') {
        if (servicesGrid) servicesGrid.style.display = 'none';
        if (bookingsGrid) bookingsGrid.style.display = 'none';
        if (authMessage) {
            authMessage.style.display = 'block';
            authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a service provider to view this page.</p>
            <a href="auth_pro.html" class="cta-btn">Login as Provider</a>
        `;
        }
        return;
    }

    // --- NEW: Fetch services and bookings from the backend API ---
    async function loadProviderData() {
        if (!servicesGrid) return;
        try {
            // Fetch services from the new provider-specific endpoint
            // This endpoint should be protected and return services for the logged-in provider.
            const response = await fetch('/api/services/provider/mine', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch services: ${response.statusText}`);
            }

            const myServices = await response.json();

            if (myServices.length === 0) {
                servicesGrid.innerHTML = `<p class="no-services-message">You have not created any services yet. <a href="create-service.html">Create one now!</a></p>`;
            } else {
                servicesGrid.innerHTML = '';
                myServices.forEach(service => {
                    const serviceCardHTML = createDashboardServiceCard(service);
                    servicesGrid.insertAdjacentHTML('beforeend', serviceCardHTML);
                });
            }
            // Load bookings after services have been fetched, passing the services array
            loadProviderBookings(myServices);
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = `<p class="no-services-message" style="color: var(--error-red);">Could not load your services. Please try again later.</p>`;
            // Still attempt to load bookings, which might show an empty state correctly
            loadProviderBookings([]);
        }
    }

    // Load bookings for the expert's services
    // This is now called from within loadProviderData() to ensure services are available.
    loadProviderData();

    async function loadProviderBookings(myServices) {
        const bookingsGrid = document.getElementById('my-bookings-grid');
        const token = localStorage.getItem('agrohelp_token');
        if (!bookingsGrid) return;

        try {
            // Fetch bookings for the provider's services from a new API endpoint.
            const response = await fetch('/api/bookings/provider', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch bookings: ${response.statusText}`);
            }

            const myBookings = await response.json();

            if (myBookings.length === 0) {
                bookingsGrid.innerHTML = `<p class="no-services-message">You have no bookings for your services yet.</p>`;
            } else {
                bookingsGrid.innerHTML = myBookings.map(booking => {
                    // The service object should be populated by the backend API.
                    // We pass booking.serviceId which is now an object.
                    return createBookingCardForProvider(booking, booking.serviceId);
                }).join('');
            }

            bookingsGrid.addEventListener('click', handleBookingAction);
        } catch (error) {
            console.error('Error loading provider bookings:', error);
            bookingsGrid.innerHTML = `<p class="no-services-message" style="color: var(--error-red);">Could not load your bookings. Please try again later.</p>`;
        }
    }

    function createDashboardServiceCard(service) {
        const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';
        // IMPORTANT: MongoDB uses '_id' for its unique identifier, not 'id'.
        // We must use service._id to link to the edit page.
        const serviceId = service._id;

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
                            <a href="edit-service.html?id=${serviceId}" class="cta-btn-small">Edit / View</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function handleBookingAction(event) {
        const target = event.target;
        const bookingId = target.dataset.bookingId;
        const token = localStorage.getItem('agrohelp_token');

        if (!bookingId) return;

        let newStatus = '';
        let alertMessage = '';

        if (target.classList.contains('accept-btn')) {
            newStatus = 'Confirmed';
            alertMessage = 'Booking has been confirmed.';
        } else if (target.classList.contains('decline-btn')) {
            newStatus = 'Declined';
            alertMessage = 'Booking has been declined.';
        } else if (target.classList.contains('complete-service-btn')) {
            newStatus = 'Awaiting Customer Confirmation';
            alertMessage = 'Service marked as complete. Waiting for customer to confirm.';
        } else if (target.classList.contains('confirm-payment-btn')) {
            if (confirm('Please confirm that you have received the payment for this service.')) {
                newStatus = 'Completed';
                alertMessage = 'Payment confirmed. Booking is now complete.';
            } else {
                return; // User cancelled the confirmation
            }
        } else if (target.classList.contains('view-review-btn')) {
            const detailsId = `review-details-${bookingId}`;
            const detailsElement = document.getElementById(detailsId);
            if (detailsElement) {
                if (detailsElement.style.display === 'none') {
                    detailsElement.style.display = 'block';
                    target.textContent = 'Hide Details';
                } else {
                    detailsElement.style.display = 'none';
                    target.textContent = 'View Details';
                }
            }
            return; // Return early, no state change
        } else {
            return; // Not a relevant button click
        }

        try {
            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking status.');
            }

            if (alertMessage) {
                alert(alertMessage);
            }
            // Re-fetch all provider data to refresh both services and bookings lists
            loadProviderData();
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert(`Error: ${error.message}`);
        }
    }

    const renderStars = (rating) => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fa-solid fa-star" style="color: ${i <= rating ? '#f39c12' : '#e0e0e0'};"></i>`;
        }
        return stars;
    };

    function createBookingCardForProvider(booking, service) {
        if (!service) return ''; // Don't render if service (somehow) not populated

        let requestedDateTimeDisplay;
        if (booking.requestedDateTime) {
            if (booking.requestedDateTime.includes('T')) {
                const requestedDate = new Date(booking.requestedDateTime).toLocaleDateString('en-GB');
                const requestedTime = new Date(booking.requestedDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                requestedDateTimeDisplay = `<strong>${requestedDate} at ${requestedTime}</strong>`;
            } else {
                const requestedDate = new Date(booking.requestedDateTime).toLocaleDateString('en-GB');
                requestedDateTimeDisplay = `<strong>${requestedDate} (Any Time)</strong>`;
            }
        } else {
        requestedDateTimeDisplay = `On ${new Date(booking.createdAt).toLocaleDateString('en-GB')}`;
        }

        let reviewDisplay = '';
        if (booking.status === 'Completed' && booking.reviewLeft) {
            // The review should be populated by the backend along with the booking
            if (booking.review) {
                const review = booking.review;
                reviewDisplay = `
                    <div class="review-summary" style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">Customer Review:</span>
                            <button class="cta-btn-small view-review-btn" data-booking-id="${booking._id}" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View Details</button>
                        </div>
                        <div class="star-rating-display" style="font-size: 1.1rem; margin-top: 0.5rem;">${renderStars(review.rating)}</div>
                        <p class="review-comment-details" id="review-details-${booking._id}" style="display: none; margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 8px; font-style: italic;">"${review.comment}"</p>
                    </div>
                `;
            }
        }

        let statusDisplay;
        if (booking.status === 'Pending') {
            statusDisplay = `
                <div class="booking-actions" style="display: flex; gap: 10px;">
                    <button class="cta-btn-small accept-btn" data-booking-id="${booking._id}">Accept</button>
                    <button class="cta-btn-small decline-btn" data-booking-id="${booking._id}" style="background-color: #c0392b;">Decline</button>
                </div>
            `;
        } else if (booking.status === 'Confirmed') {
            statusDisplay = `<button class="cta-btn-small complete-service-btn" data-booking-id="${booking._id}" style="background-color: #2980b9;">Mark as Complete</button>`;
        } else if (booking.status === 'Awaiting Customer Confirmation') {
            statusDisplay = `<span class="booking-status" style="color: var(--text-muted); font-weight: 600;">Waiting for Customer</span>`;
        } else if (booking.status === 'Awaiting Payment Confirmation') {
            statusDisplay = `<button class="cta-btn-small confirm-payment-btn" data-booking-id="${booking._id}">Confirm Payment</button>`;
        } else if (booking.status === 'Completed') {
            const statusColor = 'var(--deep-sage)';
            statusDisplay = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: Completed</span>`;
        } else {
            // For 'Declined' status
            const statusColor = '#c0392b';
            statusDisplay = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: ${booking.status}</span>`;
        }

        return `
            <div class="service-card booking-card">
                <div class="card-body">
                    <h3 class="card-title">Booking for: ${service.name}</h3>
                    <p class="card-provider">Booked by: ${booking.customerId ? booking.customerId.name : 'N/A'}</p>
                    <p class="card-description" style="margin-bottom: 0.5rem;">Requested for: ${requestedDateTimeDisplay}</p>
                    <p class="card-description" style="font-weight: 600;">Payment Method: ${booking.paymentMethod || 'Not specified'}</p>
                    <div class="card-footer">
                        <span class="card-price">Service Price: ₹${parseFloat(service.price).toFixed(2)}</span>
                        ${statusDisplay}
                    </div>
                    ${reviewDisplay}
                </div>
            </div>
        `;
    }
});