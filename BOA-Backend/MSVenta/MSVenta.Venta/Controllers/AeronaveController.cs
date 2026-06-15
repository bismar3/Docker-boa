using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AeronaveController : ControllerBase
    {
        private readonly IAeronaveService _aeronaveService;
        public AeronaveController(IAeronaveService aeronaveService)
        {
            _aeronaveService = aeronaveService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _aeronaveService.GetAll();
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
                var item = await _aeronaveService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Aeronave no encontrada." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Aeronave aeronave)
        {
            try
            {
                await _aeronaveService.Create(aeronave);
                return CreatedAtAction(nameof(GetById), new { id = aeronave.Id }, new { message = "Aeronave creada exitosamente.", data = aeronave });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("con-asientos")]
        public async Task<ActionResult> CreateConAsientos([FromBody] AeronaveConAsientosDTO dto)
        {
            try
            {
                var result = await _aeronaveService.CreateConAsientos(dto);
                return Ok(new { message = "Aeronave creada con asientos exitosamente.", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Aeronave aeronave)
        {
            if (id != aeronave.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _aeronaveService.Update(aeronave);
                return Ok(new { message = "Aeronave actualizada correctamente." });
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
                var item = await _aeronaveService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Aeronave no existe." });
                await _aeronaveService.Delete(id);
                return Ok(new { message = "Aeronave eliminada correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}