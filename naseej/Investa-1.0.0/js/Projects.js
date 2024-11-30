async function displayProjects() {
    try {
        const response = await fetch('http://localhost:25025/api/project/getprojectAccepted');
        const projects = await response.json();

        const projectContainer = `
        <div class="container-fluid project pt-5">
            <div class="container pt-5">
                <div class="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.1s" style="max-width: 800px;">
                    <h4 class="text-primary">Our Projects</h4>
                    <h1 class="display-4">Explore Our Latest Projects</h1>
                </div>
                <div class="project-carousel owl-carousel wow fadeInUp" data-wow-delay="0.1s">
                    ${projects.map(project => `
                        <div class="project-item h-100 wow fadeInUp" data-wow-delay="0.1s">
                            <div class="project-img">
                                <img src="http://localhost:25025/project/${project.projectImage}" class="img-fluid w-100 rounded" alt="${project.projectName}">
                            </div>
                            <div class="project-content bg-light rounded p-4">
                                <div class="project-content-inner">
                                    <div class="project-icon mb-3"><i class="fas fa-signal fa-4x text-primary"></i></div>
                                    <p class="text-dark fs-5 mb-3">${project.projectName}</p>
                                    <a href="#" class="h4">${project.projectDescription}</a>
                                    <div class="pt-4">
                                        <a class="btn btn-light rounded-pill py-3 px-5" href="#">Read More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

        document.getElementById('for_projects').innerHTML = projectContainer;

        $('.project-carousel').owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            margin: 25,
            loop: true,
            nav: false,
            dots: true,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                }
            }
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        document.getElementById('for_projects').innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', displayProjects);