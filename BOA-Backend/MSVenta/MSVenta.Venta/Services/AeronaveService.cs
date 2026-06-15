using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using MSVenta.Venta.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class AeronaveService : IAeronaveService
    {
        private readonly ContextDatabase _context;
        public AeronaveService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Aeronave>> GetAll() =>
            await _context.Aeronaves.ToListAsync();

        public async Task<Aeronave> GetById(int id) =>
            await _context.Aeronaves.FindAsync(id);

        public async Task Create(Aeronave a)
        {
            _context.Aeronaves.Add(a);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Aeronave a)
        {
            _context.Aeronaves.Update(a);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Aeronaves.FindAsync(id);
            if (item != null)
            {
                _context.Aeronaves.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Aeronave> CreateConAsientos(AeronaveConAsientosDTO dto)
        {
            var aeronave = new Aeronave
            {
                Matricula = dto.Matricula,
                Modelo = dto.Modelo,
                Fabricante = dto.Fabricante,
                Estado = dto.Estado,
                Capacidad_Total = dto.Clases.Sum(c => c.Cantidad)
            };

            _context.Aeronaves.Add(aeronave);
            await _context.SaveChangesAsync();

            int filaActual = 1;
            foreach (var clase in dto.Clases)
            {
                int asientosEnFila = 0;
                char letra = 'A';

                for (int i = 0; i < clase.Cantidad; i++)
                {
                    var asiento = new Asiento
                    {
                        Aeronave_Id = aeronave.Id,
                        Numero = $"{filaActual}{letra}",
                        Fila = filaActual,
                        Tipo_Clase_Id = clase.Tipo_Clase_Id
                    };
                    _context.Asientos.Add(asiento);

                    asientosEnFila++;
                    letra++;

                    if (asientosEnFila >= clase.Columnas_Por_Fila)
                    {
                        filaActual++;
                        asientosEnFila = 0;
                        letra = 'A';
                    }
                }

                if (asientosEnFila > 0) filaActual++;
            }

            await _context.SaveChangesAsync();
            return aeronave;
        }
    }
}