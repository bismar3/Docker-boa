using BOA.Finanzas.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public interface IIngresoService
    {
        Task<IEnumerable<Ingreso>> GetAll();
        Task<Ingreso> Create(Ingreso ingreso);
    }
}