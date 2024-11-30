// Function to parse JWT token
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// Function to initialize form with user data from session storage
function initializeForm() {
    const token = sessionStorage.getItem('jwtToken'); // Get JWT from session storage
    if (!token) {
        console.error('No JWT found in session storage');
        return;
    }

    const userData = parseJWT(token);
    if (userData) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');

        // Set full name (combining given name and surname)
        const fullName = `${userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']} ${userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']}`;
        nameInput.value = fullName;
        nameInput.disabled = true;

        // Set email and make it disabled
        emailInput.value = userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        emailInput.disabled = true;
    }
}

// Call initializeForm when the document loads
document.addEventListener('DOMContentLoaded', initializeForm);

// Modified form submission handler
document.getElementById('contact-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);

    try {
        const response = await fetch('http://localhost:25025/api/Contact/PostMessage', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            await Swal.fire({
                title: 'Success!',
                text: 'Message sent successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            window.location.reload();
        } else {
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to send message.',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
            console.error('Failed response:', response);
        }
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Error sending message.',
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
});