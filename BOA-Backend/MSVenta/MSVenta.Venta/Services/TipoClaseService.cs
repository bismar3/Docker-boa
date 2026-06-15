using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class TipoClaseService : ITipoClaseService
    {
        private readonly ContextDatabase _context;
        public TipoClaseService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TipoClase>> GetAll() =>
            await _context.TipoClases.ToListAsync();

        public async Task<TipoClase> GetById(int id) =>
            await _context.TipoClases.FindAsync(id);

        public async Task Create(TipoClase t)
        {
            _context.TipoClases.Add(t);
            await _context.SaveChangesAsync();
        }

        public async Task Update(TipoClase t)
        {
            _context.TipoClases.Update(t);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.TipoClases.FindAsync(id);
            if (item != null)
            {
                _context.TipoClases.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}