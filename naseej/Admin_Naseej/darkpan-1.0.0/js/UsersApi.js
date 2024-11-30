// Global variables for pagination
let currentPage = 1;
const usersPerPage = 10;
let totalUsers = [];

document.addEventListener('DOMContentLoaded', fetchAndDisplayUsers);

async function fetchAndDisplayUsers() {
    const tableBody = document.getElementById('userTableBody');

    if (!tableBody) {
        console.error("Error: Table body element with id 'userTableBody' not found.");
        return;
    }

    try {
        const response = await fetch('http://localhost:25025/api/Users');
        if (!response.ok) {
            throw new Error("Failed to fetch data from the API");
        }

        totalUsers = await response.json();
        displayUsersPage(currentPage);
        setupPagination();

    } catch (error) {
        console.error("Error fetching and displaying data:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Error loading users data. Please try again later.
                </td>
            </tr>
        `;
    }
}

function displayUsersPage(page) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    // Calculate start and end index for current page
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, totalUsers.length);
    const paginatedUsers = totalUsers.slice(startIndex, endIndex);

    paginatedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        const formattedJoinDate = user.joinDate ?
            new Date(user.joinDate).toISOString().split('T')[0] : 'N/A';

        const cells = [
            startIndex + index + 1,         // Row number
            user.firstName || 'N/A',
            user.lastName || 'N/A',
            user.email || 'N/A',
            user.phoneNumber || 'N/A',
            user.nationality || 'N/A',
            user.degree || 'N/A',
            user.governorate || 'N/A',
            formattedJoinDate
        ];

        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}
function setupPagination() {
    const totalPages = Math.ceil(totalUsers.length / usersPerPage);

    // Get the group container
    const groupContainer = document.getElementById('grop');
    if (!groupContainer) {
        console.error("Error: Element with id 'grop' not found");
        return;
    }

    // Clear existing content
    groupContainer.innerHTML = '';

    // Create pagination controls
    const paginationControls = document.createElement('div');
    paginationControls.className = 'btn-group';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.className = 'btn btn-sm btn-outline-light';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsersPage(currentPage);
            setupPagination();
        }
    };
    paginationControls.appendChild(prevButton);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `btn btn-sm ${currentPage === i ? 'btn-light' : 'btn-outline-light'}`;
        pageButton.onclick = () => {
            currentPage = i;
            displayUsersPage(currentPage);
            setupPagination();
        };
        paginationControls.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.className = 'btn btn-sm btn-outline-light';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsersPage(currentPage);
            setupPagination();
        }
    };
    paginationControls.appendChild(nextButton);

    // Add pagination controls to the group container
    groupContainer.appendChild(paginationControls);
}

// Updated CSS styles
const styles = `
<style>

#grop {
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    margin-top: 1rem;
    margin-right: 3%;
}

.btn-group {
    margin: 0 2px;
    display: flex;
    gap: 2px;
}

.btn-group .btn {
    margin: 0;
}

.btn-group .btn:first-child {
    border-top-left-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
}

.btn-group .btn:last-child {
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
}

.btn-outline-light:hover:not(:disabled) {
    color: #000;
    background-color: #fff;
}

.btn-light {
    color: #000;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', styles);








// Update the search function
async function searchRequests(searchTerm) {
    try {
        // Show loading modal
        const modal = new bootstrap.Modal(document.getElementById('requestsModal'));
        modal.show();

        const modalBody = document.getElementById('modalRequestsBody');
        modalBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2 text-muted">Loading requests...</div>
                </td>
            </tr>
        `;

        const response = await fetch(`http://localhost:25025/api/Users/search?searchTerm=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Search failed');
        }

        displaySearchResults(result.data);

    } catch (error) {
        console.error('Error searching requests:', error);
        const modalBody = document.getElementById('modalRequestsBody');
        modalBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center p-4">
                    <div class="text-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${error.message || 'Error loading requests'}
                    </div>
                </td>
            </tr>
        `;
    }
}

// Function to display search results in modal
function displaySearchResults(requests) {
    const modalBody = document.getElementById('modalRequestsBody');
    const modalTitle = document.getElementById('requestsModalLabel');

    if (!requests || requests.length === 0) {
        modalBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center p-4">
                    <div class="text-muted">
                        <i class="fas fa-search me-2"></i>
                        No requests found for this user
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Update modal title with user info
    modalTitle.textContent = `Requests for ${requests[0].userName} (${requests[0].userEmail})`;

    modalBody.innerHTML = '';
    requests.forEach((request) => {
        const formattedDate = request.requestDate ?
            new Date(request.requestDate).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.requestId}</td>
            <td>
                <span class="badge bg-primary">
                    ${escapeHtml(request.serviceName)}
                </span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <span class="text-truncate d-inline-block" style="max-width: 300px;" 
                      title="${escapeHtml(request.description)}">
                    ${escapeHtml(request.description || 'No description')}
                </span>
            </td>
        `;
        modalBody.appendChild(row);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    // Search button click handler
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length >= 2) {
            searchRequests(searchTerm);
        } else {
            Swal.fire({
                title: 'Invalid Search',
                text: 'Please enter at least 2 characters to search',
                icon: 'warning'
            });
        }
    });

    // Enter key handler
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length >= 2) {
                searchRequests(searchTerm);
            } else {
                Swal.fire({
                    title: 'Invalid Search',
                    text: 'Please enter at least 2 characters to search',
                    icon: 'warning'
                });
            }
        }
    });
});
// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add these styles

// Add styles to document
document.head.insertAdjacentHTML('beforeend', styles);