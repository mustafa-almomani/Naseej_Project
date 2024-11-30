async function loadTestimonials() {
    const tableBody = document.getElementById('testimonialTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');

    try {
        loadingIndicator.style.display = 'block';  // Show loading spinner

        const response = await fetch('http://localhost:25025/api/Testimonials/GetTestimonialAdmin');
        if (!response.ok) {
            throw new Error(`Failed to fetch testimonials: ${response.status}`);
        }

        const testimonials = await response.json();
        tableBody.innerHTML = ''; // Clear any existing rows

        testimonials.forEach((testimonial, index) => {
            // Get the first 20 characters of the testimonial message
            const firstTwentyChars = testimonial.theTestimonials.substring(0, 60);
            const displayedText = firstTwentyChars.length < testimonial.theTestimonials.length ? firstTwentyChars + '...' : firstTwentyChars;

            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${testimonial.firstname} ${testimonial.lastname}</td>
                <td>${testimonial.email}</td>
                <td>${displayedText}</td> <!-- Display first 20 characters -->
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewDetails(${testimonial.id})">Details</button>
                    <button class=" admin-only btn btn-success btn-sm " onclick="acceptTestimonial(${testimonial.id})">Accept</button>
                    <button class=" admin-only btn btn-danger btn-sm " onclick="deleteTestimonial(${testimonial.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading testimonials:', error);
    } finally {
        loadingIndicator.style.display = 'none';  // Hide loading spinner
    }
}


async function viewDetails(id) {
    try {
        // Fetch the specific testimonial details by ID
        const response = await fetch(`http://localhost:25025/api/Testimonials/GetTestimonial/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch testimonial details: ${response.status}`);
        }

        const testimonial = await response.json();

        // Display SweetAlert with full testimonial details
        Swal.fire({
            title: 'Testimonial Details',
            html: `
        <strong>Full Name:</strong> ${testimonial.firstname} ${testimonial.lastname}<br>
        <strong>Email:</strong> ${testimonial.email}<br>
        <strong>Message:</strong> <p style="text-align: justify;">${testimonial.theTestimonials}</p>
    `,
            icon: 'info',
            confirmButtonText: 'Close'
        });

    } catch (error) {
        console.error('Error fetching testimonial details:', error);
        Swal.fire('Error', 'Could not load testimonial details.', 'error');
    }
}

async function acceptTestimonial(id) {
    try {
        // Fetch the testimonial details to check if it is already accepted
        const response = await fetch(`http://localhost:25025/api/Testimonials/GetTestimonial/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch testimonial details: ${response.status}`);
        }

        const testimonial = await response.json();

        // Check if the testimonial is already accepted
        if (testimonial.Isaccepted) {
            // Show alert if the testimonial is already accepted
            Swal.fire({
                title: 'Already Accepted!',
                text: 'This testimonial has already been accepted.',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return; // Stop the function if already accepted
        }

        // Proceed to accept the testimonial if not already accepted
        const result = await Swal.fire({
            title: 'Accept Testimonial?',
            text: "Are you sure you want to accept this testimonial?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, accept it!'
        });

        if (result.isConfirmed) {
            // Proceed with the PUT request to accept the testimonial
            const acceptResponse = await fetch(`http://localhost:25025/api/Testimonials/AcceptTestimonial/${id}`, {
                method: 'PUT'
            });

            if (acceptResponse.ok) {
                Swal.fire('Accepted!', 'The testimonial has been accepted.', 'success');
                loadTestimonials(); // Reload the testimonials
            } else {
                throw new Error('Failed to accept testimonial');
            }
        }
    } catch (error) {
        Swal.fire('warning', 'This Testimonial has already been accepted before', 'warning');
        console.error(error);
    }
}






async function deleteTestimonial(id) {
    const result = await Swal.fire({
        title: 'Delete Testimonial?',
        text: "Are you sure you want to delete this testimonial?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:25025/api/Testimonials/DeleteTestimonial/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                Swal.fire('Deleted!', 'The testimonial has been deleted.', 'success');
                loadTestimonials();
            } else {
                throw new Error('Failed to delete testimonial');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred while deleting the testimonial.', 'error');
            console.error(error);
        }
    }
}

// Load testimonials when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', loadTestimonials);
