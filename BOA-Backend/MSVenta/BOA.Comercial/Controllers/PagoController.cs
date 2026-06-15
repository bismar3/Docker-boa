using Microsoft.AspNetCore.Mvc;
using BOA.Comercial.Models;
using BOA.Comercial.Services;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace BOA.Comercial.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagoController : ControllerBase
    {
        private readonly IVentaService _ventaService;
        private readonly ITicketService _ticketService;
        private readonly ITransaccionService _transaccionService;
        private readonly IClienteService _clienteService;
        private readonly HttpClient _httpClient;

        private const string LIBELULA_APPKEY = "11bb10ce-68ba-4af1-8eb7-4e6624fed729";
        private const string LIBELULA_URL = "https://api.libelula.bo/rest/deuda/registrar";
        private const string LIBELULA_VERIFICAR_URL = "https://api.libelula.bo/rest/deuda/consultar_pagos";
        private const string CALLBACK_URL = "https://daybed-ivory-rewire.ngrok-free.dev/api/pago/callback";
        private const string URL_RETORNO = "https://daybed-ivory-rewire.ngrok-free.dev/dashboard/cliente/mis-compras";

        public PagoController(
            IVentaService ventaService,
            ITicketService ticketService,
            ITransaccionService transaccionService,
            IClienteService clienteService)
        {
            _ventaService = ventaService;
            _ticketService = ticketService;
            _transaccionService = transaccionService;
            _clienteService = clienteService;
            _httpClient = new HttpClient();
        }

        [HttpPost("registrar")]
        public async Task<ActionResult> RegistrarPago([FromBody] PagoRequest request)
        {
            try
            {
                var cliente = await _clienteService.GetById(request.ClienteId);
                if (cliente == null)
                    return NotFound(new { message = "Cliente no encontrado." });

                var codigoVenta = "VTA-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

                var venta = new Venta
                {
                    Codigo_Venta = codigoVenta,
                    Programacion_Vuelo_Id = request.ProgramacionVueloId,
                    Cliente_Id = request.ClienteId,
                    Monto_Total = request.MontoTotal,
                    Estado = "Pendiente"
                };
                var ventaCreada = await _ventaService.Create(venta);

                var payload = new
                {
                    appkey = LIBELULA_APPKEY,
                    email_cliente = cliente.Email,
                    identificador = codigoVenta,
                    callback_url = CALLBACK_URL,
                    url_retorno = URL_RETORNO,
                    descripcion = $"Compra de ticket BOA - Vuelo {request.ProgramacionVueloId}",
                    nombre_cliente = cliente.Nombre,
                    apellido_cliente = cliente.Apellido,
                    ci = cliente.Documento_Identidad,
                    fecha_vencimiento = DateTime.Now.AddHours(2).ToString("yyyy-MM-dd HH:mm:ss"),
                    lineas_detalle_deuda = request.Asientos
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                try
                {
                    var response = await _httpClient.PostAsync(LIBELULA_URL, content);
                    var responseBody = await response.Content.ReadAsStringAsync();
                    var libelulaResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);

                    if (libelulaResponse.GetProperty("error").GetInt32() == 0)
                    {
                        var idTransaccion = libelulaResponse.GetProperty("id_transaccion").GetString();

                        // Guardar transacción pendiente con id de Libélula
                        var transaccion = new Transaccion
                        {
                            Venta_Id = ventaCreada.Id,
                            Referencia = idTransaccion,
                            Monto = request.MontoTotal,
                            Metodo_Pago = "QR",
                            Estado = "Pendiente"
                        };
                        await _transaccionService.Create(transaccion);

                        return Ok(new
                        {
                            ventaId = ventaCreada.Id,
                            codigoVenta = codigoVenta,
                            idTransaccion = idTransaccion,
                            urlPasarela = libelulaResponse.GetProperty("url_pasarela_pagos").GetString(),
                            qrUrl = libelulaResponse.GetProperty("qr_simple_url").GetString(),
                            modo = "libelula"
                        });
                    }
                }
                catch
                {
                    // Modo simulación
                    var simId = "SIM-" + Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper();

                    var transaccionSim = new Transaccion
                    {
                        Venta_Id = ventaCreada.Id,
                        Referencia = simId,
                        Monto = request.MontoTotal,
                        Metodo_Pago = "QR",
                        Estado = "Pendiente"
                    };
                    await _transaccionService.Create(transaccionSim);

                    return Ok(new
                    {
                        ventaId = ventaCreada.Id,
                        codigoVenta = codigoVenta,
                        idTransaccion = simId,
                        urlPasarela = (string)null,
                        qrUrl = (string)null,
                        modo = "simulacion"
                    });
                }

                return StatusCode(500, new { message = "Error al registrar pago en Libélula." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("callback")]
        public async Task<ActionResult> Callback(
            [FromQuery] string transaction_id,
            [FromQuery] string invoice_id,
            [FromQuery] string invoice_url)
        {
            try
            {
                // Libélula manda transaction_id = nuestro codigo_venta (identificador)
                var ventas = await _ventaService.GetAll();
                var venta = ventas.FirstOrDefault(v => v.Codigo_Venta == transaction_id);

                if (venta == null)
                    return NotFound(new { message = "Venta no encontrada para: " + transaction_id });

                // Actualizar venta a Confirmada
                venta.Estado = "Confirmada";
                await _ventaService.Update(venta);

                // Actualizar transacción a Aprobado
                var transacciones = await _transaccionService.GetAll();
                var transaccion = transacciones.FirstOrDefault(t => t.Venta_Id == venta.Id);
                if (transaccion != null)
                {
                    transaccion.Estado = "Aprobado";
                    await _transaccionService.Update(transaccion);
                }

                return Ok(new
                {
                    message = "Pago confirmado correctamente.",
                    codigoVenta = venta.Codigo_Venta,
                    invoiceId = invoice_id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("verificar/{transactionId}")]
        public async Task<ActionResult> VerificarPago(string transactionId)
        {
            try
            {
                if (transactionId.StartsWith("SIM-"))
                    return Ok(new { pagado = true, modo = "simulacion" });

                var payload = new
                {
                    appkey = LIBELULA_APPKEY,
                    fecha_inicial = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss"),
                    fecha_final = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss")
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(LIBELULA_VERIFICAR_URL, content);
                var responseBody = await response.Content.ReadAsStringAsync();
                var libelulaResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);

                if (libelulaResponse.GetProperty("error").GetInt32() == 0)
                {
                    var datos = libelulaResponse.GetProperty("datos");
                    foreach (var pago in datos.EnumerateArray())
                    {
                        if (pago.GetProperty("id_transaccion").GetString() == transactionId)
                            return Ok(new { pagado = true, modo = "libelula" });
                    }
                }

                return Ok(new { pagado = false, modo = "libelula" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class PagoRequest
    {
        public int ClienteId { get; set; }
        public int ProgramacionVueloId { get; set; }
        public decimal MontoTotal { get; set; }
        public List<AsientoDetalle> Asientos { get; set; }
    }

    public class AsientoDetalle
    {
        public string concepto { get; set; }
        public int cantidad { get; set; }
        public decimal costo_unitario { get; set; }
        public decimal descuento_unitario { get; set; }
    }
}