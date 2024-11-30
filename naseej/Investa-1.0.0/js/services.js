async function servicesuser() {
    debugger
    let url = "http://localhost:25025/api/services/getservicesAccepted";
    const response = await fetch(url);
    let data = await response.json();
  
    let card = document.getElementById("contener");
  
    data.forEach((product) => {
      card.innerHTML += `
   <div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.3s">
    <div class="service-item bg-light rounded">
        <div class="service-img position-relative">
            <!-- الصورة -->
            <img src="http://localhost:25025/Uploads/${product.serviceImage}" class="img-fluid w-100 rounded-top" alt="">

            <!-- العمر -->
            <div class="age-overlay position-absolute">
                Age: ${product.fromage} - ${product.toage}
            </div>
        </div>
        <div class="service-content text-center p-4">
            <div class="service-content-inner">
                <a href="#" class="h4 mb-6 d-inline-flex text-start">
                    <i class="fas fa-donate fa-2x me-2"></i>${product.serviceName}
                </a>
                <p class="mb-6">${product.serviceDescription}</p>
                <a class="btn btn-light rounded-pill py-2 px-4" href="#" onclick="showServiceModal(${product.serviceId})" data-bs-toggle="modal">Apply</a>
            </div>
        </div>
    </div>
</div>




             
          `;
    });


  }
  
  servicesuser();
  
  
  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function showServiceModal(serviceId) {
  debugger
  let token = sessionStorage.getItem("jwtToken"); 

  if (!token) {
    await Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "You need to be logged in to submit a testimonial.",
    });
    return; 
  }

  let decodedToken = parseJwt(token);
  
  console.log("Decoded Token:", decodedToken);

  let userId = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  if (!userId) {
    await Swal.fire({
      icon: "warning",
      title: "Invalid Token",
      text: "Unable to extract user ID from token.",
    });
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:25025/api/services/getinfouserandservices/${userId}/${serviceId}`
    );
    if (!response.ok) throw new Error("Failed to fetch user info");

    const data = await response.json();

    document.getElementById("FullName").value = data.user.fullname || '';
    document.getElementById("Email").value = data.user.email || '';
    document.getElementById("phonenumber").value = data.user.phoneNumber || '';
    document.getElementById("Userid").value = data.user.userId || '';

    document.getElementById("serviceId").value = serviceId;
    document.getElementById("serviceName").value = data.service.serviceName || '';

  } catch (error) {
    console.error("Error fetching user info:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "We apologize, but your age does not meet the requirements for this service.",
    });
    return;
  }

  const serviceModal = new bootstrap.Modal(document.getElementById("serviceModal"), {
    backdrop: 'static',
    keyboard: false
  });
  serviceModal.show();
}


const urlorder = "http://localhost:25025/api/services/addnewrequest";

async function addorder() {
    debugger;
    event.preventDefault(); 

    let token = sessionStorage.getItem("jwtToken");

    if (!token) {
        await Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: "You need to be logged in to submit a testimonial.",
        });
        return;
    }

    let decodedToken = parseJwt(token);
    const userId = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    if (!userId) {
        await Swal.fire({
            icon: "warning",
            title: "Invalid Token",
            text: "Unable to extract user ID from token.",
        });
        return;
    }
    var form = document.getElementById("addorder");
    var formData = new FormData(form);
    formData.append("UserId", userId);
    formData.append("ServiceId", document.getElementById("serviceId").value);
    console.log(document.getElementById("serviceId").value);
    var response = await fetch(urlorder, {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        Swal.fire({
            title: "Success!",
            text: "Registration completed successfully",
            icon: "success",
            confirmButtonText: "OK",
            timer: 3000, 
            timerProgressBar: true, 
        });

        setTimeout(() => {
            window.location.href = "service.html";
        }, 2000);
    } else {
        Swal.fire({
            title: "Error!",
            text: "Registration failed",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
}






async function servicehome() {
  debugger
  let url = "http://localhost:25025/api/services/getservicesAcceptedlastthree";
  const response = await fetch(url);
  let data = await response.json();

  let card = document.getElementById("service");

  data.forEach((product) => {
    card.innerHTML += `
          <div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.3s">
                  <div class="service-item bg-light rounded">
                      <div class="service-img">
                          <img src="http://localhost:25025/Uploads/${product.serviceImage}" class="img-fluid w-100 rounded-top" alt="">
                      </div>
                      <div class="service-content text-center p-4">
                          <div class="service-content-inner">
                              <a href="#" class="h4 mb-6 d-inline-flex text-start"><i
                                      class="fas fa-donate fa-2x me-2"></i>${product.serviceName}</a>
                              <p class="mb-6">${product.serviceDescription}
                              </p>
                              <p>Age: ${product.fromage}&nbsp;&nbsp;-&nbsp;&nbsp;${product.toage}</p>

                              <a class="btn btn-light rounded-pill py-2 px-4" href="#" onclick="showServiceModal(${product.serviceId})"  data-bs-toggle="modal" >Apply</a>

                          </div>
                      </div>
                  </div>
              </div>




           
        `;
  });


}
servicehome()