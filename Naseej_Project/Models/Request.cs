using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Request
{
    public int RequestId { get; set; }

    public int? UserId { get; set; }

    public int? ServiceId { get; set; }

    public DateTime? RequestDate { get; set; }

    public string? Description { get; set; }

    public virtual Service? Service { get; set; }

    public virtual User? User { get; set; }
}
