using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface ITramoService
    {
        Task<IEnumerable<Tramo>> GetAll();
        Task<Tramo> GetById(int id);
        Task Create(Tramo tramo);
        Task Update(Tramo tramo);
        Task Delete(int id);
    }
}