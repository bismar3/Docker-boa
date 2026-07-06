using BOA.Finanzas.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public interface IEgresoService
    {
        Task<IEnumerable<Egreso>> GetAll();
        Task<Egreso> Create(Egreso egreso);
    }
}