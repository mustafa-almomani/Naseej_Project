using MimeKit;
using MailKit.Net.Smtp;
namespace Naseej_Project.DTOs
{
    public class EmailService : IEmailService
    {
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Naseej", "Naseej@example.com"));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = subject;
            emailMessage.Body = new TextPart("html") { Text = message };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 465, true);
                await client.AuthenticateAsync("ahmadonizata@gmail.com\r\n", "smoj cmlr tebi xxhy\r\n");
                await client.SendAsync(emailMessage); // Pass the MimeMessage object here
                await client.DisconnectAsync(true);
            }

        }
    }


}