async function loadMyBookings() {
    const bookingsGrid = document.getElementById('my-bookings-grid');
    const token = localStorage.getItem('agrohelp_token');

    if (!bookingsGrid) {
        console.error('AgroHelp: Missing critical "my bookings" page elements.');
        return;
    }

    bookingsGrid.innerHTML = `<p>Loading your bookings...</p>`;

    try {
        // This new endpoint should be created in the backend.
        // It should be protected and return bookings for the logged-in customer,
        // with service details populated via .populate('serviceId').
        const response = await fetch('/api/bookings/mine', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }

        const myBookings = await response.json();

        if (myBookings.length === 0) {
            bookingsGrid.innerHTML = `<p class="no-services-message">You have not booked any services yet. <a href="service.html">Browse services now!</a></p>`;
            return;
        }

        bookingsGrid.innerHTML = '';
        myBookings.forEach(booking => {
            // The 'service' object is now expected to be populated by the API.
            const bookingCardHTML = createBookingCardForCustomer(booking, booking.serviceId);
            bookingsGrid.insertAdjacentHTML('beforeend', bookingCardHTML);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsGrid.innerHTML = `<p class="no-services-message" style="color: var(--error-red);">Could not load your bookings. Please try again later.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bookingsGrid = document.getElementById('my-bookings-grid');
    const authMessage = document.getElementById('auth-check-message');

    if (!bookingsGrid || !authMessage) {
        return;
    }

    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');

    if (!token || userRole !== 'customer') {
        bookingsGrid.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a customer to view your bookings.</p>
            <a href="auth_cus.html" class="cta-btn">Login as Customer</a>
        `;
        return;
    }

    loadMyBookings();

    bookingsGrid.addEventListener('click', handleCustomerBookingAction);
});

async function handleCustomerBookingAction(event) {
    const target = event.target;
    const bookingId = target.dataset.bookingId;
    const token = localStorage.getItem('agrohelp_token');

    if (!bookingId || !target.classList.contains('confirm-completion-btn')) {
        return;
    }

    if (confirm('Are you sure you want to confirm that this service has been completed?')) {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Awaiting Payment Confirmation' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking status.');
            }

            alert('Confirmation sent to provider. Awaiting their payment confirmation.');
            loadMyBookings(); // Reload the bookings grid to show the change
        } catch (error) {
            console.error('Error updating booking:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

function createBookingCardForCustomer(booking, service) {
    if (!service) {
        // This now correctly handles the case where a service was deleted from the database.
        // The booking._id from the database is used instead of a client-side ID.
        return `
            <div class="service-card booking-card">
                <div class="card-body">
                    <h3 class="card-title" style="color: #999;">Booked Service (Details Unavailable)</h3>
                    <p class="card-provider">Booking ID: ${booking._id}</p>
                    <p class="card-description">Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    }

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
        requestedDateTimeDisplay = `On ${new Date(booking.bookingDate).toLocaleDateString('en-GB')}`;
    }

    let providerContactInfo = '';
    if (booking.status === 'Confirmed' && booking.providerPhone) {
        providerContactInfo = `
            <p class="card-provider" style="margin-top: 10px; color: var(--deep-sage); font-weight: 600;">
                <i class="fa-solid fa-phone"></i> Contact: ${booking.providerPhone}
            </p>
        `;
    }

    let paymentMethodInfo = '';
    if (booking.paymentMethod) {
        paymentMethodInfo = `
            <p class="card-description" style="margin-bottom: 0.5rem;">Payment via: <strong>${booking.paymentMethod}</strong></p>
        `;
    }

    let actionArea;
    let statusColor;

    switch (booking.status) {
        case 'Awaiting Customer Confirmation':
            // Use booking._id from the database for the data attribute
            actionArea = `<button class="cta-btn-small confirm-completion-btn" data-booking-id="${booking._id}">Confirm Service Completed</button>`;
            break;
        case 'Awaiting Payment Confirmation':
            statusColor = 'var(--text-muted)';
            actionArea = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Awaiting Provider Payment Confirmation</span>`;
            break;
        case 'Completed':
            statusColor = 'var(--deep-sage)';
            if (booking.reviewLeft) {
                actionArea = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Review Submitted</span>`;
            } else {
                // Use booking._id and service._id from the database for the review link
                actionArea = `<a href="review.html?bookingId=${booking._id}&providerId=${service.providerId}&serviceId=${service._id}" class="cta-btn-small">Leave a Review</a>`;
            }
            break;
        case 'Declined':
            statusColor = '#c0392b';
            actionArea = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: Declined</span>`;
            break;
        case 'Confirmed':
            statusColor = 'var(--deep-sage)';
            actionArea = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: Confirmed</span>`;
            break;
        default: // Pending
            statusColor = 'var(--text-muted)';
            actionArea = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: Pending</span>`;
            break;
    }

    return `
        <div class="service-card booking-card">
            <div class="card-img-wrapper">
                <img src="${service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600'}" alt="${service.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${service.name}</h3>
                <p class="card-provider">Provider: ${service.providerName}</p>
                <p class="card-description" style="margin-bottom: 0.5rem;">Requested for: ${requestedDateTimeDisplay}</p>
                ${providerContactInfo}
                ${paymentMethodInfo}
                <div class="card-footer">
                    <span class="card-price">Price: ₹${parseFloat(service.price).toFixed(2)}</span>
                    ${actionArea}
                </div>
            </div>
        </div>
    `;
}