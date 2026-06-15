using Microsoft.EntityFrameworkCore;
using BOA.Comercial.Models;
using BOA.Comercial.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public class TicketService : ITicketService
    {
        private readonly ContextDatabase _context;
        public TicketService(ContextDatabase context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Ticket>> GetAll() =>
            await _context.Tickets.ToListAsync();
        public async Task<IEnumerable<Ticket>> GetByVentaId(int ventaId) =>
            await _context.Tickets.Where(t => t.Venta_Id == ventaId).ToListAsync();
        public async Task<Ticket> GetById(int id) =>
            await _context.Tickets.FindAsync(id);
        public async Task Create(Ticket t)
        {
            _context.Tickets.Add(t);
            await _context.SaveChangesAsync();
        }
        public async Task Delete(int id)
        {
            var item = await _context.Tickets.FindAsync(id);
            if (item != null)
            {
                _context.Tickets.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}