using BOA.Finanzas.Models;
using BOA.Finanzas.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public class EgresoService : IEgresoService
    {
        private readonly ContextDatabase _context;

        public EgresoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Egreso>> GetAll() =>
            await _context.Egresos.ToListAsync();

        public async Task<Egreso> Create(Egreso egreso)
        {
            _context.Egresos.Add(egreso);
            await _context.SaveChangesAsync();
            return egreso;
        }
    }
}