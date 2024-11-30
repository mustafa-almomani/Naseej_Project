namespace Naseej_Project.DTOs
{
    public class LoginDTO
    {
        public int UserId { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Nationality { get; set; }

        public string? Degree { get; set; }

        public string? Governorate { get; set; }

        public int? Age { get; set; }
        public string Email { get; set; } = null!;


        public DateTime? JoinDate { get; set; }

        public string? PasswordHash { get; set; }

        public string? PasswordSalt { get; set; }
    }
}
