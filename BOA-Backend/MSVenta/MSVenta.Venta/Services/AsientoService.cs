using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class AsientoService : IAsientoService
    {
        private readonly ContextDatabase _context;
        public AsientoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AsientoProgramacion>> GetByProgramacion(int programacionId) =>
            await _context.AsientoProgramaciones
                .Include(ap => ap.Asiento)
                    .ThenInclude(a => a.TipoClase)
                .Where(ap => ap.Programacion_Vuelo_Id == programacionId)
                .OrderBy(ap => ap.Asiento.Fila)
                .ThenBy(ap => ap.Asiento.Numero)
                .ToListAsync();
    }
}