using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Service
{
    public int ServiceId { get; set; }

    public string? ServiceName { get; set; }

    public string? ServiceDescription { get; set; }

    public string? ServiceImage { get; set; }

    public DateTime? ServiceDate { get; set; }

    public int? EmployeeId { get; set; }

    public string? IsAccept { get; set; }

    public int? Fromage { get; set; }

    public int? Toage { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();
}
