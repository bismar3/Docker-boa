using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IAeropuertoService
    {
        Task<IEnumerable<Aeropuerto>> GetAll();
        Task<Aeropuerto> GetById(int id);
        Task Create(Aeropuerto aeropuerto);
        Task Update(Aeropuerto aeropuerto);
        Task Delete(int id);
        Task<(double? Latitud, double? Longitud)> GeocodeCiudad(string ciudad, string pais);
        Task<List<AeropuertoSugerencia>> BuscarAeropuertos(string texto);
    }
}