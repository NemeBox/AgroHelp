document.addEventListener('DOMContentLoaded', () => {
    const bookingDetailsContainer = document.getElementById('booking-details');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const authMessage = document.getElementById('auth-check-message');

    if (!bookingDetailsContainer || !confirmBookingBtn || !authMessage) {
        console.error('AgroHelp: Missing critical booking page elements.');
        return;
    }

    // Check if user is a logged-in customer
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userId = localStorage.getItem('agrohelp_user_id');
    const userName = localStorage.getItem('agrohelp_user_name');

    if (!token || userRole !== 'customer') {
        bookingDetailsContainer.style.display = 'none';
        confirmBookingBtn.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a customer to book a service.</p>
            <a href="auth_cus.html" class="cta-btn">Login as Customer</a>
        `;
        return;
    }

    // Get serviceId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('serviceId');

    if (!serviceId) {
        bookingDetailsContainer.innerHTML = '<p class="no-services-message">No service selected. Please go back to the services page and select a service to book.</p>';
        confirmBookingBtn.style.display = 'none';
        return;
    }

    // Fetch service details from localStorage
    const allServices = JSON.parse(localStorage.getItem('agrohelp_services')) || [];
    const serviceToBook = allServices.find(s => s.id === serviceId);

    if (!serviceToBook) {
        bookingDetailsContainer.innerHTML = '<p class="no-services-message">Selected service not found. It may have been removed.</p>';
        confirmBookingBtn.style.display = 'none';
        return;
    }

    // Set min date for date input to tomorrow to prevent same-day bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // Display service details
    bookingDetailsContainer.innerHTML = `
        <h2>Confirm Your Booking</h2>
        <div class="service-card" style="margin-top: 1.5rem;">
            <div class="card-body">
                <h3 class="card-title">${serviceToBook.name}</h3>
                <p class="card-provider">Provider: ${serviceToBook.providerName}</p>
                <p class="card-description">${serviceToBook.description || 'No description provided.'}</p>
                <div class="card-footer">
                    <span class="card-price">Price: ₹${parseFloat(serviceToBook.price).toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div id="booking-form" style="margin-top: 2rem;">
            <h3>Select a Preferred Date and Time</h3>
            <p>The provider will confirm the final schedule. Time is optional and can be set between 9 AM and 8 PM.</p>
            <div class="input-group" style="margin-top: 1rem;">
                <i class="fa-solid fa-calendar-day"></i>
                <input type="date" id="bookingDate" name="bookingDate" min="${minDate}" required>
            </div>
            <div class="input-group">
                <i class="fa-solid fa-clock"></i>
                <input type="time" id="bookingTime" name="bookingTime" min="09:00" max="20:00">
            </div>
        </div>
        <p style="margin-top: 1.5rem; font-size: 1.1rem;">Click "Confirm Booking" to send your request.</p>
    `;

    // Handle booking confirmation
    confirmBookingBtn.addEventListener('click', () => {
        const requestedDate = document.getElementById('bookingDate').value;
        const requestedTime = document.getElementById('bookingTime').value;

        if (!requestedDate) {
            alert('Please select a preferred date for your booking.');
            return;
        }

        const newBooking = {
            bookingId: `booking_${Date.now()}`,
            serviceId: serviceToBook.id,
            providerId: serviceToBook.providerId,
            customerId: userId,
            customerName: userName,
            bookingDate: new Date().toISOString(),
            requestedDateTime: requestedTime ? `${requestedDate}T${requestedTime}` : requestedDate,
            status: 'Pending'
        };

        const bookings = JSON.parse(localStorage.getItem('agrohelp_bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('agrohelp_bookings', JSON.stringify(bookings));

        alert('Booking successful! You can view your bookings in "My Bookings".');
        window.location.href = 'my-bookings.html';
    });
});