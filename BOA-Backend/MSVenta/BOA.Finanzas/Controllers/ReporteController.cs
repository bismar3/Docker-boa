using BOA.Finanzas.Models;
using BOA.Finanzas.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace BOA.Finanzas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReporteController : ControllerBase
    {
        private readonly IIngresoService _ingresoService;
        private readonly IEgresoService _egresoService;
        private readonly IEmailService _emailService;
        private readonly PdfReportService _pdfService;
        private readonly HttpClient _httpClient;
        private readonly string _urlComercial;
        private readonly string _urlOperaciones;

        public ReporteController(
            IIngresoService ingresoService,
            IEgresoService egresoService,
            IEmailService emailService,
            PdfReportService pdfService,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _ingresoService = ingresoService;
            _egresoService = egresoService;
            _emailService = emailService;
            _pdfService = pdfService;
            _httpClient = httpClientFactory.CreateClient();
            _urlComercial = configuration["ServiciosUrls:Comercial"] ?? "http://localhost:6004";
            _urlOperaciones = configuration["ServiciosUrls:Operaciones"] ?? "http://localhost:6002";
        }

        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        private async Task<List<VentaDetalleDto>> ObtenerVentasFiltradas(DateTime? desde, DateTime? hasta, string estado, string metodoPago)
        {
            var json = await _httpClient.GetStringAsync($"{_urlComercial}/api/venta/detalle");
            var ventas = JsonSerializer.Deserialize<List<VentaDetalleDto>>(json, _jsonOptions) ?? new List<VentaDetalleDto>();

            if (!string.IsNullOrEmpty(estado) && estado != "Todos")
                ventas = ventas.Where(v => v.Estado == estado).ToList();

            if (!string.IsNullOrEmpty(metodoPago) && metodoPago != "Todos")
                ventas = ventas.Where(v => v.Metodo_Pago == metodoPago).ToList();

            if (desde.HasValue)
                ventas = ventas.Where(v => v.Created_At.HasValue && v.Created_At.Value.Date >= desde.Value.Date).ToList();

            if (hasta.HasValue)
                ventas = ventas.Where(v => v.Created_At.HasValue && v.Created_At.Value.Date <= hasta.Value.Date).ToList();

            return ventas;
        }

        [HttpGet("ventas/pdf")]
        public async Task<ActionResult> ReporteVentasPdf([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, [FromQuery] string estado = "Todos", [FromQuery] string metodoPago = "Todos")
        {
            try
            {
                var ventas = await ObtenerVentasFiltradas(desde, hasta, estado, metodoPago);
                var pdfBytes = _pdfService.GenerarReporteVentas(ventas, desde, hasta);
                return File(pdfBytes, "application/pdf", $"reporte-ventas-{DateTime.Now:yyyyMMdd-HHmm}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private async Task<(List<Ingreso> ingresos, List<Egreso> egresos)> ObtenerFinancieroFiltrado(DateTime? desde, DateTime? hasta)
        {
            var ingresos = (await _ingresoService.GetAll()).ToList();
            var egresos = (await _egresoService.GetAll()).ToList();

            if (desde.HasValue)
            {
                ingresos = ingresos.Where(i => i.Fecha.Date >= desde.Value.Date).ToList();
                egresos = egresos.Where(e => e.Fecha.Date >= desde.Value.Date).ToList();
            }
            if (hasta.HasValue)
            {
                ingresos = ingresos.Where(i => i.Fecha.Date <= hasta.Value.Date).ToList();
                egresos = egresos.Where(e => e.Fecha.Date <= hasta.Value.Date).ToList();
            }

            return (ingresos, egresos);
        }

        [HttpGet("financiero/pdf")]
        public async Task<ActionResult> ReporteFinancieroPdf([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            try
            {
                var (ingresos, egresos) = await ObtenerFinancieroFiltrado(desde, hasta);
                var pdfBytes = _pdfService.GenerarReporteFinanciero(ingresos, egresos, desde, hasta);
                return File(pdfBytes, "application/pdf", $"reporte-financiero-{DateTime.Now:yyyyMMdd-HHmm}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private async Task<List<OcupacionVueloDto>> ObtenerOcupacionFiltrada(DateTime? desde, DateTime? hasta)
        {
            var json = await _httpClient.GetStringAsync($"{_urlOperaciones}/api/programacionvuelo/ocupacion");
            var vuelos = JsonSerializer.Deserialize<List<OcupacionVueloDto>>(json, _jsonOptions) ?? new List<OcupacionVueloDto>();

            if (desde.HasValue || hasta.HasValue)
            {
                vuelos = vuelos.Where(v =>
                {
                    if (!DateTime.TryParse(NormalizarFecha(v.Fecha_Salida), out var fechaVuelo)) return true;
                    if (desde.HasValue && fechaVuelo.Date < desde.Value.Date) return false;
                    if (hasta.HasValue && fechaVuelo.Date > hasta.Value.Date) return false;
                    return true;
                }).ToList();
            }

            return vuelos;
        }

        private string NormalizarFecha(string valor)
        {
            if (string.IsNullOrEmpty(valor)) return valor;
            return valor.Split(' ')[0];
        }

        [HttpGet("ocupacion/pdf")]
        public async Task<ActionResult> ReporteOcupacionPdf([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        {
            try
            {
                var vuelos = await ObtenerOcupacionFiltrada(desde, hasta);
                var pdfBytes = _pdfService.GenerarReporteOcupacion(vuelos, desde, hasta);
                return File(pdfBytes, "application/pdf", $"reporte-ocupacion-{DateTime.Now:yyyyMMdd-HHmm}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        public class EnviarReporteRequest
        {
            public string Tipo { get; set; }
            public DateTime? Desde { get; set; }
            public DateTime? Hasta { get; set; }
            public string Estado { get; set; }
            public string MetodoPago { get; set; }
            public string Email { get; set; }
        }

        [HttpPost("enviar")]
        public async Task<ActionResult> EnviarReporte([FromBody] EnviarReporteRequest req)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(req.Email))
                    return BadRequest(new { message = "Debe indicar un email destino." });

                byte[] pdfBytes;
                string nombreArchivo;
                string asunto;

                switch (req.Tipo?.ToLower())
                {
                    case "ventas":
                        var ventas = await ObtenerVentasFiltradas(req.Desde, req.Hasta, req.Estado, req.MetodoPago);
                        pdfBytes = _pdfService.GenerarReporteVentas(ventas, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-ventas.pdf";
                        asunto = "BoA - Reporte de Ventas";
                        break;

                    case "financiero":
                        var (ingresos, egresos) = await ObtenerFinancieroFiltrado(req.Desde, req.Hasta);
                        pdfBytes = _pdfService.GenerarReporteFinanciero(ingresos, egresos, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-financiero.pdf";
                        asunto = "BoA - Reporte Financiero";
                        break;

                    case "ocupacion":
                        var vuelos = await ObtenerOcupacionFiltrada(req.Desde, req.Hasta);
                        pdfBytes = _pdfService.GenerarReporteOcupacion(vuelos, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-ocupacion.pdf";
                        asunto = "BoA - Reporte de Ocupacion de Vuelos";
                        break;

                    default:
                        return BadRequest(new { message = "Tipo de reporte invalido. Use: ventas, financiero u ocupacion." });
                }

                await _emailService.EnviarConAdjunto(
                    req.Email,
                    asunto,
                    $"Adjunto encontrara el {asunto.Replace("BoA - ", "")} generado el {DateTime.Now:dd/MM/yyyy HH:mm}.",
                    pdfBytes,
                    nombreArchivo
                );

                return Ok(new { message = $"Reporte enviado correctamente a {req.Email}." });
            }
            catch (Exception ex)
            {
                var detalle = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = "Error al enviar el reporte.", detalle = detalle });
            }
        }
    }
}