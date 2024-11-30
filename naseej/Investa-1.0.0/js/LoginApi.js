// registeration function start here 
async function registerUser() {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);

    // Create a JSON object from form data
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phoneNumber: formData.get('phoneNumber'),
        age: formData.get('age'),
        nationality: formData.get('nationality'),
        degree: formData.get('degree'),
        governorate: formData.get('governorate'),
        passwordHash: formData.get('password'),
        email: formData.get('email'),
    };

    // Validate that degree and governorate are selected
    if (!data.degree || !data.governorate) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Failed',
            text: 'Please select both educational level and governorate.',
            confirmButtonText: 'OK'
        });
        return; // Exit if validation fails
    }

    try {
        const response = await fetch('http://localhost:25025/api/login/Register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            // Show success message using SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: result.message || 'You have successfully registered.',
                confirmButtonText: 'OK'
            }).then(() => {
                // Automatically check the checkbox to navigate to the login form
                document.getElementById('chk').checked = true; // This triggers the switch to the login form
            });
        } else {
            const error = await response.json();
            // Show error message using SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: error.message || 'There was an issue with your registration.',
                confirmButtonText: 'Try Again'
            });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        // Show error message for unexpected issues
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
}
// registration function end here 





async function loginUser() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    const data = {
        email: formData.get('email'),
        passwordHash: formData.get('password')
    };

    try {
        console.log('Sending login request with data:', data); // Debug log

        const response = await fetch('http://localhost:25025/api/login/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'  // Add this line
            },
            body: JSON.stringify(data)
        });

        console.log('Raw response:', response); // Debug log

        if (response.ok) {
            const result = await response.json();
            console.log('Login response:', result); // Debug log

            // Check if token exists and is not undefined
            if (result.token) {  // Note: might be 'token' instead of 'Token'
                sessionStorage.setItem('jwtToken', result.token);
                console.log('Token stored:', result.token); // Debug log
                console.log('SessionStorage after storing:', sessionStorage.getItem('jwtToken')); // Verify storage
            } else {
                console.log('No token found in response'); // Debug log
            }

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You have successfully logged in!',
                confirmButtonText: 'OK'
            }).then(() => {
                if (document.referrer) {
                    window.location.href = document.referrer;
                } else {
                    window.location.href = 'index.html';
                }            });
        } else {
            const error = await response.json();
            console.log('Error response:', error); // Debug log
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message || 'Invalid email or password.',
                confirmButtonText: 'Try Again'
            });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
}

