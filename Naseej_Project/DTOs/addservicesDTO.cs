using Naseej_Project.Models;

namespace Naseej_Project.DTOs
{
    public class addservicesDTO
    {

        public string? ServiceName { get; set; }

        public string? ServiceDescription { get; set; }

        public IFormFile? ServiceImage { get; set; }

        public DateTime? ServiceDate { get; set; }

        public int? EmployeeId { get; set; }
        public string? IsAccept { get; set; }
        public int? Fromage { get; set; }

        public int? Toage { get; set; }


    }
}
