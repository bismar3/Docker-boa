using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly ContextDatabase _context;
        public EmpleadoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Empleado>> GetAll() =>
            await _context.Empleados.ToListAsync();

        public async Task<Empleado> GetById(int id) =>
            await _context.Empleados.FindAsync(id);

        public async Task Create(Empleado e)
        {
            _context.Empleados.Add(e);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Empleado e)
        {
            _context.Empleados.Update(e);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Empleados.FindAsync(id);
            if (item != null)
            {
                _context.Empleados.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}