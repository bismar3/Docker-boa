using Microsoft.EntityFrameworkCore;
using BOA.Comercial.Models;
using BOA.Comercial.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BOA.Comercial.Services
{
    public class TransaccionService : ITransaccionService
    {
        private readonly ContextDatabase _context;
        public TransaccionService(ContextDatabase context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Transaccion>> GetAll() =>
            await _context.Transacciones.ToListAsync();
        public async Task<Transaccion> GetById(int id) =>
            await _context.Transacciones.FindAsync(id);
        public async Task Create(Transaccion t)
        {
            _context.Transacciones.Add(t);
            await _context.SaveChangesAsync();
        }
        public async Task Update(Transaccion t)
        {
            _context.Transacciones.Update(t);
            await _context.SaveChangesAsync();
        }
    }
}