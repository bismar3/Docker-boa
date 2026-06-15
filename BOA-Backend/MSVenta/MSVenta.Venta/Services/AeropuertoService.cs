using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class AeropuertoService : IAeropuertoService
    {
        private readonly ContextDatabase _context;
        public AeropuertoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Aeropuerto>> GetAll() =>
            await _context.Aeropuertos.ToListAsync();

        public async Task<Aeropuerto> GetById(int id) =>
            await _context.Aeropuertos.FindAsync(id);

        public async Task Create(Aeropuerto a)
        {
            _context.Aeropuertos.Add(a);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Aeropuerto a)
        {
            _context.Aeropuertos.Update(a);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Aeropuertos.FindAsync(id);
            if (item != null)
            {
                _context.Aeropuertos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}