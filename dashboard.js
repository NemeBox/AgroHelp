document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userId = localStorage.getItem('agrohelp_user_id');
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

    // Load services created by the expert from localStorage
    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const myServices = allServices.filter(service => service.providerId === userId);

    if (servicesGrid) {
        if (myServices.length === 0) {
            servicesGrid.innerHTML = `<p class="no-services-message">You have not created any services yet. <a href="create-service.html">Create one now!</a></p>`;
        } else {
            servicesGrid.innerHTML = '';
            myServices.forEach(service => {
            const serviceCardHTML = createDashboardServiceCard(service);
                servicesGrid.insertAdjacentHTML('beforeend', serviceCardHTML);
            });
        }
    }

    // Load bookings for the expert's services
    loadProviderBookings();
});

function loadProviderBookings() {
    const userId = localStorage.getItem('agrohelp_user_id');
    const bookingsGrid = document.getElementById('my-bookings-grid');
    if (!bookingsGrid) return;

    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const myServices = allServices.filter(service => service.providerId === userId);
    const myServiceIds = myServices.map(s => s.id);

    const allBookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
    const myBookings = allBookings.filter(booking => myServiceIds.includes(booking.serviceId)).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    if (myBookings.length === 0) {
        bookingsGrid.innerHTML = `<p class="no-services-message">You have no bookings for your services yet.</p>`;
    } else {
        bookingsGrid.innerHTML = myBookings.map(booking => {
            const service = allServices.find(s => s.id === booking.serviceId);
            return createBookingCardForProvider(booking, service);
        }).join('');
    }

    bookingsGrid.addEventListener('click', handleBookingAction);
}

function createDashboardServiceCard(service) {
    const imageUrl = service.imageUrl || 'https://images.unsplash.com/photo-1556056504-5c7696e4734d?w=600';
    const serviceId = service.id; // Use 'id' from localStorage object

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

function handleBookingAction(event) {
    const target = event.target;
    const bookingId = target.dataset.bookingId;

    if (!bookingId || !(target.classList.contains('accept-btn') || target.classList.contains('decline-btn'))) {
        return; // Exit if not a booking action button
    }

    const newStatus = target.classList.contains('accept-btn') ? 'Confirmed' : 'Declined';

    let allBookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
    const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);

    if (bookingIndex > -1) {
        allBookings[bookingIndex].status = newStatus;

        // Add provider's phone number to the booking object upon confirmation
        if (newStatus === 'Confirmed') {
            const providerPhone = localStorage.getItem('agrohelp_user_phone');
            if (providerPhone) {
                allBookings[bookingIndex].providerPhone = providerPhone;
            }
        }

        localStorage.setItem('agrohelp_bookings', JSON.stringify(allBookings));

        // Dynamically update the card without a full page reload
        const card = target.closest('.booking-card');
        const service = (JSON.parse(localStorage.getItem('agrohelp_services')) || []).find(s => s.id === allBookings[bookingIndex].serviceId);
        if (card && service) {
            card.outerHTML = createBookingCardForProvider(allBookings[bookingIndex], service);
        }
        alert(`Booking has been ${newStatus.toLowerCase()}.`);
    }
}

function createBookingCardForProvider(booking, service) {
    if (!service) return ''; // Don't render if service not found

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

    let statusDisplay = '';
    if (booking.status === 'Pending') {
        statusDisplay = `
            <div class="booking-actions" style="display: flex; gap: 10px;">
                <button class="cta-btn-small accept-btn" data-booking-id="${booking.bookingId}">Accept</button>
                <button class="cta-btn-small decline-btn" data-booking-id="${booking.bookingId}" style="background-color: #c0392b;">Decline</button>
            </div>
        `;
    } else {
        const statusColor = booking.status === 'Confirmed' ? 'var(--deep-sage)' : '#c0392b';
        statusDisplay = `<span class="booking-status" style="color: ${statusColor}; font-weight: 600;">Status: ${booking.status}</span>`;
    }

    return `
        <div class="service-card booking-card">
            <div class="card-body">
                <h3 class="card-title">Booking for: ${service.name}</h3>
                <p class="card-provider">Booked by: ${booking.customerName}</p>
                <p class="card-description">Requested for: ${requestedDateTimeDisplay}</p>
                <div class="card-footer">
                    <span class="card-price">Service Price: ₹${parseFloat(service.price).toFixed(2)}</span>
                    ${statusDisplay}
                </div>
            </div>
        </div>
    `;
}