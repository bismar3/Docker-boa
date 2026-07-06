using BOA.Finanzas.Models;
using BOA.Finanzas.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BOA.Finanzas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EgresoController : ControllerBase
    {
        private readonly IEgresoService _egresoService;

        public EgresoController(IEgresoService egresoService)
        {
            _egresoService = egresoService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _egresoService.GetAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Egreso egreso)
        {
            try
            {
                var result = await _egresoService.Create(egreso);
                return Ok(new { message = "Egreso registrado.", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}