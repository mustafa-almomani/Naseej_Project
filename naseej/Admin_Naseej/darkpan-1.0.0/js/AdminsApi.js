// start display all admins function here

fetch("http://localhost:25025/api/Empolyees")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch admins");
    }
    return response.json();
  })
  .then((data) => {
    const tableBody = document.getElementById("adminTableBody");
    tableBody.innerHTML = ""; // Clear any existing rows

    // Iterate over the data and create table rows
    data.forEach((admin) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = admin.fullName;

      const emailCell = document.createElement("td");
      emailCell.textContent = admin.email;

      const roleCell = document.createElement("td");
      roleCell.textContent = admin.isAdmin ? "Super Admin" : "Admin";

      const imageCell = document.createElement("td");
      if (admin.image) {
        const img = document.createElement("img");
        img.src = `http://localhost:25025/${admin.image}`; // Full path to image
        img.alt = admin.fullName;
        img.style.width = "35px"; // Adjust image size as needed
        img.style.height = "35px";
        img.style.borderRadius = "50px";
        imageCell.appendChild(img);
      } else {
        imageCell.textContent = "No image available";
      }

      // Append cells to the row
      row.appendChild(nameCell);
      row.appendChild(emailCell);
      row.appendChild(imageCell);
      row.appendChild(roleCell);

      // Append the row to the table body
      tableBody.appendChild(row);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("There was an error fetching the admin data.");
  });

// end function display all admins

// function to add admins
document
  .getElementById("addAdminForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document
      .getElementById("exampleInputEmail1")
      .value.trim()
      .toLowerCase();
    // Rest of your existing add admin code...
    // Step 1: Check if the email exists
    const emailExists = await fetch(
      `http://localhost:25025/api/Empolyees/CheckEmailExists?email=${encodeURIComponent(
        email
      )}`
    )
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error checking email:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "There was an error checking the email: " + error,
          confirmButtonText: "Try Again",
        });
        return true; // Return true to prevent form submission if there's an error
      });

    if (emailExists) {
      // Show error if email already exists
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An employee with this email already exists. Please use a different email.",
        confirmButtonText: "OK",
      });
      return; // Exit the function if the email exists
    }

    // Step 2: Create a FormData object to capture the form data
    let formData = new FormData();
    formData.append(
      "FullName",
      document.getElementById("exampleInputName").value
    );
    formData.append("Email", email); // Use normalized email
    formData.append(
      "PasswordHash",
      document.getElementById("exampleInputPassword1").value
    );

    // Step 3: Append the image file
    let imageFile = document.getElementById("formFile").files[0];
    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    // Step 4: Send the form data using fetch API
    fetch("http://localhost:25025/api/Empolyees", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }
        return response.json();
      })
      .then((data) => {
        console.log("Admin added successfully:", data);
        Swal.fire({
          icon: "success",
          title: "Admin added successfully!",
          text: "The new admin has been added successfully.",
          confirmButtonText: "OK",
        }).then(() => {
          // Refresh the page after the user clicks "OK"
          location.reload();
        });
        document.getElementById("addAdminForm").reset();
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "There was an error with the submission: " + error,
          confirmButtonText: "Try Again",
        });
      });
  });

// function end here

// Populate the dropdown on page load
document.addEventListener("DOMContentLoaded", () => {
  populateEmployeeDropdowns();
});

// Populate both dropdowns with employees
// Populate both dropdowns with employees, excluding admins from the delete dropdown
function populateEmployeeDropdowns() {
  fetch("http://localhost:25025/api/Empolyees")
    .then((response) => response.json())
    .then((data) => {
      const editDropdown = document.getElementById("employeeDropdown");
      const deleteDropdown = document.getElementById("adminDropdown");

      if (!editDropdown || !deleteDropdown) {
        console.error("Dropdown elements not found");
        return;
      }

      // Reset the dropdowns
      editDropdown.innerHTML = '<option value="">Select an Admin</option>';
      deleteDropdown.innerHTML =
        '<option value="">-- Select an Admin --</option>';

      data.forEach((employee) => {
        const optionEdit = document.createElement("option");
        const optionDelete = document.createElement("option");

        // Set option values and text content for edit dropdown
        optionEdit.value = employee.employeeId;
        optionEdit.textContent = `${employee.fullName} (${employee.email})`;
        editDropdown.appendChild(optionEdit);

        // Only add to delete dropdown if employee is not an admin
        if (!employee.isAdmin) {
          optionDelete.value = employee.employeeId;
          optionDelete.textContent = `${employee.fullName} (${employee.email})`;
          deleteDropdown.appendChild(optionDelete);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching employee data:", error);
    });
}

// start edit admins function
document.addEventListener("DOMContentLoaded", function () {
  const employeeDropdown = document.getElementById("employeeDropdown");
  const form = document.getElementById("EditEmployeeForm");

  // Handle employee selection to populate form fields
  employeeDropdown.addEventListener("change", function () {
    const selectedEmployeeId = employeeDropdown.value;
    if (!selectedEmployeeId) return; // Do nothing if no employee is selected

    fetch(`http://localhost:25025/api/Empolyees/${selectedEmployeeId}`)
      .then((response) => response.json())
      .then((employee) => {
        // Populate form fields with employee details
        document.getElementById("EditEmployeeName").value = employee.fullName;
        document.getElementById("EditEmployeeEmail1").value = employee.email;
        // Do not pre-fill password for security reasons
      })
      .catch((error) =>
        console.error("Error fetching employee details:", error)
      );
  });

  // Form submission logic (to handle updates)
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    // Append selected employee ID to form data for the update endpoint
    const selectedEmployeeId = employeeDropdown.value;
    if (!selectedEmployeeId) return alert("Please select an employee to edit.");

    fetch(`http://localhost:25025/api/Empolyees/${selectedEmployeeId}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => Promise.reject(text));
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return {}; // Handle empty or non-JSON response
        }
      })
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: "Employee updated successfully!",
          text: "The employee details have been updated.",
          confirmButtonText: "OK",
        }).then(() => {
          // Refresh the page after the user clicks "OK"
          location.reload();
        });
        form.reset();
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `There was an error with the update: ${error}`,
          confirmButtonText: "Try Again",
        });
      });
  });
});

// end edit admins function
// Handle Delete Button Click
document.getElementById("deleteButton").addEventListener("click", async () => {
  const employeeId = document.getElementById("adminDropdown").value;

  if (!employeeId) {
    Swal.fire("Warning", "Please select an Admin to delete", "warning");
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:25025/api/Empolyees/${employeeId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The employee has been deleted successfully.",
          confirmButtonText: "OK"
        }).then(() => {
          // Refresh the page after the user clicks "OK"
          location.reload();
        });
        // Close the modal if it's open
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteAdminModal'));
        if (deleteModal) {
          deleteModal.hide();
        }

        // Refresh the dropdowns
        populateEmployeeDropdowns();

      } catch (error) {
        console.error("Error deleting Admin:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete the Admin. Please try again.",
          confirmButtonText: "OK"
        });
      }
    }
  });
});