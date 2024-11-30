using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class Newslatter
{
    public int Id { get; set; }

    public string UserEmail { get; set; } = null!;

    public string? AdminReplay { get; set; }

    public bool Status { get; set; }

    public DateTime CreatedDate { get; set; }
}
