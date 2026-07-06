using BOA.Finanzas.Models;
using BOA.Finanzas.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public class IngresoService : IIngresoService
    {
        private readonly ContextDatabase _context;

        public IngresoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ingreso>> GetAll() =>
            await _context.Ingresos.ToListAsync();

        public async Task<Ingreso> Create(Ingreso ingreso)
        {
            _context.Ingresos.Add(ingreso);
            await _context.SaveChangesAsync();
            return ingreso;
        }
    }
}