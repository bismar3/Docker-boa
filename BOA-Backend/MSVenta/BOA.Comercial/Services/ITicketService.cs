using BOA.Comercial.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public interface ITicketService
    {
        Task<IEnumerable<Ticket>> GetAll();
        Task<IEnumerable<Ticket>> GetByVentaId(int ventaId);
        Task<Ticket> GetById(int id);
        Task Create(Ticket t);
        Task Update(Ticket t);
        Task Delete(int id);
    }
}