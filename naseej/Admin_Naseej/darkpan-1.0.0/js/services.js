// Function to parse JWT and extract payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const payload = JSON.parse(jsonPayload);
    console.log("Parsed JWT payload:", payload);
    return payload;
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}

// Function to check if user is admin
function isUserAdmin() {
  const token = sessionStorage.getItem("Token");
  if (!token) return false;

  const payload = parseJwt(token);
  return payload?.isAdmin === "True";
}

// Function to get current user's full name
function getCurrentUserFullName() {
  const token = sessionStorage.getItem("Token");
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.fullName;
}

// Function to retrieve employeeId from token
function getEmployeeIdFromToken() {
  const token = sessionStorage.getItem("Token");
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.sub;
}

// Fetch all services and display them
// Fetch all services and display them
async function fetchCardData() {
  try {
    const url = "http://localhost:25025/api/services/getallservices";
    const response = await fetch(url);
    const data = await response.json();

    const employeeId = getEmployeeIdFromToken();
    const isAdmin = isUserAdmin();
    const currentUserFullName = getCurrentUserFullName();

    console.log({
      employeeId,
      isAdmin,
      currentUserFullName,
      tokenPayload: parseJwt(sessionStorage.getItem("Token"))
    });

    if (employeeId) {
      document.getElementById("EmployeeId").value = employeeId;
    }

    const cardContainer = document.getElementById("container");
    let cardsHtml = "";

    // Get creator names for all services
    const creatorNames = new Map();
    for (const product of data) {
      try {
        const creatorResponse = await fetch(`http://localhost:25025/api/Empolyees/${product.employeeId}`);
        if (creatorResponse.ok) {
          const creatorData = await creatorResponse.json();
          creatorNames.set(product.employeeId, creatorData.fullName);
        }
      } catch (err) {
        console.error(`Failed to fetch creator name for service ${product.serviceId}:`, err);
      }
    }

    data.forEach((product) => {
      const productEmployeeId = String(product.employeeId);
      const loggedInEmployeeId = String(employeeId);
      const canEdit = isAdmin || productEmployeeId === loggedInEmployeeId;
      const creatorName = creatorNames.get(product.employeeId) || 'Unknown';

      let editButton = '';
      let deleteButton = '';

      if (canEdit) {
        editButton = `<a href="#" class="btn btn-success mx-1" onclick="editservice(${product.serviceId})">
          <i class="fas fa-edit"></i> Edit</a>`;
        deleteButton = `<a href="#" class="btn btn-danger mx-1" onclick="confirmDelete(${product.serviceId})">
          <i class="fas fa-trash"></i> Delete</a>`;
      }

      cardsHtml += `
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="card service-card shadow h-100">
            <img src="http://localhost:25025/Uploads/${product.serviceImage}" class="card-img-top" alt="Service Image">
            <div class="card-body">
              <h5 class="card-title">${product.serviceName}</h5>
              <p class="card-text"><strong>Description:</strong> ${product.serviceDescription}</p>
              <p class="card-text"><strong>Age:</strong> from ${product.fromage} to ${product.toage}</p>
              ${isAdmin ? `
                <p class="card-text">
                  <small class="text-muted fw-bold">Created by:<strong> ${creatorName} </strong></small>
                </p>` : ''}
            </div>
            <div class="card-footer text-center">
              <select onchange="editstatus(${product.serviceId})" id="status-${product.serviceId}" 
                      class="admin-only form-select bg-custom text-dark form-select-sm mb-3"
                      ${!canEdit ? 'disabled' : ''}>
                <option value="Pinding" class="text-info" ${product.isAccept === 'Pinding' ? 'selected' : ''}>Pinding</option>
                <option value="Accept" class="text-success" ${product.isAccept === 'Accept' ? 'selected' : ''}>Accept</option>
              </select>
            </div>
            <div class="card-footer text-center">
              ${editButton}
              ${deleteButton}
              ${isAdmin ? `
                <div class="mt-2">
                </div>` : ''}
            </div>
          </div>
        </div>
      `;
    });

    cardContainer.innerHTML = cardsHtml;
  } catch (error) {
    console.error("Error fetching data:", error);
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to load services.',
      icon: 'error'
    });
  }
}

