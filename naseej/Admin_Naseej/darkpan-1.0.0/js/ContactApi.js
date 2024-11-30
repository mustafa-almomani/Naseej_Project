// Function to fetch data and populate the table
async function fetchDataAndPopulateTable() {
    try {
        // Make the API request
        const response = await fetch('http://localhost:25025/api/Contact/GetAllMessage'); // Your API endpoint
        const data = await response.json();

        // Get the table body element
        const tbody = document.querySelector('#contactTable tbody');

        // Clear any existing rows in the table
        tbody.innerHTML = '';

        // Loop through the data and insert rows into the table
        data.forEach((contact, index) => {
            const row = document.createElement('tr');

            // Create cells for each data field
            const idCell = document.createElement('th');
            idCell.setAttribute('scope', 'row');
            idCell.textContent = contact.contactId;

            const firstNameCell = document.createElement('td');
            firstNameCell.textContent = contact.name.split(' ')[0]; // Assuming 'name' is full name

            const emailCell = document.createElement('td');
            emailCell.textContent = contact.email;

            const subjectCell = document.createElement('td');
            subjectCell.textContent = contact.subject;

            const messageCell = document.createElement('td');
            messageCell.textContent = contact.message;

            // Create the 'Reply' button
            const replyCell = document.createElement('td');
            const replyButton = document.createElement('button');
            replyButton.classList.add('btn', 'btn-primary', 'admin-only'); // Bootstrap styling
            replyButton.textContent = 'Reply';

            // Attach event listener to the button
            replyButton.addEventListener('click', () => handleReply(contact.contactId, contact.name, contact.email, contact.subject));

            // Append the 'Reply' button to the action cell
            replyCell.appendChild(replyButton);

            // Append cells to the row
            row.appendChild(idCell);
            row.appendChild(firstNameCell);
            row.appendChild(emailCell);
            row.appendChild(subjectCell);
            row.appendChild(messageCell);
            row.appendChild(replyCell); // Append the reply action cell

            // Append the row to the table body
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to handle the reply action (open modal and populate fields)
function handleReply(contactId, name, email, subject) {
    // Set the form values inside the modal
    document.getElementById('email').value = email;
    document.getElementById('subject').value = subject;

    // Store the contact ID for later use (for API request)
    localStorage.setItem('selectedContactId', contactId);

    // Show the modal
    const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));
    replyModal.show();
}

// Handle form submission inside the modal
async function handleSubmit(event) {
    event.preventDefault();

    const selectedContactId = localStorage.getItem('selectedContactId');
    const replyMessage = document.getElementById('replayMessage').value;
    const recipientEmail = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;

    if (!replyMessage.trim()) {
        await Swal.fire({
            title: 'Warning',
            text: 'Please enter a reply message',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Create FormData to match API structure
    const formData = new FormData();
    formData.append('ContactId', selectedContactId);
    formData.append('Email', recipientEmail);
    formData.append('Subject', `Reply: ${subject}`);
    formData.append('Message', '');  // Original message content; adjust if needed
    formData.append('MessageReply', replyMessage);

    try {
        // Send the reply to the backend API
        const response = await fetch('http://localhost:25025/api/Contact/PostMessageToEmail', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to send reply message');
        }

        // Clear the form and confirm success
        document.getElementById('replayMessage').value = '';
        const replyModal = new bootstrap.Modal(document.getElementById('replyModal'));
        replyModal.hide();  // Close the modal after sending the reply

        await Swal.fire({
            title: 'Success',
            text: 'Reply sent successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error('Error sending reply:', error);
        await Swal.fire({
            title: 'Error',
            text: 'Failed to send reply. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Call the function when the page loads
window.onload = () => {
    fetchDataAndPopulateTable();
    // Attach form submit listener
    document.getElementById('Reply-form').addEventListener('submit', handleSubmit);
};
