// Fetch and display all newsletters
async function fetchNewsletters() {
    try {
        const response = await fetch('http://localhost:25025/api/NewsLatters');
        const data = await response.json();

        const tableBody = document.getElementById('newsletterTableBody');
        tableBody.innerHTML = '';

        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${item.userEmail}</td>
                <td>${new Date(item.createdDate).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-${item.status ? 'success' : 'warning'}">
                        ${item.status ? 'Replied' : 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm admin-only" onclick="openReplyModal(${item.id}, '${item.userEmail}')">
                        <i class="fas fa-reply"></i> News 
                    </button>
                    <button class="btn btn-danger btn-sm admin-only" onclick="deleteNewsletter(${item.id})">
                        <i class="fas fa-trash"></i> Delete Subscriber
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to load newsletters.',
            icon: 'error'
        });
    }
}

// Function to open reply modal for a specific newsletter
function openReplyModalForNewsletter(id, email) {
    // Validate inputs
    if (!id || !email) {
        console.error('Invalid newsletter data:', { id, email });
        Swal.fire({
            title: 'Error!',
            text: 'Invalid newsletter data',
            icon: 'error'
        });
        return;
    }

    try {
        const subscriberIdInput = document.getElementById('subscriberId');
        const subscriberEmailInput = document.getElementById('subscriberEmail');
        const replyMessageInput = document.getElementById('replyMessage');
        const modalElement = document.getElementById('replyOneModal');

        if (!subscriberIdInput || !subscriberEmailInput || !replyMessageInput || !modalElement) {
            throw new Error('Required modal elements not found');
        }

        // Set values
        subscriberIdInput.value = id;
        subscriberEmailInput.value = email;
        replyMessageInput.value = '';

        // Open modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Error opening reply modal:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to open reply modal',
            icon: 'error'
        });
    }
}

// For backwards compatibility, add this alias
const openReplyModal = openReplyModalForNewsletter;

// Function to send reply to specific newsletter
async function sendReplyToNewsletter() {
    let modal = null;

    try {
        // Get form elements
        const id = document.getElementById('subscriberId').value;
        const email = document.getElementById('subscriberEmail').value;
        const message = document.getElementById('replyMessage').value;

        // Validate inputs
        if (!id || !email) {
            throw new Error('Invalid newsletter data');
        }

        if (!message || !message.trim()) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a reply message.',
                icon: 'error'
            });
            return;
        }

        // Show loading
        // Show loading for one second
        const swalInstance = Swal.fire({
            title: 'Sending reply...',
            text: 'Please wait...',
            allowOutsideClick: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Set timeout for 1 second to stop loading
        setTimeout(async () => {
            swalInstance.close(); // Close the loading after 1 second
        }, 2000);

        // Send request
        const response = await fetch(`http://localhost:25025/api/NewsLatters/reply/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                adminReply: message.trim()
            })
        });

        // Handle response
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Show success message
        await Swal.fire({
            title: 'Success!',
            text: `Reply sent successfully to ${email}`,
            icon: 'success'
        });

        // Close modal and refresh data
        modal = bootstrap.Modal.getInstance(document.getElementById('replyOneModal'));
        if (modal) {
            modal.hide();
        }

        // Refresh the newsletters list if the function exists
        if (typeof fetchNewsletters === 'function') {
            await fetchNewsletters();
        }

    } catch (error) {
        console.error('Error sending reply:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to send reply: ' + error.message,
            icon: 'error'
        });
    }
}
// Delete newsletter
// Delete newsletter
async function deleteNewsletter(id) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            const response = await fetch(`http://localhost:25025/api/NewsLatters/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Newsletter subscription has been deleted.',
                    icon: 'success'
                });
                await fetchNewsletters();
            } else {
                // Log the response status and text for debugging
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(errorText || 'Failed to delete newsletter');
            }

        }
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        await Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to delete newsletter.',
            icon: 'error'
        });
    }
}

// Add this helper function to check the response
async function checkResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response;
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchNewsletters();
});








