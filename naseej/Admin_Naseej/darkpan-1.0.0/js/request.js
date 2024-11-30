
async function fetchCardData() {
    debugger
    const url = "http://localhost:25025/api/services/GetAllRequest";
    const response = await fetch(url);
    const data = await response.json();
  

  

  
    const cardContainer = document.getElementById("container");
    cardContainer.innerHTML = "";
  
    data.forEach((product,index) => {
        cardContainer.innerHTML += `
           <tr>
                <th scope="row">${index + 1}</th>
                <td>${product.fullName}</td>
                <td>${product.serviceName}</td>
                <td>${product.description}</td>
                <td>
                    <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#performanceModal-${product.requestId}">
                        View Details
                    </button>
                         <button  class="btn btn-danger btn-sm" onclick="deleteemployee(${
                                  product.requestId
                                })">Delete</button>
                </td>
            </tr>

   <!-- Modal لكل طلب -->
<div class="modal fade" id="performanceModal-${product.requestId}" tabindex="-1" aria-labelledby="performanceModalLabel-${product.requestId}" aria-hidden="true">
    <div class="modal-dialog modal-lg"> <!-- جعل المودال أكبر للحصول على مساحة إضافية -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="performanceModalLabel-${product.requestId}">
                    Request Details - ${product.serviceName}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                
                <!-- قسم بيانات المستخدم -->
                <h5>User Information</h5>
                <hr>
                <div class="info-section">
                    <p><strong>Full Name:</strong> ${product.fullName}</p>
                    <p><strong>Email:</strong> ${product.email}</p>
                    <p><strong>Phone Number:</strong> ${product.phoneNumber}</p>
                    <p><strong>Nationality:</strong> ${product.nationality}</p>
                    <p><strong>Degree:</strong> ${product.degree}</p>
                    <p><strong>Age:</strong> ${product.age}</p>
                </div>

                <!-- فاصل بين الأقسام -->
                <hr>
                
                <!-- قسم بيانات الخدمة -->
                <h5>Service Information</h5>
                <hr>
                <div class="info-section">
                    <p><strong>Service Name:</strong> ${product.serviceName}</p>
                    <p><strong>Age Range:</strong> ${product.fromage} - ${product.toage}</p>
                </div>

                <!-- فاصل بين الأقسام -->
                <hr>

                <!-- قسم بيانات الطلب -->
                <h5>Request Details</h5>
                <hr>
                <div class="info-section">
                    <p><strong>Description:</strong> ${product.description}</p>
                    <p><strong>Request Date:</strong> ${new Date(product.requestDate).toLocaleString()}</p>
                </div>
            </div>
       <div class="modal-footer" style="padding: 5px 10px;">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

</div>
        </div>
    </div>
</div>

        `;
    });
  
  }
  
  fetchCardData();
  



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




async function deleteemployee(id) {
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
      var delet = `http://localhost:25025/api/services/deleteRequest/${id}`;
      var response = await fetch(delet, {
        method: "DELETE",
      });
  
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);
  
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
  