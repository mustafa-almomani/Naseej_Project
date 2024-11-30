

    function createEmployeeCard(employee) {
                    return `
    <div class="col-sm-6 col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
        <div class="team-item rounded">
            <div class="team-img">
                <img src="http://localhost:25025/${employee.image}" class="img-fluid w-100 rounded-top" alt="${employee.fullName}">
                    ${employee.isAdmin ? `
                            <div class="team-icon">
                                <a class="btn btn-primary btn-sm-square text-white rounded-circle mb-3" href=""><i
                                        class="fas fa-share-alt"></i></a>
                                <div class="team-icon-share">
                                    <a class="btn btn-primary btn-sm-square text-white rounded-circle mb-3" href=""><i
                                            class="fab fa-facebook-f"></i></a>
                                    <a class="btn btn-primary btn-sm-square text-white rounded-circle mb-3" href=""><i
                                            class="fab fa-twitter"></i></a>
                                    <a class="btn btn-primary btn-sm-square text-white rounded-circle mb-0" href=""><i
                                            class="fab fa-instagram"></i></a>
                                </div>
                            </div>
                            ` : ''}
            </div>
            <div class="team-content bg-dark text-center rounded-bottom p-4">
                <div class="team-content-inner rounded-bottom">
                    <h4 class="text-white">${employee.fullName}</h4>
                    <p class="text-muted mb-0">${employee.isAdmin ? 'Owner' : 'Team Member'}</p>
                </div>
            </div>
        </div>
    </div>
    `;
                }

    // Fetch and display employees
    async function fetchAndDisplayEmployees() {
                    try {
                        const response = await fetch('http://localhost:25025/api/Empolyees');
    const employees = await response.json();

    const adminContainer = document.getElementById('adminContainer');
    const employeeContainer = document.getElementById('employeeContainer');

    // Clear existing content
    adminContainer.innerHTML = '';
    employeeContainer.innerHTML = '';

                        // Separate and display employees
                        employees.forEach(employee => {
                            if (employee.isAdmin) {
        adminContainer.innerHTML += createEmployeeCard(employee);
                            } else {
        employeeContainer.innerHTML += createEmployeeCard(employee);
                            }
                        });
                    } catch (error) {
        console.error('Error fetching employees:', error);
                    }
                }

    // Call the function when the page loads
    document.addEventListener('DOMContentLoaded', fetchAndDisplayEmployees);
