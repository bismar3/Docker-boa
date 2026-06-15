using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class RutaService : IRutaService
    {
        private readonly ContextDatabase _context;
        public RutaService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ruta>> GetAll() =>
            await _context.Rutas.ToListAsync();

        public async Task<Ruta> GetById(int id) =>
            await _context.Rutas.FindAsync(id);

        public async Task Create(Ruta r)
        {
            _context.Rutas.Add(r);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Ruta r)
        {
            _context.Rutas.Update(r);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Rutas.FindAsync(id);
            if (item != null)
            {
                _context.Rutas.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}