// Remove duplicate event listener
document.addEventListener('DOMContentLoaded', () => {
  fetchCardData();

  const token = sessionStorage.getItem("Token");
  if (token) {
    const payload = parseJwt(token);
    console.log("Initial token check:", {
      payload,
      isAdmin: payload?.isAdmin,
      employeeId: payload?.sub,
      fullName: payload?.fullName
    });
  }
});
// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchCardData();

  // Debug check - remove in production
  const token = sessionStorage.getItem("Token");
  if (token) {
    const payload = parseJwt(token);
    console.log("Initial token check:", {
      payload,
      isAdmin: payload?.isAdmin,
      employeeId: payload?.sub
    });
  }
});
// Rest of your code remains the same...  

// Modify the edit check in editservice function
async function editservice(id) {
  try {
    var urll1 = `http://localhost:25025/api/services/serviceById/${id}`;
    var response = await fetch(urll1);
    var service = await response.json();

    // Check if user is admin or owner
    const employeeId = getEmployeeIdFromToken();
    const isAdmin = isUserAdmin();

    if (!isAdmin && String(service.employeeId) !== String(employeeId)) {
      await Swal.fire({
        title: "Unauthorized",
        text: "You can only edit your own services",
        icon: "error"
      });
      return;
    }

    document.getElementById("editEmployeeId").value = service.serviceId;
    document.getElementById("ServiceName").value = service.serviceName;
    document.getElementById("ServiceDescription").value = service.serviceDescription;
    document.getElementById("batool").src = `http://localhost:25025/Uploads/${service.serviceImage}`;

    $("#editEmployeeModal").modal("show");
  } catch (error) {
    console.error('Error:', error);
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to load service details.',
      icon: 'error'
    });
  }
}

// Modify the delete check in deleteservices function
async function deleteservices(id) {
  try {
    const checkResponse = await fetch(`http://localhost:25025/api/services/getservicesbyid/${id}`);
    const service = await checkResponse.json();

    const employeeId = getEmployeeIdFromToken();
    const isAdmin = isUserAdmin();

    if (!isAdmin && String(service.employeeId) !== String(employeeId)) {
      await Swal.fire({
        title: "Unauthorized",
        text: "You can only delete your own services",
        icon: "error"
      });
      return;
    }

    const deleteUrl = `http://localhost:25025/api/services/deleteservices/${id}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      await Swal.fire({
        title: 'Deleted!',
        text: 'Service has been deleted.',
        icon: 'success'
      });
      location.reload();
    } else {
      throw new Error(`HTTP error! status: ${deleteResponse.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to delete the service.',
      icon: 'error'
    });
  }
}

// Edit service function
async function editservice(id) {
  var urll1 = `http://localhost:25025/api/services/serviceById/${id}`;
  var response = await fetch(urll1);
  var employee = await response.json();

  document.getElementById("editEmployeeId").value = employee.serviceId;
  document.getElementById("ServiceName").value = employee.serviceName;
  document.getElementById("ServiceDescription").value =
    employee.serviceDescription;
  document.getElementById("batool").src = `http://localhost:25025/Uploads/${employee.serviceImage}`;

  $("#editEmployeeModal").modal("show");
}

async function updateservice() {
  var id = document.getElementById("editEmployeeId").value;
  var url2 = `http://localhost:25025/api/services/editservices/${id}`;
  var formData = new FormData(document.getElementById("serviceEditForm"));

  // طباعة بيانات النموذج

  var response = await fetch(url2, {
    method: "PUT",
    body: formData,
  });


  if (response.ok) {
    await Swal.fire({
      title: "Success!",
      text: "service updated successfully.",
      icon: "success",
    });

    $("#editEmployeeModal").modal("hide"); // إغلاق المودال بعد التحديث
    // الانتظار قبل إعادة تحميل الصفحة
    setTimeout(() => {
      location.reload();
    }, 1000); // الانتظار لمدة 1 ثانية قبل إعادة تحميل الصفحة
  } else {
    const errorMessage = await response.text();
    await Swal.fire({
      title: "Error!",
      text: `Failed to update service: ${errorMessage}`,
      icon: "error",
    });
  }
}

