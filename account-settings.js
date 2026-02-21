document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('account-settings-form');
    const formContainer = document.getElementById('account-form-container');
    const authMessage = document.getElementById('auth-check-message');

    if (!form || !formContainer || !authMessage) {
        console.error('AgroHelp: Missing critical elements on the account settings page.');
        return;
    }

    // 1. Authentication Check
    const token = localStorage.getItem('agrohelp_token');
    const userRole = localStorage.getItem('agrohelp_user_role');

    if (!token || userRole !== 'provider') {
        formContainer.style.display = 'none';
        authMessage.style.display = 'block';
        authMessage.innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in as a service provider to view this page.</p>
            <a href="auth_pro.html" class="cta-btn">Login as Provider</a>
        `;
        return;
    }

    // 2. Populate form with existing data from localStorage
    form.elements['name'].value = localStorage.getItem('agrohelp_user_name') || '';
    form.elements['email'].value = localStorage.getItem('agrohelp_user_email') || '';
    form.elements['phone'].value = localStorage.getItem('agrohelp_user_phone') || '';

    // 3. Handle form submission (Update)
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const updatedData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
        };

        if (!updatedData.name || !updatedData.email || !updatedData.phone) {
            alert('Please fill in all fields.');
            return;
        }

        if (updatedData.phone.length > 10) {
            alert('Phone number cannot be more than 10 digits.');
            form.elements['phone'].focus();
            return;
        }

        try {
            const response = await fetch('/api/user/account', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update account.');
            }

            // Update localStorage with the new data from the server response
            if (result.name) localStorage.setItem('agrohelp_user_name', result.name);
            if (result.email) localStorage.setItem('agrohelp_user_email', result.email);
            if (result.phone) localStorage.setItem('agrohelp_user_phone', result.phone);

            alert('Account updated successfully!');
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Account update error:', error);
            alert(`Error: ${error.message}`);
        }
    });
});