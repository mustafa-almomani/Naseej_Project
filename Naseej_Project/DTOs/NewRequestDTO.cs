namespace Naseej_Project.DTOs
{
    public class NewRequestDTO
    {

        public int? UserId { get; set; }

        public int? ServiceId { get; set; }

        public DateTime? RequestDate { get; set; }

        public string? Description { get; set; }
    }
}
