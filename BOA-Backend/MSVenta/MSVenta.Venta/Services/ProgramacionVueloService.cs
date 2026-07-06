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

        public async Task<IEnumerable<VueloBusquedaResult>> BuscarPorTramo(int origenId, int destinoId)
        {
            var programaciones = await _context.ProgramacionVuelos.ToListAsync();
            var rutaTramos = await _context.RutaTramos.Include(rt => rt.Tramo).ToListAsync();
            var todosLosTramos = await _context.Tramos.ToListAsync();

            var resultados = new List<VueloBusquedaResult>();

            // Estados que representan un vuelo todavía vendible/reservable
            var estadosValidos = new[] { "Programado", "Reprogramado" };

            foreach (var prog in programaciones.Where(p => estadosValidos.Contains(p.Estado)))
            {
                // Opción 1: vuelo directo origen→destino
                if (prog.Aeropuerto_Origen_Id == origenId && prog.Aeropuerto_Destino_Id == destinoId)
                {
                    var tramosDeRuta = rutaTramos
                        .Where(rt => rt.Ruta_Id == prog.Ruta_Id && rt.Tramo != null)
                        .ToList();

                    var tramosRaiz = tramosDeRuta
                        .Where(rt => rt.Tramo != null && rt.Tramo.Tramo_Padre_Id == null)
                        .ToList();

                    var subTramos = tramosRaiz
                        .SelectMany(rt => todosLosTramos.Where(t => t.Tramo_Padre_Id == rt.Tramo_Id))
                        .ToList();

                    var tieneEscalas = subTramos.Count > 0;
                    var numEscalas = subTramos.Count;

                    resultados.Add(new VueloBusquedaResult
                    {
                        ProgramacionId = prog.Id,
                        Codigo_Vuelo = prog.Codigo_Vuelo,
                        Aeropuerto_Origen_Id = origenId,
                        Aeropuerto_Destino_Id = destinoId,
                        Fecha_Salida = prog.Fecha_Salida,
                        Hora_Salida = prog.Hora_Salida,
                        Fecha_Llegada = prog.Fecha_Llegada,
                        Hora_Llegada = prog.Hora_Llegada,
                        Precio_Base = prog.Precio_Base,
                        Estado = prog.Estado,
                        Ruta_Id = prog.Ruta_Id,
                        Ruta_Tramo_Id = prog.Ruta_Tramo_Id,
                        Tramo_Id = null,
                        Es_Tramo_Parcial = false,
                        Duracion_Estimada = null,
                        Tiene_Escalas = tieneEscalas,
                        Num_Escalas = numEscalas
                    });
                    continue;
                }

                // Opción 2: buscar en sub-tramos hijos
                var subTramosHijos = todosLosTramos.Where(t =>
                    t.Aeropuerto_Origen_Id == origenId &&
                    t.Aeropuerto_Destino_Id == destinoId &&
                    t.Tramo_Padre_Id != null).ToList();

                foreach (var subTramo in subTramosHijos)
                {
                    var rtDelPadre = rutaTramos.FirstOrDefault(rt =>
                        rt.Ruta_Id == prog.Ruta_Id &&
                        rt.Tramo_Id == subTramo.Tramo_Padre_Id);

                    if (rtDelPadre != null)
                    {
                        resultados.Add(new VueloBusquedaResult
                        {
                            ProgramacionId = prog.Id,
                            Codigo_Vuelo = prog.Codigo_Vuelo,
                            Aeropuerto_Origen_Id = origenId,
                            Aeropuerto_Destino_Id = destinoId,
                            Fecha_Salida = prog.Fecha_Salida,
                            Hora_Salida = prog.Hora_Salida,
                            Fecha_Llegada = prog.Fecha_Llegada,
                            Hora_Llegada = prog.Hora_Llegada,
                            Precio_Base = prog.Precio_Base,
                            Estado = prog.Estado,
                            Ruta_Id = prog.Ruta_Id,
                            Ruta_Tramo_Id = rtDelPadre.Id,
                            Tramo_Id = subTramo.Id,
                            Es_Tramo_Parcial = true,
                            Duracion_Estimada = subTramo.Duracion_Estimada,
                            Tiene_Escalas = false,
                            Num_Escalas = 0
                        });
                    }
                }
            }

            return resultados;
        }

        public async Task Create(ProgramacionVuelo p)
        {
            _context.ProgramacionVuelos.Add(p);
            await _context.SaveChangesAsync();

            await GenerarAsientosParaVuelo(p.Id, p.Aeronave_Id);
        }

        public async Task RegenerarAsientos(int programacionId)
        {
            var prog = await _context.ProgramacionVuelos.FindAsync(programacionId);
            if (prog == null) return;

            var yaExisten = await _context.AsientoProgramaciones
                .AnyAsync(ap => ap.Programacion_Vuelo_Id == programacionId);

            if (yaExisten) return; // evita duplicar si ya tiene asientos generados

            await GenerarAsientosParaVuelo(programacionId, prog.Aeronave_Id);
        }

        private async Task GenerarAsientosParaVuelo(int programacionId, int aeronaveId)
        {
            var asientos = await _context.Asientos
                .Where(a => a.Aeronave_Id == aeronaveId)
                .ToListAsync();

            foreach (var asiento in asientos)
            {
                _context.AsientoProgramaciones.Add(new AsientoProgramacion
                {
                    Asiento_Id = asiento.Id,
                    Programacion_Vuelo_Id = programacionId,
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