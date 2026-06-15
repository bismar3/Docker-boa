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
    }
}