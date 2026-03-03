document.addEventListener('DOMContentLoaded', async () => {
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

    try {
        // Fetch service details from the API
        const response = await fetch(`/api/services/${serviceId}`);
        if (!response.ok) {
            throw new Error('Selected service not found. It may have been removed.');
        }
        const serviceToBook = await response.json();

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
                    <p class="card-provider">Provider: ${serviceToBook.providerId ? serviceToBook.providerId.name : 'N/A'}</p>
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
                    <select id="bookingTime" name="bookingTime">
                        <!-- Time options will be populated here -->
                    </select>
                </div>
                <h3 style="margin-top: 2rem;">Select Payment Method</h3>
                <div class="input-group" style="margin-top: 1rem;">
                    <i class="fa-solid fa-money-bill-wave"></i>
                    <select id="paymentMethod" name="paymentMethod" required>
                        <option value="Cash on Service" selected>Cash on Service</option>
                    </select>
                </div>
            </div>
            <p style="margin-top: 1.5rem; font-size: 1.1rem;">Click "Confirm Booking" to send your request.</p>
        `;

        // Populate time options
        populateTimeOptions();

        // Handle booking confirmation
        confirmBookingBtn.addEventListener('click', () => createBooking(serviceToBook, userId, userName));

    } catch (error) {
        bookingDetailsContainer.innerHTML = `<p class="no-services-message">${error.message}</p>`;
        confirmBookingBtn.style.display = 'none';
    }
});

function populateTimeOptions() {
    const timeSelect = document.getElementById('bookingTime');
    if (timeSelect) {
        let timeOptionsHTML = '<option value="">Select a time (optional)</option>';
        for (let i = 9; i <= 20; i++) { // 9 AM to 8 PM (20:00)
            const hour24 = i.toString().padStart(2, '0');
            const hour12 = i > 12 ? i - 12 : i;
            const ampm = i >= 12 ? 'PM' : 'AM';
            const displayTime = `${hour12}:00 ${ampm}`;
            timeOptionsHTML += `<option value="${hour24}:00">${displayTime}</option>`;
        }
        timeSelect.innerHTML = timeOptionsHTML;
    }
}

async function createBooking(serviceToBook, userId, userName) {
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const requestedDate = document.getElementById('bookingDate').value;
    const requestedTime = document.getElementById('bookingTime').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const token = localStorage.getItem('agrohelp_token');

    if (!requestedDate) {
        alert('Please select a preferred date for your booking.');
        return;
    }

    // Disable button to prevent multiple clicks
    confirmBookingBtn.disabled = true;
    confirmBookingBtn.textContent = 'Sending Request...';

    const bookingData = {
        serviceId: serviceToBook._id,
        providerId: serviceToBook.providerId._id, // Pass the ID, not the object
        requestedDateTime: requestedTime ? `${requestedDate}T${requestedTime}` : requestedDate,
        paymentMethod: paymentMethod
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}.`;
            // Check if the response is JSON before trying to parse it.
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || 'Failed to create booking.';
            } else {
                // If not JSON, it's likely an HTML error page from the server (like a 404 page).
                const textError = await response.text();
                console.error("Server returned a non-JSON error response:", textError);
                errorMessage = `The API endpoint was not found (404). Please check the server configuration.`;
            }
            throw new Error(errorMessage);
        }

        alert('Booking request sent! You will be redirected to your bookings.');
        window.location.href = 'my-bookings.html';

    } catch (error) {
        console.error('Booking failed:', error);
        alert(`Error: ${error.message}`);
        // Re-enable button on failure
        confirmBookingBtn.disabled = false;
        confirmBookingBtn.textContent = 'Confirm Booking';
    }
}