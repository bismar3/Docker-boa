using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RutaTramoController : ControllerBase
    {
        private readonly IRutaTramoService _rutaTramoService;

        public RutaTramoController(IRutaTramoService rutaTramoService)
        {
            _rutaTramoService = rutaTramoService;
        }

        [HttpGet("ruta/{rutaId}")]
        public async Task<ActionResult> GetByRutaId(int rutaId)
        {
            try
            {
                var items = await _rutaTramoService.GetByRutaId(rutaId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Add([FromBody] RutaTramo rutaTramo)
        {
            try
            {
                await _rutaTramoService.Add(rutaTramo);
                return Ok(new { message = "Tramo agregado a la ruta." });
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
                await _rutaTramoService.Delete(id);
                return Ok(new { message = "Tramo quitado de la ruta." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}