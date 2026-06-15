using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ProgramacionVueloService : IProgramacionVueloService
    {
        private readonly ContextDatabase _context;
        public ProgramacionVueloService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProgramacionVuelo>> GetAll() =>
            await _context.ProgramacionVuelos.ToListAsync();

        public async Task<ProgramacionVuelo> GetById(int id) =>
            await _context.ProgramacionVuelos.FindAsync(id);

        public async Task Create(ProgramacionVuelo p)
        {
            _context.ProgramacionVuelos.Add(p);
            await _context.SaveChangesAsync();

            // Generar asientos para esta programacion
            var asientos = await _context.Asientos
                .Where(a => a.Aeronave_Id == p.Aeronave_Id)
                .ToListAsync();

            foreach (var asiento in asientos)
            {
                _context.AsientoProgramaciones.Add(new AsientoProgramacion
                {
                    Asiento_Id = asiento.Id,
                    Programacion_Vuelo_Id = p.Id,
                    Estado = "Disponible"
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task Update(ProgramacionVuelo p)
        {
            _context.ProgramacionVuelos.Update(p);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.ProgramacionVuelos.FindAsync(id);
            if (item != null)
            {
                _context.ProgramacionVuelos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}