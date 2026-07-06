using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface ITripulacionService
    {
        Task<IEnumerable<Tripulacion>> GetAll();
        Task<Tripulacion> GetById(int id);
        Task<IEnumerable<Tripulacion>> GetByProgramacion(int programacionId);
        Task Create(Tripulacion tripulacion);
        Task Delete(int id);
    }
}