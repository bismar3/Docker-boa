using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class AeropuertoService : IAeropuertoService
    {
        private readonly ContextDatabase _context;
        private readonly HttpClient _httpClient;

        public AeropuertoService(ContextDatabase context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<Aeropuerto>> GetAll() =>
            await _context.Aeropuertos.ToListAsync();

        public async Task<Aeropuerto> GetById(int id) =>
            await _context.Aeropuertos.FindAsync(id);

        public async Task Create(Aeropuerto a)
        {
            _context.Aeropuertos.Add(a);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Aeropuerto a)
        {
            _context.Aeropuertos.Update(a);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var item = await _context.Aeropuertos.FindAsync(id);
            if (item != null)
            {
                _context.Aeropuertos.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<(double? Latitud, double? Longitud)> GeocodeCiudad(string ciudad, string pais)
        {
            var query = System.Uri.EscapeDataString($"{ciudad}, {pais}");
            var url = $"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1";

            ConfigurarUserAgent();

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return (null, null);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.GetArrayLength() == 0)
                return (null, null);

            var primero = doc.RootElement[0];
            var lat = double.Parse(primero.GetProperty("lat").GetString(), CultureInfo.InvariantCulture);
            var lon = double.Parse(primero.GetProperty("lon").GetString(), CultureInfo.InvariantCulture);

            return (lat, lon);
        }

        public async Task<List<AeropuertoSugerencia>> BuscarAeropuertos(string texto)
        {
            var resultado = new List<AeropuertoSugerencia>();

            var query = System.Uri.EscapeDataString($"{texto} aeropuerto");
            var url = $"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=10&addressdetails=1&namedetails=1";

            ConfigurarUserAgent();

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return resultado;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            foreach (var item in doc.RootElement.EnumerateArray())
            {
                // Filtrar solo resultados que sean realmente aeropuertos
                var claseOk = item.TryGetProperty("class", out var claseProp) && claseProp.GetString() == "aeroway";
                if (!claseOk) continue;

                string nombre = null;
                if (item.TryGetProperty("namedetails", out var nameDetails) &&
                    nameDetails.TryGetProperty("name", out var nameProp))
                {
                    nombre = nameProp.GetString();
                }
                if (string.IsNullOrEmpty(nombre) && item.TryGetProperty("display_name", out var displayProp))
                {
                    nombre = displayProp.GetString().Split(',')[0];
                }

                string ciudad = null;
                string pais = null;
                if (item.TryGetProperty("address", out var address))
                {
                    if (address.TryGetProperty("city", out var cityProp)) ciudad = cityProp.GetString();
                    else if (address.TryGetProperty("town", out var townProp)) ciudad = townProp.GetString();
                    else if (address.TryGetProperty("village", out var villageProp)) ciudad = villageProp.GetString();
                    else if (address.TryGetProperty("state", out var stateProp)) ciudad = stateProp.GetString();

                    if (address.TryGetProperty("country", out var countryProp)) pais = countryProp.GetString();
                }

                var lat = double.Parse(item.GetProperty("lat").GetString(), CultureInfo.InvariantCulture);
                var lon = double.Parse(item.GetProperty("lon").GetString(), CultureInfo.InvariantCulture);

                resultado.Add(new AeropuertoSugerencia
                {
                    Nombre = nombre ?? "Aeropuerto sin nombre",
                    Ciudad = ciudad ?? "",
                    Pais = pais ?? "",
                    Latitud = lat,
                    Longitud = lon
                });
            }

            return resultado;
        }

        private void ConfigurarUserAgent()
        {
            _httpClient.DefaultRequestHeaders.UserAgent.Clear();
            _httpClient.DefaultRequestHeaders.UserAgent.Add(
                new ProductInfoHeaderValue("BOA-SisVentas", "1.0"));
        }
    }
}