using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IRutaTramoService
    {
        Task<IEnumerable<RutaTramo>> GetByRutaId(int rutaId);
        Task Add(RutaTramo rutaTramo);
        Task Delete(int id);
    }
}