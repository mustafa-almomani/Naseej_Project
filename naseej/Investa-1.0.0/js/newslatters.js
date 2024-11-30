async function subscribe() {
    try {
        // Get the email input
        const emailInput = document.getElementById('userEmail');
        const email = emailInput.value.trim();

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter your email address.',
                icon: 'error'
            });
            return;
        }

        if (!emailPattern.test(email)) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a valid email address.',
                icon: 'error'
            });
            return;
        }

        // Disable button and show loading state
        const subscribeButton = document.getElementById('subscribeButton');
        subscribeButton.disabled = true;
        subscribeButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';

        // Send the subscription request
        const response = await fetch('http://localhost:25025/api/NewsLatters/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email)  // Send just the email string
        });

        // Reset button state
        subscribeButton.disabled = false;
        subscribeButton.innerHTML = 'Subscribe';

        if (response.ok) {
            // Show success message
            await Swal.fire({
                title: 'Success!',
                text: 'Thank you for subscribing to our newsletter!',
                icon: 'success'
            });

            // Clear the input field
            emailInput.value = '';
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Subscription error:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to subscribe. Please try again later.',
            icon: 'error'
        });
    }
}

// Add enter key support for the email input
document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('userEmail');
    if (emailInput) {
        emailInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                subscribe();
            }
        });
    }
});