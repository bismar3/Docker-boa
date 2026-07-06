using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface ISalidaService
    {
        Task<IEnumerable<Salida>> GetAll();
        Task<Salida> RegistrarSalida(int programacionVueloId, decimal monto, int cantidadPasajes);
    }
}