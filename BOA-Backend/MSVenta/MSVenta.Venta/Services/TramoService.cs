using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class TramoService : ITramoService
    {
        private readonly ContextDatabase _context;

        public TramoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tramo>> GetAll() =>
            await _context.Tramos.ToListAsync();

        public async Task<Tramo> GetById(int id) =>
            await _context.Tramos.FindAsync(id);

        public async Task Create(Tramo t)
        {
            _context.Tramos.Add(t);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Tramo t)
        {
            _context.Tramos.Update(t);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Tramos.FindAsync(id);
            if (item != null)
            {
                _context.Tramos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}