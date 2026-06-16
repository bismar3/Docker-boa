using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsientoController : ControllerBase
    {
        private readonly IAsientoService _asientoService;

        public AsientoController(IAsientoService asientoService)
        {
            _asientoService = asientoService;
        }

        [HttpGet("programacion/{programacionId}")]
        public async Task<ActionResult> GetByProgramacion(int programacionId)
        {
            try
            {
                var items = await _asientoService.GetByProgramacion(programacionId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}/ocupar")]
        public async Task<ActionResult> OcuparAsiento(int id)
        {
            try
            {
                var asiento = await _asientoService.GetById(id);
                if (asiento == null)
                    return NotFound(new { message = "Asiento no encontrado." });

                asiento.Estado = "Ocupado";
                await _asientoService.Update(asiento);

                return Ok(new { message = "Asiento marcado como ocupado.", id = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}