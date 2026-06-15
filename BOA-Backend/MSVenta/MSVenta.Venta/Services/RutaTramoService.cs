using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class RutaTramoService : IRutaTramoService
    {
        private readonly ContextDatabase _context;

        public RutaTramoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RutaTramo>> GetByRutaId(int rutaId) =>
            await _context.RutaTramos
                .Include(rt => rt.Tramo)
                .Where(rt => rt.Ruta_Id == rutaId)
                .OrderBy(rt => rt.Orden)
                .ToListAsync();

        public async Task Add(RutaTramo rutaTramo)
        {
            _context.RutaTramos.Add(rutaTramo);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.RutaTramos.FindAsync(id);
            if (item != null)
            {
                _context.RutaTramos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}