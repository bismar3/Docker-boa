using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IProgramacionVueloService
    {
        Task<IEnumerable<ProgramacionVuelo>> GetAll();
        Task<ProgramacionVuelo> GetById(int id);
        Task Create(ProgramacionVuelo programacionVuelo);
        Task Update(ProgramacionVuelo programacionVuelo);
        Task Delete(int id);
    }
}