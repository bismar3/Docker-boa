using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoClaseController : ControllerBase
    {
        private readonly ITipoClaseService _tipoClaseService;
        public TipoClaseController(ITipoClaseService tipoClaseService)
        {
            _tipoClaseService = tipoClaseService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _tipoClaseService.GetAll();
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
                var item = await _tipoClaseService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tipo de clase no encontrado." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] TipoClase tipoClase)
        {
            try
            {
                await _tipoClaseService.Create(tipoClase);
                return CreatedAtAction(nameof(GetById), new { id = tipoClase.Id }, new { message = "Tipo de clase creado exitosamente.", data = tipoClase });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] TipoClase tipoClase)
        {
            if (id != tipoClase.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _tipoClaseService.Update(tipoClase);
                return Ok(new { message = "Tipo de clase actualizado correctamente." });
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
                var item = await _tipoClaseService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Tipo de clase no existe." });
                await _tipoClaseService.Delete(id);
                return Ok(new { message = "Tipo de clase eliminado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}