using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripulacionController : ControllerBase
    {
        private readonly ITripulacionService _tripulacionService;
        public TripulacionController(ITripulacionService tripulacionService)
        {
            _tripulacionService = tripulacionService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _tripulacionService.GetAll();
                return Ok(items);
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
                var item = await _tripulacionService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tripulación no encontrada." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Tripulacion tripulacion)
        {
            try
            {
                await _tripulacionService.Create(tripulacion);
                return CreatedAtAction(nameof(GetById), new { id = tripulacion.Id }, new { message = "Tripulación creada exitosamente.", data = tripulacion });
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
                var item = await _tripulacionService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tripulación no existe." });
                await _tripulacionService.Delete(id);
                return Ok(new { message = "Tripulación eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}