// Function to open reply all modal with newsletters table
// Function to open reply all modal with newsletters table
async function openReplyAllModal() {
    try {
        const response = await fetch('http://localhost:25025/api/NewsLatters');
        const newsletters = await response.json();

        if (newsletters.length === 0) {
            await Swal.fire({
                title: 'Info',
                text: 'There are no subscribers in the list.',
                icon: 'info'
            });
            return;
        }

        // Create table rows for all newsletters, without status check
        const newslettersListHTML = newsletters.map((newsletter, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${newsletter.userEmail}</td>
                <td>${new Date(newsletter.createdDate).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-${newsletter.status ? 'success' : 'warning'}">
                        ${newsletter.status ? 'Replied' : 'Pending'}
                    </span>
                </td>
                <td class="text-center">
                    <input type="checkbox" 
                           class="newsletter-checkbox" 
                           value="${newsletter.id}" 
                           checked
                           onchange="updateSelectedCount()">
                </td>
            </tr>
        `).join('');

        // Update the modal content
        document.getElementById('newslettersList').innerHTML = newslettersListHTML;
        document.getElementById('pendingCount').value = `${newsletters.length} subscribers total`;
        document.getElementById('replyAllMessage').value = '';

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('replyAllModal'));
        modal.show();

        // Update the selected count
        updateSelectedCount();

    } catch (error) {
        console.error('Error loading newsletters:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to load newsletters: ' + error.message,
            icon: 'error'
        });
    }
}

// Function to update selected count
function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.newsletter-checkbox:checked').length;
    document.getElementById('pendingCount').value = `${selectedCount} subscribers selected`;
}

// Function to toggle all checkboxes
function toggleAllNewsletters() {
    const checkboxes = document.querySelectorAll('.newsletter-checkbox');
    const anyUnchecked = Array.from(checkboxes).some(cb => !cb.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = anyUnchecked;
    });

    updateSelectedCount();
}

// Function to send replies to selected newsletters
async function sendReplyAll() {
    try {
        const message = document.getElementById('replyAllMessage').value;
        const selectedIds = Array.from(document.querySelectorAll('.newsletter-checkbox:checked'))
            .map(checkbox => parseInt(checkbox.value));

        if (!message.trim()) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a reply message.',
                icon: 'error'
            });
            return;
        }

        if (selectedIds.length === 0) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please select at least one subscriber.',
                icon: 'error'
            });
            return;
        }

        // Confirm before sending
        const result = await Swal.fire({
            title: 'Confirm',
            html: `
                <div class="text-start">
                    <p>You are about to send this reply to ${selectedIds.length} subscribers:</p>
                    <div class="alert alert-info">
                        ${message}
                    </div>
                    <p class="text-warning mt-2">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Note: This will update all selected subscribers, including those who have already received replies.
                    </p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, send to all selected',
            cancelButtonText: 'Cancel',
            width: '600px'
        });

        if (!result.isConfirmed) {
            return;
        }

        // Show loading with progress
        let completed = 0;
        let failed = 0;
        const totalCount = selectedIds.length;

        Swal.fire({
            title: 'Sending replies...',
            html: `
                Progress: 0/${totalCount}<br>
                <small class="text-muted">Sending messages to all selected subscribers...</small>
            `,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Send replies sequentially to show progress
        for (const id of selectedIds) {
            try {
                const response = await fetch(`http://localhost:25025/api/NewsLatters/reply/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        adminReply: message
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to send to ID ${id}`);
                }

                completed++;
            } catch (err) {
                failed++;
                console.error(`Error sending to ID ${id}:`, err);
            }

            Swal.update({
                html: `
                    Progress: ${completed}/${totalCount}<br>
                    ${failed > 0 ? `<small class="text-danger">Failed: ${failed}</small><br>` : ''}
                    <small class="text-muted">Processing messages...</small>
                `
            });
        }

        // Show final status
        await Swal.fire({
            title: completed > 0 ? 'Success!' : 'Error!',
            html: `
                Replies sent to ${completed} subscribers.<br>
                ${failed > 0 ? `<span class="text-danger">Failed: ${failed}</span>` : ''}
            `,
            icon: completed > 0 ? 'success' : 'error'
        });

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('replyAllModal'));
        modal.hide();
        await fetchNewsletters();

    } catch (error) {
        console.error('Error sending replies:', error);
        await Swal.fire({
            title: 'Error!',
            text: 'Failed to send replies: ' + error.message,
            icon: 'error'
        });
    }
}