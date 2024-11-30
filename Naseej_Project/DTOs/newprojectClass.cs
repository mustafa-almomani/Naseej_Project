using Naseej_Project.Models;

namespace Naseej_Project.DTOs
{
    public class newprojectClass
    {

        public string? ProjectName { get; set; }

        public IFormFile? ProjectImage { get; set; }

        public string? ProjectDescription { get; set; }

        public int? EmployeeId { get; set; }

        public string? IsAccept { get; set; }

    }
}
