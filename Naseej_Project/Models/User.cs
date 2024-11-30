using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Nationality { get; set; }

    public string? Degree { get; set; }

    public string? Governorate { get; set; }

    public int? Age { get; set; }

    public DateTime? JoinDate { get; set; }

    public string? PasswordHash { get; set; }

    public string? PasswordSalt { get; set; }

    public string Email { get; set; } = null!;

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<Testimonial> Testimonials { get; set; } = new List<Testimonial>();
}
