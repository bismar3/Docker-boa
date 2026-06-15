using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IAsientoService
    {
        Task<IEnumerable<AsientoProgramacion>> GetByProgramacion(int programacionId);
    }
}