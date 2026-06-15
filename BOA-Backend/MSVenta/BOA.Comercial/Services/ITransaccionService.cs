using BOA.Comercial.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public interface ITransaccionService
    {
        Task<IEnumerable<Transaccion>> GetAll();
        Task<Transaccion> GetById(int id);
        Task Create(Transaccion t);
        Task Update(Transaccion t);
    }
}