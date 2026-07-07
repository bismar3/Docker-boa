using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProgramacionVueloController : ControllerBase
    {
        private readonly IProgramacionVueloService _programacionVueloService;
        public ProgramacionVueloController(IProgramacionVueloService programacionVueloService)
        {
            _programacionVueloService = programacionVueloService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _programacionVueloService.GetAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("buscar")]
        public async Task<ActionResult> Buscar([FromQuery] int origen, [FromQuery] int destino)
        {
            try
            {
                var items = await _programacionVueloService.BuscarPorTramo(origen, destino);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("ocupacion")]
        public async Task<ActionResult> GetOcupacion()
        {
            try
            {
                var items = await _programacionVueloService.GetOcupacion();
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
                var item = await _programacionVueloService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Programación de vuelo no encontrada." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ProgramacionVuelo programacionVuelo)
        {
            try
            {
                await _programacionVueloService.Create(programacionVuelo);
                return CreatedAtAction(nameof(GetById), new { id = programacionVuelo.Id },
                    new { message = "Programación creada exitosamente.", data = programacionVuelo });
            }
            catch (Exception ex)
            {
                var detalle = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = ex.Message, detalle = detalle });
            }
        }

        [HttpPost("{id}/regenerar-asientos")]
        public async Task<ActionResult> RegenerarAsientos(int id)
        {
            try
            {
                await _programacionVueloService.RegenerarAsientos(id);
                return Ok(new { message = "Asientos regenerados correctamente (o ya existían)." });
            }
            catch (Exception ex)
            {
                var detalle = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = ex.Message, detalle = detalle });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ProgramacionVuelo programacionVuelo)
        {
            if (id != programacionVuelo.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _programacionVueloService.Update(programacionVuelo);
                return Ok(new { message = "Programación actualizada correctamente." });
            }
            catch (Exception ex)
            {
                var detalle = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = ex.Message, detalle = detalle });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var item = await _programacionVueloService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Programación no existe." });
                await _programacionVueloService.Delete(id);
                return Ok(new { message = "Programación eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}