using Microsoft.AspNetCore.Mvc;
using BOA.Comercial.Models;
using BOA.Comercial.Services;
using System;
using System.Threading.Tasks;

namespace BOA.Comercial.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservaController : ControllerBase
    {
        private readonly IReservaService _reservaService;
        public ReservaController(IReservaService reservaService)
        {
            _reservaService = reservaService;
        }
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _reservaService.GetAll();
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
                var item = await _reservaService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Reserva no encontrada." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult> GetByClienteId(int clienteId)
        {
            try
            {
                var items = await _reservaService.GetByClienteId(clienteId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Reserva reserva)
        {
            try
            {
                await _reservaService.Create(reserva);
                return Ok(new { message = "Reserva creada exitosamente.", data = reserva });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Reserva reserva)
        {
            if (id != reserva.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _reservaService.Update(reserva);
                return Ok(new { message = "Reserva actualizada correctamente." });
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
                var item = await _reservaService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Reserva no existe." });
                await _reservaService.Delete(id);
                return Ok(new { message = "Reserva eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}