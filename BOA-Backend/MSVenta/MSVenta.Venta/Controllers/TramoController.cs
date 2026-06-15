using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TramoController : ControllerBase
    {
        private readonly ITramoService _tramoService;
        public TramoController(ITramoService tramoService)
        {
            _tramoService = tramoService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _tramoService.GetAll();
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
                var item = await _tramoService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tramo no encontrado." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Tramo tramo)
        {
            try
            {
                await _tramoService.Create(tramo);
                return CreatedAtAction(nameof(GetById), new { id = tramo.Id }, new { message = "Tramo creado exitosamente.", data = tramo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Tramo tramo)
        {
            if (id != tramo.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _tramoService.Update(tramo);
                return Ok(new { message = "Tramo actualizado correctamente." });
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
                var item = await _tramoService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tramo no existe." });
                await _tramoService.Delete(id);
                return Ok(new { message = "Tramo eliminado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}