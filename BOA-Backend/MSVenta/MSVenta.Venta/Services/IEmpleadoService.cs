using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IEmpleadoService
    {
        Task<IEnumerable<Empleado>> GetAll();
        Task<Empleado> GetById(int id);
        Task Create(Empleado empleado);
        Task Update(Empleado empleado);
        Task Delete(int id);
    }
}