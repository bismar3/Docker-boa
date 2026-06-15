using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class TripulacionService : ITripulacionService
    {
        private readonly ContextDatabase _context;
        public TripulacionService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tripulacion>> GetAll() =>
            await _context.Tripulaciones.ToListAsync();

        public async Task<Tripulacion> GetById(int id) =>
            await _context.Tripulaciones.FindAsync(id);

        public async Task Create(Tripulacion t)
        {
            _context.Tripulaciones.Add(t);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Tripulaciones.FindAsync(id);
            if (item != null)
            {
                _context.Tripulaciones.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}