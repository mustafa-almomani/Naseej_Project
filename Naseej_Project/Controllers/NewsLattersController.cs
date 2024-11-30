using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Naseej_Project.DTOs;
using Naseej_Project.Models;
using MimeKit;
using MailKit;
namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsLattersController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IEmailService _emailService;

        public NewsLattersController(MyDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;

        }

        // GET: api/Newslatter
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Newslatter>>> GetAllNewslatters()
        {
            return Ok(await _context.Set<Newslatter>().ToListAsync());
        }

        // GET: api/Newslatter/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Newslatter>> GetNewslatterById(int id)
        {
            var newslatter = await _context.Set<Newslatter>().FindAsync(id);

            if (newslatter == null)
            {
                return NotFound(new { Message = "Newsletter entry not found." });
            }

            return Ok(newslatter);
        }

        // POST: api/Newslatter
        [HttpPost]
        public async Task<ActionResult<Newslatter>> CreateNewslatter(Newslatter newslatter)
        {
            if (newslatter == null || string.IsNullOrWhiteSpace(newslatter.UserEmail))
            {
                return BadRequest(new { Message = "Invalid data. UserEmail is required." });
            }

            // Set default values for new columns
            newslatter.Status = false;  // Not replied by default
            newslatter.CreatedDate = DateTime.Now; // Set the current timestamp

            _context.Set<Newslatter>().Add(newslatter);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNewslatterById), new { id = newslatter.Id }, newslatter);
        }

        // PUT: api/Newslatter/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNewslatter(int id, Newslatter newslatter)
        {
            if (id != newslatter.Id)
            {
                return BadRequest(new { Message = "ID mismatch." });
            }

            if (newslatter == null || string.IsNullOrWhiteSpace(newslatter.UserEmail))
            {
                return BadRequest(new { Message = "Invalid data. UserEmail is required." });
            }

            // You can update the Status here if necessary
            _context.Entry(newslatter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NewslatterExists(id))
                {
                    return NotFound(new { Message = "Newsletter entry not found." });
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/Newslatter/{id}
        // DELETE: api/Newslatter/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNewslatter(int id)
        {
            try
            {
                var newslatter = await _context.Newslatters.FindAsync(id);

                if (newslatter == null)
                {
                    return NotFound(new { Message = "Newsletter entry not found." });
                }

                _context.Newslatters.Remove(newslatter);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while deleting the record.", Error = ex.Message });
            }
        }


        // Helper Method to Check Existence
        private bool NewslatterExists(int id)
        {
            return _context.Set<Newslatter>().Any(e => e.Id == id);
        }

        // POST: api/Newslatter/subscribe
        [HttpPost]
        [Route("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("Email is required.");

            var newslatter = new Newslatter
            {
                UserEmail = email,
                Status = false,  // Not replied by default
                CreatedDate = DateTime.Now  // Set the current timestamp
            };

            _context.Newslatters.Add(newslatter);
            await _context.SaveChangesAsync();

            return Ok("Subscribed successfully.");
        }

        // PUT: api/Newslatter/reply/{id}
        // Backend Controller
        [HttpPut]
        [Route("reply/{id}")]
        public async Task<IActionResult> ReplyToUser(int id, [FromBody] NewsletterReplyDto replyDto)
        {
            try
            {
                // Find the newsletter
                var newsletter = await _context.Newslatters.FindAsync(id);
                if (newsletter == null)
                    return NotFound("Newsletter record not found.");

                // Update newsletter status
                newsletter.AdminReplay = replyDto.AdminReply;
                newsletter.Status = true;  // Set Status to "Replied"

                // Save changes to database
                await _context.SaveChangesAsync();

                try
                {
                    // Send email to the subscriber
                    var subject = "Important Update from Naseej";
                    var messageBody = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <p>Dear Valued Member,</p>

                                <p>We hope this message finds you well. As part of our commitment to keeping you informed about important updates and developments at Naseej, we are pleased to share the following announcement:</p>

                                <div style='background-color: #f7f7f7; border-left: 4px solid #004d99; padding: 20px; margin: 20px 0;'>
                                    {replyDto.AdminReply}
                                </div>

                                <p>We value your continued trust and support. If you have any questions or require additional information, please don't hesitate to reach out to our support team.</p>

                                <p style='margin-top: 30px;'>
                                    Best regards,<br>
                                    <strong>The Naseej Team</strong><br>
                                </p>
        
                                <hr style='border-top: 1px solid #eee; margin: 20px 0;'>
        
                                
                            </div>
                        </body>
                        </html>";

                    await _emailService.SendEmailAsync(
                        newsletter.UserEmail,  // Subscriber's email
                        subject,
                        messageBody
                    );

                    return Ok(new
                    {
                        message = "Reply sent successfully and email delivered.",
                        emailSent = true
                    });
                }
                catch (Exception emailEx)
                {
                    // Log the email error but don't fail the request

                    return Ok(new
                    {
                        message = "Reply saved but email delivery failed. Please try sending the email again.",
                        emailSent = false,
                        emailError = emailEx.Message
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to process reply",
                    error = ex.Message
                });
            }
        }

        // Mass Reply Endpoint
        [HttpPut]
        [Route("reply-all")]
        public async Task<IActionResult> ReplyToAll([FromBody] NewsletterReplyDto replyDto)
        {
            try
            {
                // Get all pending newsletters
                var pendingNewsletters = await _context.Newslatters
                    .Where(n => !n.Status)
                    .ToListAsync();

                if (!pendingNewsletters.Any())
                    return NotFound("No pending newsletters found.");

                var successCount = 0;
                var failedEmails = new List<string>();

                foreach (var newsletter in pendingNewsletters)
                {
                    // Update newsletter status
                    newsletter.AdminReplay = replyDto.AdminReply;
                    newsletter.Status = true;

                    try
                    {
                        var subject = "Important Update from Naseej";
                        var messageBody = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <p>Dear Valued Member,</p>

                                <p>We hope this message finds you well. As part of our commitment to keeping you informed about important updates and developments at Naseej, we are pleased to share the following announcement:</p>

                                <div style='background-color: #f7f7f7; border-left: 4px solid #004d99; padding: 20px; margin: 20px 0;'>
                                    {replyDto.AdminReply}
                                </div>

                                <p>We value your continued trust and support. If you have any questions or require additional information, please don't hesitate to reach out to our support team.</p>

                                <p style='margin-top: 30px;'>
                                    Best regards,<br>
                                    <strong>The Naseej Team</strong><br>
                                </p>
        
                                <hr style='border-top: 1px solid #eee; margin: 20px 0;'>
        
                               
                            </div>
                        </body>
                        </html>";

                        await _emailService.SendEmailAsync(
                            newsletter.UserEmail,
                            subject,
                            messageBody
                        );

                        successCount++;
                    }
                    catch (Exception emailEx)
                    {
                        failedEmails.Add(newsletter.UserEmail);
                    }
                }

                // Save all changes to database
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Processed {pendingNewsletters.Count} newsletters",
                    successfulEmails = successCount,
                    failedEmails = failedEmails,
                    totalProcessed = pendingNewsletters.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to process mass reply",
                    error = ex.Message
                });
            }
        }
    }
}
