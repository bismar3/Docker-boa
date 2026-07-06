using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Services;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalidaController : ControllerBase
    {
        private readonly ISalidaService _salidaService;
        private readonly HttpClient _httpClient;
        private const string COMERCIAL_URL = "http://localhost:6004";

        public SalidaController(ISalidaService salidaService)
        {
            _salidaService = salidaService;
            _httpClient = new HttpClient();
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _salidaService.GetAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("registrar/{programacionVueloId}")]
        public async Task<ActionResult> RegistrarSalida(int programacionVueloId)
        {
            try
            {
                // Consultar ventas confirmadas de este vuelo en Comercial
                var response = await _httpClient.GetAsync($"{COMERCIAL_URL}/api/venta/detalle");
                var body = await response.Content.ReadAsStringAsync();
                var ventas = JsonSerializer.Deserialize<JsonElement>(body);

                decimal montoTotal = 0;
                int cantidadPasajes = 0;

                foreach (var venta in ventas.EnumerateArray())
                {
                    var progId = venta.GetProperty("programacion_Vuelo_Id").GetInt32();
                    var estado = venta.GetProperty("estado").GetString();

                    if (progId == programacionVueloId && estado == "Confirmada")
                    {
                        montoTotal += venta.GetProperty("monto_Total").GetDecimal();
                        cantidadPasajes++;
                    }
                }

                var salida = await _salidaService.RegistrarSalida(programacionVueloId, montoTotal, cantidadPasajes);

                return Ok(new
                {
                    message = "Salida registrada exitosamente.",
                    data = salida
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}