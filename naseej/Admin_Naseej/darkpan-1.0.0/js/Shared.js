// Utility function to determine if a value represents true
function isTrue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
}

// Function to check if user is Super Admin


// Updated loadEmployeeData function
function loadEmployeeData() {
    const jwt = sessionStorage.getItem('Token');

    if (jwt) {
        try {
            const decodedJWT = JSON.parse(atob(jwt.split('.')[1]));
            const employeeName = decodedJWT.fullName;
            const isSuperAdmin = isTrue(decodedJWT.isAdmin);
            const employeeRole = isSuperAdmin ? 'Super Admin' : 'Admin';
            const employeeImagePath = decodedJWT.image;

            // Format image URL
            const imageUrl = `http://localhost:25025/${employeeImagePath.replace(/\\/g, "/")}`;

            // Update profile section
            const profileImg = document.querySelector('.d-flex.align-items-center.ms-4.mb-4 img');
            const profileName = document.querySelector('.d-flex.align-items-center.ms-4.mb-4 h6');
            const profileRole = document.querySelector('.d-flex.align-items-center.ms-4.mb-4 span');

            if (profileImg) profileImg.src = imageUrl;
            if (profileName) profileName.textContent = employeeName;
            if (profileRole) profileRole.textContent = employeeRole;

            // Update navbar
            const navbarImage = document.querySelector('.rounded-circle.me-lg-2');
            const navbarNames = document.querySelectorAll('.d-none.d-lg-inline-flex');

            if (navbarNames.length > 1) {
                const secondNavbarName = navbarNames[2];
                secondNavbarName.textContent = employeeName;
            }

            if (navbarImage) navbarImage.src = imageUrl;

            // Update UI visibility based on admin status
            const adminOnlyElements = document.querySelectorAll('.admin-only');
            adminOnlyElements.forEach(element => {
                element.style.display = isSuperAdmin ? '' : 'none';
            });

            // Optional: Add role-specific styling
            document.body.classList.toggle('super-admin-view', isSuperAdmin);
            document.body.classList.toggle('admin-view', !isSuperAdmin);

        } catch (error) {
            console.error("Error loading employee data:", error);
        }
    }
}


// Initialize when document is ready
document.addEventListener('DOMContentLoaded', loadEmployeeData);










    // Optional: Add visual indicators for Super Admin only features
    document.addEventListener("DOMContentLoaded", function () {
        const jwt = sessionStorage.getItem('Token');
        if (jwt) {
            try {
                const decodedJWT = JSON.parse(atob(jwt.split('.')[1]));
                if (!decodedJWT.isAdmin) {
                    // Hide or disable admin-only UI elements
                    const adminOnlyElements = document.querySelectorAll('.admin-only');
                    adminOnlyElements.forEach(element => {
                        element.style.display = 'none';
                    });
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        }
    });





async function displayContactMessages() {
    try {
        const response = await fetch('http://localhost:25025/api/Contact/GetAllMessage');
        if (!response.ok) {
            throw new Error('Error fetching contact messages');
        }
        const messages = await response.json();

        // Get the last 3 messages in reverse order (newest first)
        const lastThreeMessages = messages.slice(-3).reverse();

        // Get the dropdown menu container
        const dropdownMenu = document.getElementById('messagesDropdown');
        if (!dropdownMenu) {
            console.error('Messages dropdown not found');
            return;
        }

        let content = '';
        lastThreeMessages.forEach((message, index) => {
            content += `
                <a href="ContactsMessages.html" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <img class="rounded-circle" src="img/user.jpg" alt=""
                            style="width: 40px; height: 40px;">
                        <div class="ms-2">
                            <h6 class="fw-normal mb-0">"${message.name}"   sent you a message</h6>
                            <small>${message.message || 'No subject'}</small>
                        </div>
                    </div>
                </a>
                ${index < lastThreeMessages.length - 1 ? '<hr class="dropdown-divider">' : ''}
            `;
        });

        content += `
            <hr class="dropdown-divider">
            <a href="ContactsMessages.html" class="dropdown-item text-center">See all message</a>
        `;

        dropdownMenu.innerHTML = content;

        // Update message count badge
        const messageCountBadge = document.querySelector('.message-count');
        if (messageCountBadge && messages.length > 0) {
            messageCountBadge.textContent = messages.length;
            messageCountBadge.style.display = 'block';
        }

        // Add click handlers
        const allLinks = dropdownMenu.querySelectorAll('a[href="ContactsMessages.html"]');
        allLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'ContactsMessages.html';
            });
        });

    } catch (error) {
        console.error('Error fetching contact messages:', error);
        const dropdownMenu = document.getElementById('messagesDropdown');
        if (dropdownMenu) {
            dropdownMenu.innerHTML = `
                <a href="#" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <div class="ms-2">
                            <h6 class="fw-normal mb-0">Error loading messages</h6>
                            <small>Please try again later</small>
                        </div>
                    </div>
                </a>
            `;
        }
    }
}

