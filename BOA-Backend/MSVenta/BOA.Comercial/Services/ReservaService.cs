using Microsoft.EntityFrameworkCore;
using BOA.Comercial.Models;
using BOA.Comercial.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public class ReservaService : IReservaService
    {
        private readonly ContextDatabase _context;
        public ReservaService(ContextDatabase context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Reserva>> GetAll() =>
            await _context.Reservas.ToListAsync();
        public async Task<IEnumerable<Reserva>> GetByClienteId(int clienteId) =>
            await _context.Reservas.Where(r => r.Cliente_Id == clienteId).ToListAsync();
        public async Task<Reserva> GetById(int id) =>
            await _context.Reservas.FindAsync(id);
        public async Task Create(Reserva r)
        {
            _context.Reservas.Add(r);
            await _context.SaveChangesAsync();
        }
        public async Task Update(Reserva r)
        {
            _context.Reservas.Update(r);
            await _context.SaveChangesAsync();
        }
        public async Task Delete(int id)
        {
            var item = await _context.Reservas.FindAsync(id);
            if (item != null)
            {
                _context.Reservas.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}