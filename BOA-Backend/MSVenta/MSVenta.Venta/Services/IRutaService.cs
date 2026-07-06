using MSVenta.Venta.Models;
using System;
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
        Task<RutaCalculo> CalcularDistancia(int origenId, int destinoId);
        Task<RutaLlegadaCalculo> CalcularLlegada(int rutaId, DateTime fechaSalida, TimeSpan horaSalida);
    }
}