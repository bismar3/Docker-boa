using BOA.Comercial.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public interface IReservaService
    {
        Task<IEnumerable<Reserva>> GetAll();
        Task<IEnumerable<Reserva>> GetByClienteId(int clienteId);
        Task<Reserva> GetById(int id);
        Task Create(Reserva r);
        Task Update(Reserva r);
        Task Delete(int id);
    }
}