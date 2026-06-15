using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface ITipoClaseService
    {
        Task<IEnumerable<TipoClase>> GetAll();
        Task<TipoClase> GetById(int id);
        Task Create(TipoClase tipoClase);
        Task Update(TipoClase tipoClase);
        Task Delete(int id);
    }
}