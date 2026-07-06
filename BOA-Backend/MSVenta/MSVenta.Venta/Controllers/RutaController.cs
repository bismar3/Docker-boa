using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RutaController : ControllerBase
    {
        private readonly IRutaService _rutaService;
        public RutaController(IRutaService rutaService)
        {
            _rutaService = rutaService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _rutaService.GetAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("calcular-distancia")]
        public async Task<ActionResult> CalcularDistancia([FromQuery] int origenId, [FromQuery] int destinoId)
        {
            try
            {
                if (origenId == 0 || destinoId == 0)
                    return BadRequest(new { message = "Debe indicar origenId y destinoId." });
                var resultado = await _rutaService.CalcularDistancia(origenId, destinoId);
                if (resultado.DistanciaKm == null)
                    return NotFound(new { message = "No se encontraron coordenadas para uno o ambos aeropuertos." });
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("calcular-llegada")]
        public async Task<ActionResult> CalcularLlegada([FromQuery] int rutaId, [FromQuery] string fechaSalida, [FromQuery] string horaSalida)
        {
            try
            {
                if (rutaId == 0 || string.IsNullOrEmpty(fechaSalida) || string.IsNullOrEmpty(horaSalida))
                    return BadRequest(new { message = "Debe indicar rutaId, fechaSalida y horaSalida." });

                if (!DateTime.TryParse(fechaSalida, out var fecha))
                    return BadRequest(new { message = "Formato de fecha inválido (use yyyy-MM-dd)." });

                if (!TimeSpan.TryParse(horaSalida, out var hora))
                    return BadRequest(new { message = "Formato de hora inválido (use HH:mm)." });

                var resultado = await _rutaService.CalcularLlegada(rutaId, fecha, hora);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            try
            {
                var item = await _rutaService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Ruta no encontrada." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Ruta ruta)
        {
            try
            {
                await _rutaService.Create(ruta);
                return CreatedAtAction(nameof(GetById), new { id = ruta.Id }, new { message = "Ruta creada exitosamente.", data = ruta });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Ruta ruta)
        {
            if (id != ruta.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _rutaService.Update(ruta);
                return Ok(new { message = "Ruta actualizada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var item = await _rutaService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Ruta no existe." });
                await _rutaService.Delete(id);
                return Ok(new { message = "Ruta eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}