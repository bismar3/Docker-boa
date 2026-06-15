using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IRutaService
    {
        Task<IEnumerable<Ruta>> GetAll();
        Task<Ruta> GetById(int id);
        Task Create(Ruta ruta);
        Task Update(Ruta ruta);
        Task Delete(int id);
    }
}