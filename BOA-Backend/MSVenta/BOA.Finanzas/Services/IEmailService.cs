using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public interface IEmailService
    {
        Task EnviarConAdjunto(string destinatario, string asunto, string cuerpo, byte[] adjuntoBytes, string nombreAdjunto);
    }
}