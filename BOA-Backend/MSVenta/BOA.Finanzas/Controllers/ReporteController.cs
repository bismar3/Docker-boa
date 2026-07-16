using BOA.Finanzas.Models;
using BOA.Finanzas.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
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

        private string ConstruirCuerpoHtmlVentas(List<VentaDetalleDto> ventas, DateTime? desde, DateTime? hasta)
        {
            var confirmadas = ventas.Where(v => v.Estado == "Confirmada").ToList();
            var montoTotal = confirmadas.Sum(v => v.Monto_Total);
            var periodo = (desde.HasValue ? desde.Value.ToString("dd/MM/yyyy") : "Todo el periodo")
                + " al " + (hasta.HasValue ? hasta.Value.ToString("dd/MM/yyyy") : "Todo el periodo");

            var sb = new StringBuilder();
            sb.Append("<html><body style='font-family:Arial,sans-serif;color:#222;'>");
            sb.Append("<h2 style='color:#1a1a1a;'>BoA - Reporte de Ventas</h2>");
            sb.Append($"<p style='color:#666;margin:2px 0;'>Periodo: {periodo}</p>");
            sb.Append($"<p style='color:#999;font-size:12px;margin:2px 0 16px 0;'>Generado: {DateTime.Now:dd/MM/yyyy HH:mm}</p>");
            sb.Append($"<p><b>Total Ventas:</b> {ventas.Count} &nbsp;&nbsp; <b>Confirmadas:</b> {confirmadas.Count} &nbsp;&nbsp; <b>Monto Confirmado:</b> Bs. {montoTotal:F2}</p>");

            sb.Append("<table style='border-collapse:collapse;width:100%;margin-top:10px;font-size:13px;'>");
            sb.Append("<tr style='background:#1e293b;color:#fff;'>");
            sb.Append("<th style='padding:6px;text-align:left;'>Codigo</th>");
            sb.Append("<th style='padding:6px;text-align:left;'>Fecha</th>");
            sb.Append("<th style='padding:6px;text-align:left;'>Cliente</th>");
            sb.Append("<th style='padding:6px;text-align:left;'>Pago</th>");
            sb.Append("<th style='padding:6px;text-align:left;'>Monto</th>");
            sb.Append("<th style='padding:6px;text-align:left;'>Estado</th>");
            sb.Append("</tr>");

            foreach (var v in ventas)
            {
                var fecha = v.Created_At.HasValue ? v.Created_At.Value.ToString("dd/MM/yyyy HH:mm") : "-";
                sb.Append("<tr style='border-bottom:1px solid #ddd;'>");
                sb.Append($"<td style='padding:6px;'>{v.Codigo_Venta}</td>");
                sb.Append($"<td style='padding:6px;'>{fecha}</td>");
                sb.Append($"<td style='padding:6px;'>{v.Cliente_Nombre}</td>");
                sb.Append($"<td style='padding:6px;'>{v.Metodo_Pago}</td>");
                sb.Append($"<td style='padding:6px;'>Bs. {v.Monto_Total:F2}</td>");
                sb.Append($"<td style='padding:6px;'>{v.Estado}</td>");
                sb.Append("</tr>");
            }

            sb.Append("</table>");
            sb.Append("<p style='color:#888;font-size:12px;margin-top:16px;'>Tambien encontraras este reporte adjunto en formato PDF.</p>");
            sb.Append("</body></html>");

            return sb.ToString();
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
                string cuerpoHtml;

                switch (req.Tipo?.ToLower())
                {
                    case "ventas":
                        var ventas = await ObtenerVentasFiltradas(req.Desde, req.Hasta, req.Estado, req.MetodoPago);
                        pdfBytes = _pdfService.GenerarReporteVentas(ventas, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-ventas.pdf";
                        asunto = "BoA - Reporte de Ventas";
                        cuerpoHtml = ConstruirCuerpoHtmlVentas(ventas, req.Desde, req.Hasta);
                        break;

                    case "financiero":
                        var (ingresos, egresos) = await ObtenerFinancieroFiltrado(req.Desde, req.Hasta);
                        pdfBytes = _pdfService.GenerarReporteFinanciero(ingresos, egresos, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-financiero.pdf";
                        asunto = "BoA - Reporte Financiero";
                        cuerpoHtml = $"<html><body style='font-family:Arial,sans-serif;'><p>Adjunto encontrara el Reporte Financiero generado el {DateTime.Now:dd/MM/yyyy HH:mm}.</p></body></html>";
                        break;

                    case "ocupacion":
                        var vuelos = await ObtenerOcupacionFiltrada(req.Desde, req.Hasta);
                        pdfBytes = _pdfService.GenerarReporteOcupacion(vuelos, req.Desde, req.Hasta);
                        nombreArchivo = "reporte-ocupacion.pdf";
                        asunto = "BoA - Reporte de Ocupacion de Vuelos";
                        cuerpoHtml = $"<html><body style='font-family:Arial,sans-serif;'><p>Adjunto encontrara el Reporte de Ocupacion de Vuelos generado el {DateTime.Now:dd/MM/yyyy HH:mm}.</p></body></html>";
                        break;

                    default:
                        return BadRequest(new { message = "Tipo de reporte invalido. Use: ventas, financiero u ocupacion." });
                }

                await _emailService.EnviarConAdjunto(
                    req.Email,
                    asunto,
                    cuerpoHtml,
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