// Confirm delete function
async function confirmDelete(id) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    await deleteservices(id);
  }
}

// Delete service function
async function deleteservices(id) {
  try {
    // First check if user owns the service
    const checkResponse = await fetch(`http://localhost:25025/api/services/getservicesbyid/${id}`);
    const service = await checkResponse.json();

    const employeeId = getEmployeeIdFromToken();
    if (String(service.employeeId) !== String(employeeId)) {
      await Swal.fire({
        title: "Unauthorized",
        text: "You can only delete your own services",
        icon: "error"
      });
      return;
    }

    // Proceed with deletion
    const deleteUrl = `http://localhost:25025/api/services/deleteservices/${id}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      await Swal.fire({
        title: 'Deleted!',
        text: 'Your service has been deleted.',
        icon: 'success'
      });
      // Refresh the page to show updated list
      location.reload();
    } else {
      throw new Error(`HTTP error! status: ${deleteResponse.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to delete the service.',
      icon: 'error'
    });
  }
}

// Initialize the page
// Initialize the page
fetchCardData();




















const url = "http://localhost:25025/api/services";
async function addservice() {
  debugger
  event.preventDefault();
  
  const employeeId = getEmployeeIdFromToken();
  if (!employeeId) {
      Swal.fire({
          title: "Error!",
          text: "Employee ID not found",
          icon: "error",
          confirmButtonText: "OK",
      });
      return;
  }

  document.getElementById("EmployeeId").value = employeeId;

  const form = document.getElementById("addservice");
  const formData = new FormData(form);
  formData.append("EmployeeId", employeeId);

  const response = await fetch(url, {
      method: "POST",
      body: formData,
  });

  if (response.ok) {
      Swal.fire({
          title: "Success!",
          text: "Service has been added successfully",
          icon: "success",
          confirmButtonText: "OK",
          timer: 3000,
      });
      setTimeout(() => {
          window.location.href = "table.html";
      }, 2000);
  } else {
      Swal.fire({
          title: "Error!",
          text: "Service has not been added",
          icon: "error",
          confirmButtonText: "OK",
      });
  }
}

  
  async function deleteservices(id) {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This employee will be deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
    
      if (result.isConfirmed) {
        var delet = `http://localhost:25025/api/services/deleteservicesid/${id}`;
        var response = await fetch(delet, {
          method: "DELETE",
        });
    
        // console.log("Response Status:", response.status);
        // console.log("Response OK:", response.ok);
    
        if (response.ok) {
          await Swal.fire(
            "Deleted!",
            "The employee has been deleted successfully.",
            "success"
          );
          location.reload();
        } else {
          const errorMessage = await response.text();
          await Swal.fire(
            "Error!",
            `There was an error deleting the employee: ${errorMessage}`,
            "error"
          );
        }
      }
    }
  
  
  
    
  
    
  
  
    async function editstatus(id) {
      event.preventDefault();
      debugger;
      let urlm = `http://localhost:25025/api/services/editorder/${id}`;
      let newStatus = document.getElementById(`status-${id}`).value;
    
      let response = await fetch(urlm, {
        method: "PUT",
        body: JSON.stringify({
          isAccept: newStatus,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      if (response.status == 200) {
        Swal.fire({
          title: "Success!",
          text: "Status updated successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
    
        let order = allOrders.find((order) => order.serviceId === id);
        if (order) {
          order.isAccept = newStatus;
        }
    
        displayOrders(allOrders);
      } else {
        Swal.fire({
          title: "Error!",
          text: "Error updating status",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    }
    
  
  
  
  
  

    