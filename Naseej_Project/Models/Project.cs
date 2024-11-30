using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Project
{
    public int ProjectId { get; set; }

    public string? ProjectName { get; set; }

    public string? ProjectImage { get; set; }

    public string? ProjectDescription { get; set; }

    public int? EmployeeId { get; set; }

    public string? IsAccept { get; set; }

    public virtual Employee? Employee { get; set; }
}
