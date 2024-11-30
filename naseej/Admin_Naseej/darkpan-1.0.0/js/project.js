// دالة لفك تشفير الـ JWT واستخراج الـ Payload
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
  }
  
  // استرجاع employeeId من التوكن المخزن في sessionStorage
  function getEmployeeIdFromToken() {
    const token = sessionStorage.getItem("Token");
    if (token) {
        const payload = parseJwt(token);
        // console.log("Decoded Payload:", payload);
        // استخدام `sub` كمعرف الموظف
        return payload ? payload.sub : null;
    }
    return null;
  }
  
  
  async function fetchCardData() {
    const url = "http://localhost:25025/api/project/allproject";
    const response = await fetch(url);
    const data = await response.json();
  
    // جلب employeeId من التوكن
    const employeeId = getEmployeeIdFromToken();
    // console.log("Employee ID:", employeeId);
  
    if (employeeId) {
        document.getElementById("EmployeeId").value = employeeId;
    } else {
        console.error("Employee ID is undefined");
    }
  
    const cardContainer = document.getElementById("container");
    cardContainer.innerHTML = "";
  
    data.forEach((product) => {
        cardContainer.innerHTML += `
            <div class="col-xl-4 col-md-6 mb-4">
                <div class="card service-card shadow h-100">
                    <img src="http://localhost:25025/project/${product.projectImage}" class="card-img-top" alt="Service Image">
                    <div class="card-body">
                        <h5 class="card-title">${product.projectName}</h5>
                        <p class="card-text"><strong>Description:</strong> ${product.projectDescription}</p>
                                
                                </div>
                                <div class="card-footer text-center">
                            <select onchange="editstatus(${product.projectId})" id="status-${product.projectId}" class="form-select bg-custom text-dark form-select-sm">
                  <option value="Pinding" class="text-info" ${product.isAccept === 'Pinding' ? 'selected' : ''}>Pinding</option>
                  <option value="Accept" class="text-success" ${product.isAccept === 'Accept' ? 'selected' : ''}>Accept</option>
              </select>
  
                    </div>
                    <div class="card-footer text-center">
                        <a href="#" class="btn btn-success" onclick="editservice(${product.projectId})"><i class="fas fa-edit"></i> Edit</a>
                        <a href="#" class="btn btn-danger" onclick="deleteservices(${product.projectId})"><i class="fas fa-trash"></i> Delete</a>
                    </div>
                </div>
            </div>
        `;
    });
  
    // console.log("Fetched Data:", data);
  }
  
  fetchCardData();
  
    
const url = "http://localhost:25025/api/project/addnewproject";
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
          var delet = `http://localhost:25025/api/project/deletprojectid/${id}`;
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
    
    
    
      
    async function editservice(id) {
        var urll1 = `http://localhost:25025/api/project/getprojectbyid/${id}`;
        var response = await fetch(urll1);
        var employee = await response.json();
      
        document.getElementById("editEmployeeId").value = employee.projectId;
        document.getElementById("ServiceName").value = employee.projectName;
        document.getElementById("ServiceDescription").value =
          employee.projectDescription;
        document.getElementById("batool").src = `http://localhost:25025/project/${employee.projectImage}`;
      
        $("#editEmployeeModal").modal("show");
      }
      
      async function updateservice() {
        var id = document.getElementById("editEmployeeId").value;
        var url2 = `http://localhost:25025/api/project/editproject/${id}`;
        var formData = new FormData(document.getElementById("serviceEditForm"));
      
        // طباعة بيانات النموذج
      
        var response = await fetch(url2, {
          method: "PUT",
          body: formData,
        });
      
        // console.log("Response Status:", response.status);
        // console.log("Response OK:", response.ok);
      
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
      
    
    
      
    async function editstatus(id) {
    
        event.preventDefault();
        debugger;
        let urlm = `http://localhost:25025/api/project/editstetus/${id}`;
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
          alert("Status updated successfully");
      
          // تحديث الحالة في allOrders وتحديث الواجهة
          let order = allOrders.find((order) => order.projectId === id);
          if (order) {
            order.isAccept = newStatus;
          }
      
          // عرض الطلبات من جديد بناءً على الحالة الجديدة
          displayOrders(allOrders);
        } else {
          alert("Error updating status");
        }
      }
    
    
    
    
    
    
  
      