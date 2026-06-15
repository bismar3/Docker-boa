using MSVenta.Venta.Models;
using MSVenta.Venta.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IAeronaveService
    {
        Task<IEnumerable<Aeronave>> GetAll();
        Task<Aeronave> GetById(int id);
        Task Create(Aeronave a);
        Task Update(Aeronave a);
        Task Delete(int id);
        Task<Aeronave> CreateConAsientos(AeronaveConAsientosDTO dto);
    }
}