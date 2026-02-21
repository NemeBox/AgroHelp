document.addEventListener('DOMContentLoaded', () => {
    const bookingsGrid = document.getElementById('my-bookings-grid');
    const authMessage = document.getElementById('auth-check-message');

    if (!bookingsGrid || !authMessage) {
        console.error('AgroHelp: Missing critical "my bookings" page elements.');
        return;
    }

    // Auth check
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userId = localStorage.getItem('agrohelp_user_id');

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

    const allBookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
    const myBookings = allBookings.filter(b => b.customerId === userId);

    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];

    if (myBookings.length === 0) {
        bookingsGrid.innerHTML = `<p class="no-services-message">You have not booked any services yet. <a href="service.html">Browse services now!</a></p>`;
        return;
    }

    bookingsGrid.innerHTML = '';
    myBookings.forEach(booking => {
        const service = allServices.find(s => s.id === booking.serviceId);
        const bookingCardHTML = createBookingCardForCustomer(booking, service);
        bookingsGrid.insertAdjacentHTML('beforeend', bookingCardHTML);
    });
});

function createBookingCardForCustomer(booking, service) {
    if (!service) {
        // Handle case where service might have been deleted
        return `
            <div class="service-card booking-card">
                <div class="card-body">
                    <h3 class="card-title" style="color: #999;">Booked Service (No longer available)</h3>
                    <p class="card-provider">Booking ID: ${booking.bookingId}</p>
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

    let statusColor;
    switch (booking.status) {
        case 'Confirmed':
            statusColor = 'var(--deep-sage)';
            break;
        case 'Declined':
            statusColor = '#c0392b';
            break;
        default: // Pending
            statusColor = 'var(--text-muted)';
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
                <div class="card-footer">
                    <span class="card-price">Price: ₹${parseFloat(service.price).toFixed(2)}</span>
                    <span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: ${booking.status}</span>
                </div>
            </div>
        </div>
    `;
}