// Auto refresh messages every minute
setInterval(displayContactMessages, 60000);

// Initial load
document.addEventListener('DOMContentLoaded', displayContactMessages);





//////////logout function/////////////
// Add click event listener to logout button
document.addEventListener('DOMContentLoaded', function () {
    // Find the logout link in the admin dropdown
    const logoutButton = Array.from(document.querySelectorAll('.dropdown-item'))
        .find(item => item.textContent === 'Log Out');

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Logout handler function
function handleLogout(event) {
    event.preventDefault(); // Prevent default link behavior

    // Remove token from session storage
    sessionStorage.removeItem('Token');

    // Redirect to login page
    window.location.href = 'signin.html'; // Change this to your login page URL
}















// Function to load testimonials
async function loadTestimonials() {
    try {
        const response = await fetch('http://localhost:25025/api/Testimonials/GetAllTestimonials');
        if (!response.ok) throw new Error('Failed to fetch testimonials');

        const testimonials = await response.json();

        // Sort testimonials by ID (assuming newer testimonials have higher IDs)
        const sortedTestimonials = testimonials
            .sort((a, b) => b.id - a.id)
            .slice(0, 3); // Get only the last 3

        const dropdownMenu = document.getElementById('testimonialDropdown');
        dropdownMenu.innerHTML = ''; // Clear existing content

        // Add testimonial items
        sortedTestimonials.forEach(testimonial => {
            const testimonialElement = document.createElement('div');
            testimonialElement.className = 'testimonial-item';
            testimonialElement.innerHTML = `
                <h6 class="fw-normal mb-0">${testimonial.firstname} ${testimonial.lastname}</h6>
                <p class="testimonial-message">${testimonial.theTestimonials}</p>
                <small class="testimonial-info">${testimonial.email}</small>
            `;
            dropdownMenu.appendChild(testimonialElement);

            // Add divider except for the last item
            if (testimonial !== sortedTestimonials[sortedTestimonials.length - 1]) {
                const divider = document.createElement('hr');
                divider.className = 'dropdown-divider m-0';
                dropdownMenu.appendChild(divider);
            }
        });

        // Add "View All" link
        const viewAllLink = document.createElement('a');
        viewAllLink.href = 'Testimonials.html';
        viewAllLink.className = 'view-all-link';
        viewAllLink.textContent = 'View All Testimonials';
        dropdownMenu.appendChild(viewAllLink);

        // Update badge count
        const badge = document.querySelector('.testimonial-count');
        badge.textContent = testimonials.length;
        badge.style.display = testimonials.length > 0 ? 'block' : 'none';

    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Load testimonials when the page loads
document.addEventListener('DOMContentLoaded', loadTestimonials);

// Refresh testimonials every 5 minutes (300000 milliseconds)
setInterval(loadTestimonials, 300000);












// Function to check token and redirect
function checkTokenAndRedirect() {
    const token = sessionStorage.getItem('Token');
    const currentPath = window.location.pathname;
    const loginPath = 'signin.html'; 
    if (!token && !currentPath.includes(loginPath)) {
        sessionStorage.setItem('redirectUrl', currentPath);

        window.location.href = loginPath;
    }
}

checkTokenAndRedirect();

const tokenCheckInterval = setInterval(checkTokenAndRedirect, 1000);

window.addEventListener('unload', () => {
    clearInterval(tokenCheckInterval);
});