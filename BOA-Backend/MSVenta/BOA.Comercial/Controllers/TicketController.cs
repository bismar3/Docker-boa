using Microsoft.AspNetCore.Mvc;
using BOA.Comercial.Models;
using BOA.Comercial.Services;
using System;
using System.Threading.Tasks;

namespace BOA.Comercial.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        public TicketController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _ticketService.GetAll();
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
                var item = await _ticketService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Ticket no encontrado." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("venta/{ventaId}")]
        public async Task<ActionResult> GetByVentaId(int ventaId)
        {
            try
            {
                var items = await _ticketService.GetByVentaId(ventaId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Ticket ticket)
        {
            try
            {
                await _ticketService.Create(ticket);
                return Ok(new { message = "Ticket creado exitosamente.", data = ticket });
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
                var item = await _ticketService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Ticket no existe." });
                await _ticketService.Delete(id);
                return Ok(new { message = "Ticket eliminado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}