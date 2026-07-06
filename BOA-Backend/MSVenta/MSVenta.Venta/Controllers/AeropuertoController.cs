using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AeropuertoController : ControllerBase
    {
        private readonly IAeropuertoService _aeropuertoService;

        public AeropuertoController(IAeropuertoService aeropuertoService)
        {
            _aeropuertoService = aeropuertoService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var items = await _aeropuertoService.GetAll();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("geocode")]
        public async Task<ActionResult> Geocode([FromQuery] string ciudad, [FromQuery] string pais)
        {
            try
            {
                var resultado = await _aeropuertoService.GeocodeCiudad(ciudad, pais);
                if (resultado.Latitud == null || resultado.Longitud == null)
                    return NotFound(new { message = "No se encontraron coordenadas para esa ciudad." });

                return Ok(new { latitud = resultado.Latitud, longitud = resultado.Longitud });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("buscar")]
        public async Task<ActionResult> BuscarAeropuertos([FromQuery] string texto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(texto) || texto.Length < 2)
                    return Ok(new List<AeropuertoSugerencia>());

                var resultados = await _aeropuertoService.BuscarAeropuertos(texto);
                return Ok(resultados);
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
                var item = await _aeropuertoService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Aeropuerto no encontrado." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Aeropuerto aeropuerto)
        {
            try
            {
                await _aeropuertoService.Create(aeropuerto);
                return CreatedAtAction(nameof(GetById), new { id = aeropuerto.Id }, new { message = "Aeropuerto creado exitosamente.", data = aeropuerto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Aeropuerto aeropuerto)
        {
            if (id != aeropuerto.Id)
                return BadRequest(new { message = "El ID no coincide." });
            try
            {
                await _aeropuertoService.Update(aeropuerto);
                return Ok(new { message = "Aeropuerto actualizado correctamente." });
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
                var item = await _aeropuertoService.GetById(id);
                if (item == null)
                    return NotFound(new { message = "Aeropuerto no existe." });
                await _aeropuertoService.Delete(id);
                return Ok(new { message = "Aeropuerto eliminado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}