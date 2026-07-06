using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class SalidaService : ISalidaService
    {
        private readonly ContextDatabase _context;

        public SalidaService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Salida>> GetAll() =>
            await _context.Salidas.ToListAsync();

        public async Task<Salida> RegistrarSalida(int programacionVueloId, decimal monto, int cantidadPasajes)
        {
            var existente = await _context.Salidas
                .FirstOrDefaultAsync(s => s.Programacion_Vuelo_Id == programacionVueloId);

            if (existente != null)
                return existente;

            var salida = new Salida
            {
                Programacion_Vuelo_Id = programacionVueloId,
                Monto_Total = monto,
                Cantidad_Pasajes = cantidadPasajes,
                Created_At = DateTime.Now
            };

            _context.Salidas.Add(salida);
            await _context.SaveChangesAsync();

            // Actualizar estado del vuelo a "Salido"
            var vuelo = await _context.ProgramacionVuelos.FindAsync(programacionVueloId);
            if (vuelo != null)
            {
                vuelo.Estado = "Salido";
                await _context.SaveChangesAsync();
            }

            return salida;
        }
    }
}