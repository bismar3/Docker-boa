using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class RutaService : IRutaService
    {
        private readonly ContextDatabase _context;

        public RutaService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ruta>> GetAll() =>
            await _context.Rutas.ToListAsync();

        public async Task<Ruta> GetById(int id) =>
            await _context.Rutas.FindAsync(id);

        public async Task Create(Ruta r)
        {
            _context.Rutas.Add(r);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Ruta r)
        {
            _context.Rutas.Update(r);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Rutas.FindAsync(id);
            if (item != null)
            {
                _context.Rutas.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<RutaCalculo> CalcularDistancia(int origenId, int destinoId)
        {
            var origen = await _context.Aeropuertos.FindAsync(origenId);
            var destino = await _context.Aeropuertos.FindAsync(destinoId);

            if (origen == null || destino == null ||
                origen.Latitud == null || origen.Longitud == null ||
                destino.Latitud == null || destino.Longitud == null)
            {
                return new RutaCalculo { DistanciaKm = null, DuracionEstimada = null };
            }

            var distanciaKm = CalcularHaversine(
                origen.Latitud.Value, origen.Longitud.Value,
                destino.Latitud.Value, destino.Longitud.Value);

            var duracionEstimada = EstimarDuracion(distanciaKm);

            return new RutaCalculo
            {
                DistanciaKm = Math.Round(distanciaKm, 2),
                DuracionEstimada = duracionEstimada
            };
        }

        public async Task<RutaLlegadaCalculo> CalcularLlegada(int rutaId, DateTime fechaSalida, TimeSpan horaSalida)
        {
            var rutaTramos = await _context.RutaTramos
                .Include(rt => rt.Tramo)
                .Where(rt => rt.Ruta_Id == rutaId)
                .OrderBy(rt => rt.Orden)
                .ToListAsync();

            var duracionTotal = TimeSpan.Zero;
            bool seEncontroInformacion = false;

            foreach (var rt in rutaTramos)
            {
                if (rt.Tramo == null) continue;

                var subTramos = await _context.Tramos
                    .Where(t => t.Tramo_Padre_Id == rt.Tramo.Id)
                    .OrderBy(t => t.Orden)
                    .ToListAsync();

                if (subTramos.Count > 0)
                {
                    seEncontroInformacion = true;
                    foreach (var sub in subTramos)
                    {
                        duracionTotal += ParsearDuracion(sub.Duracion_Estimada);
                        duracionTotal += ParsearDuracion(sub.Tiempo_Escala);
                    }
                }
                else
                {
                    seEncontroInformacion = true;
                    duracionTotal += ParsearDuracion(rt.Tramo.Duracion_Estimada);
                }
            }

            if (!seEncontroInformacion)
            {
                var ruta = await _context.Rutas.FindAsync(rutaId);
                if (ruta != null)
                {
                    duracionTotal = ParsearDuracion(ruta.Duracion_Estimada);
                }
            }

            var salida = fechaSalida.Date + horaSalida;
            var llegada = salida.Add(duracionTotal);

            return new RutaLlegadaCalculo
            {
                FechaLlegada = llegada.ToString("yyyy-MM-dd"),
                HoraLlegada = llegada.ToString("HH:mm"),
                DuracionTotalMinutos = (int)duracionTotal.TotalMinutes
            };
        }

        private TimeSpan ParsearDuracion(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor)) return TimeSpan.Zero;
            if (TimeSpan.TryParse(valor, out var resultado)) return resultado;
            return TimeSpan.Zero;
        }

        private double CalcularHaversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double radioTierraKm = 6371.0;
            var dLat = GradosARadianes(lat2 - lat1);
            var dLon = GradosARadianes(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(GradosARadianes(lat1)) * Math.Cos(GradosARadianes(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return radioTierraKm * c;
        }

        private double GradosARadianes(double grados) => grados * Math.PI / 180.0;

        private string EstimarDuracion(double distanciaKm)
        {
            const double velocidadCruceroKmh = 830.0;
            const int tiempoFijoMinutos = 35;
            var minutosVuelo = (distanciaKm / velocidadCruceroKmh) * 60.0;
            var minutosTotales = (int)Math.Round(minutosVuelo + tiempoFijoMinutos);
            var horas = minutosTotales / 60;
            var minutos = minutosTotales % 60;
            return $"{horas:D2}:{minutos:D2}";
        }
    }
}