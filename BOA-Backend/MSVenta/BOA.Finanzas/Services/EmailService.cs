using Microsoft.Extensions.Configuration;
using System.IO;
using System.Net.Mail;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _from;

        public EmailService(IConfiguration configuration)
        {
            _smtpHost = configuration["Smtp:Host"] ?? "192.168.0.10";
            _smtpPort = int.TryParse(configuration["Smtp:Port"], out var p) ? p : 25;
            _from = configuration["Smtp:From"] ?? "damaris@tecnoweb.edu";
        }

        public async Task EnviarConAdjunto(string destinatario, string asunto, string cuerpo, byte[] adjuntoBytes, string nombreAdjunto)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = false,
                UseDefaultCredentials = false
            };

            using var mensaje = new MailMessage(_from, destinatario, asunto, cuerpo);

            using var stream = new MemoryStream(adjuntoBytes);
            mensaje.Attachments.Add(new Attachment(stream, nombreAdjunto, "application/pdf"));

            await client.SendMailAsync(mensaje);
        }
    }
}