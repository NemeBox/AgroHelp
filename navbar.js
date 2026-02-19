// Function to handle user logout
function logout() {
    localStorage.removeItem('agrohelp_token');
    localStorage.removeItem('agrohelp_user_id'); // Assuming you might store user ID
    localStorage.removeItem('agrohelp_user_name');
    localStorage.removeItem('agrohelp_user_role');
    localStorage.removeItem('agrohelp_user_profile_pic'); // Clear profile pic too
    window.location.href = 'index.html'; // Redirect to home after logout
}

// Function to update the authentication section of the header
function updateAuthHeader() {
    const authButtonsContainer = document.getElementById('authButtons');
    const loggedInInfoContainer = document.getElementById('loggedInInfo');
    const profilePic = document.getElementById('profilePic');
    const profileMenuContainer = document.querySelector('.profile-menu-container'); // <-- ADDED THIS LINE
    const profileDropdownContent = document.getElementById('profileDropdownContent');
    const logoutBtn = profileDropdownContent ? profileDropdownContent.querySelector('.cta-btn.logout-btn') : null;

    // Helper function to generate a simple SVG data URL for an initial
    function generateInitialSVG(initial, size = 40, bgColor = '#81c784', textColor = '#ffffff') {
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${size}" height="${size}" fill="${bgColor}"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                      font-family="Inter, sans-serif" font-size="${size * 0.6}" font-weight="600" fill="${textColor}">
                    ${initial}
                </text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Fallback colors for initials (can be expanded or made dynamic)
    const fallbackBgColor = '#81c784'; // Your sage-green
    const fallbackTextColor = '#ffffff';

    // Ensure these elements exist before proceeding
    // Enhanced warning and element check
    if (!authButtonsContainer) console.error("AgroHelp: Element with ID 'authButtons' not found.");
    if (!loggedInInfoContainer) console.error("AgroHelp: Element with ID 'loggedInInfo' not found.");
    if (!profilePic) console.error("AgroHelp: Element with ID 'profilePic' not found.");
    if (!profileMenuContainer) console.error("AgroHelp: Element with class 'profile-menu-container' not found.");
    if (!profileDropdownContent) console.error("AgroHelp: Element with ID 'profileDropdownContent' not found.");
    if (!logoutBtn && profileDropdownContent) console.error("AgroHelp: Logout button with class 'cta-btn.logout-btn' not found inside 'profileDropdownContent'.");

    if (!authButtonsContainer || !loggedInInfoContainer || !profilePic || !profileMenuContainer || !profileDropdownContent || !logoutBtn) {
        console.warn("AgroHelp: One or more critical navigation authentication elements not found. Skipping header update.");
        return;
    }

    const token = localStorage.getItem('agrohelp_token');
    const userName = localStorage.getItem('agrohelp_user_name');
    const userRole = localStorage.getItem('agrohelp_user_role');
    const userProfilePic = localStorage.getItem('agrohelp_user_profile_pic'); // Get profile pic URL

    console.log('AgroHelp: Token found:', !!token);
    console.log('AgroHelp: userName:', userName);
    console.log('AgroHelp: userRole:', userRole);
    console.log('AgroHelp: userProfilePic:', userProfilePic);

    if (token) {
        // User is logged in
        authButtonsContainer.style.display = 'none'; // Hide sign-in/sign-up buttons
        loggedInInfoContainer.style.display = 'flex'; // Show logged-in info (using flex for alignment)
        profileDropdownContent.classList.remove('show'); // Ensure dropdown is hidden initially
        
        console.log('AgroHelp: User is logged in. authButtonsContainer display:', authButtonsContainer.style.display);
        console.log('AgroHelp: User is logged in. loggedInInfoContainer display:', loggedInInfoContainer.style.display);
        console.log('AgroHelp: Profile dropdown content initial state (after removing show):', profileDropdownContent.classList.contains('show') ? 'shown' : 'hidden');

        // Set profile picture
        if (userProfilePic && userProfilePic !== '') { // Also check for empty string
            profilePic.src = userProfilePic;
        } else {
            // Generate a simple initial or use a default placeholder
            let initial = 'U';
            if (userName) {
                initial = userName.charAt(0).toUpperCase();
            } else if (userRole) {
                initial = userRole.charAt(0).toUpperCase();
            }
            profilePic.src = generateInitialSVG(initial, 40, fallbackBgColor, fallbackTextColor);
            console.log('AgroHelp: Profile pic set to generated initial:', initial);
        }

        // Add "Create Service" link for providers
        if (userRole === 'expert') {
            // Add "Create Service" link if it doesn't exist
            // Check if the link already exists to prevent duplicates on page navigation
            if (!profileDropdownContent.querySelector('a[href="create-service.html"]')) {
                const createServiceLink = document.createElement('a');
                createServiceLink.href = 'create-service.html'; // Link to the new page
                createServiceLink.classList.add('cta-btn');
                createServiceLink.textContent = 'Create Service';
                profileDropdownContent.prepend(createServiceLink); // Add it before the logout button
            }
            // Add "My Dashboard" link if it doesn't exist
            if (!profileDropdownContent.querySelector('a[href="dashboard.html"]')) {
                const dashboardLink = document.createElement('a');
                dashboardLink.href = 'dashboard.html';
                dashboardLink.classList.add('cta-btn');
                dashboardLink.textContent = 'My Dashboard';
                profileDropdownContent.prepend(dashboardLink);
            }
        }

        // Add click listener to the profile menu container to toggle dropdown
        // This makes the entire area around the profile pic clickable for the dropdown
        profileMenuContainer.addEventListener('click', (event) => { // Using addEventListener for robustness
            console.log('AgroHelp: Profile menu container clicked!'); // Debugging line
            event.stopPropagation(); // Prevent document click from immediately closing
            profileDropdownContent.classList.toggle('show');
            console.log('AgroHelp: Profile dropdown content class list after toggle:', profileDropdownContent.classList.value);
            console.log('AgroHelp: Profile dropdown content is now:', profileDropdownContent.classList.contains('show') ? 'visible' : 'hidden');
        }); // Corrected: Added closing parenthesis and semicolon

        logoutBtn.onclick = logout; // Attach logout function to the logout button
        console.log('AgroHelp: Logout button click handler attached.');
    } else {
        // User is not logged in
        authButtonsContainer.style.display = 'block'; // Show sign-in/sign-up buttons
        console.log('AgroHelp: User is NOT logged in. authButtonsContainer display:', authButtonsContainer.style.display);
        console.log('AgroHelp: User is NOT logged in. loggedInInfoContainer display:', loggedInInfoContainer.style.display);
    }
}

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', (event) => {
    const profileDropdownContent = document.getElementById('profileDropdownContent');
    const profileMenuContainer = document.querySelector('.profile-menu-container');
    // Only hide if the dropdown is currently shown AND the click is outside
    if (profileDropdownContent && profileMenuContainer && profileDropdownContent.classList.contains('show') && !profileDropdownContent.contains(event.target) && !profileMenuContainer.contains(event.target)) {
        profileDropdownContent.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('AgroHelp: DOMContentLoaded fired. Calling updateAuthHeader().');
    updateAuthHeader(); // Call the centralized function
});