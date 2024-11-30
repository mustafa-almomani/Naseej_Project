using System;
using System.Collections.Generic;

namespace Naseej_Project.Models;

public partial class ContactU
{
    public int ContactId { get; set; }

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Subject { get; set; }

    public string? Message { get; set; }

    public string? MessageReply { get; set; }
}
