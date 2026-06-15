using BOA.Comercial.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public interface IVentaService
    {
        Task<IEnumerable<Venta>> GetAll();
        Task<IEnumerable<Venta>> GetByClienteId(int clienteId);
        Task<Venta> GetById(int id);
        Task<IEnumerable<VentaDetalle>> GetAllDetalle();
        Task<Venta> Create(Venta v);
        Task Update(Venta v);
        Task Delete(int id);
    }
}