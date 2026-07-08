using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class RutaTramoService : IRutaTramoService
    {
        private readonly ContextDatabase _context;
        public RutaTramoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RutaTramo>> GetByRutaId(int rutaId)
        {
            var rutaTramos = await _context.RutaTramos
                .Include(rt => rt.Tramo)
                .Where(rt => rt.Ruta_Id == rutaId)
                .OrderBy(rt => rt.Orden)
                .ToListAsync();

            var resultado = new List<RutaTramo>();

            foreach (var rt in rutaTramos)
            {
                resultado.Add(rt);

                if (rt.Tramo == null) continue;

                var hijos = await _context.Tramos
                    .Where(t => t.Tramo_Padre_Id == rt.Tramo.Id)
                    .OrderBy(t => t.Orden)
                    .ToListAsync();

                foreach (var hijo in hijos)
                {
                    resultado.Add(new RutaTramo
                    {
                        Id = 0,
                        Ruta_Id = rutaId,
                        Tramo_Id = hijo.Id,
                        Orden = hijo.Orden,
                        Tramo = hijo
                    });
                }
            }

            return resultado;
        }

        public async Task Add(RutaTramo rutaTramo)
        {
            _context.RutaTramos.Add(rutaTramo);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.RutaTramos.FindAsync(id);
            if (item != null)
            {
                _context.RutaTramos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}