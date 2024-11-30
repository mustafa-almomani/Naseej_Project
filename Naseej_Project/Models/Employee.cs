using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Employee
{
    public int EmployeeId { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public bool? IsAdmin { get; set; }

    public string? Image { get; set; }

    public int? Scope { get; set; }

    public string? PasswordHash { get; set; }

    public string? PasswordSalt { get; set; }

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
