using BOA.Finanzas.Models;
using BOA.Finanzas.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace BOA.Finanzas.Services
{
    public class RabbitMQConsumer : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private const string QUEUE_PAGO = "pago.confirmado";
        private IConnection _connection;
        private IChannel _channel;

        public RabbitMQConsumer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var factory = new ConnectionFactory { HostName = "localhost" };
                _connection = await factory.CreateConnectionAsync();
                _channel = await _connection.CreateChannelAsync();

                await _channel.QueueDeclareAsync(
                    queue: QUEUE_PAGO,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null
                );

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += async (model, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var mensaje = Encoding.UTF8.GetString(body);
                        var evento = JsonSerializer.Deserialize<JsonElement>(mensaje);

                        Console.WriteLine($"[RabbitMQ] Evento recibido: {mensaje}");

                        using var scope = _serviceProvider.CreateScope();
                        var context = scope.ServiceProvider.GetRequiredService<ContextDatabase>();

                        var ingreso = new Ingreso
                        {
                            Codigo_Venta = evento.GetProperty("CodigoVenta").GetString(),
                            Cliente_Id = evento.GetProperty("ClienteId").GetInt32(),
                            Programacion_Vuelo_Id = evento.GetProperty("ProgramacionVueloId").GetInt32(),
                            Monto = evento.GetProperty("Monto").GetDecimal(),
                            Concepto = "Venta de ticket",
                            Invoice_Id = evento.TryGetProperty("InvoiceId", out var inv) ? inv.GetString() : null,
                            Fecha = DateTime.Now,
                            Estado = "Aprobado"
                        };

                        context.Ingresos.Add(ingreso);
                        await context.SaveChangesAsync();

                        Console.WriteLine($"[Finanzas] Ingreso registrado: {ingreso.Codigo_Venta} - ${ingreso.Monto}");

                        await _channel.BasicAckAsync(ea.DeliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Finanzas] Error al procesar mensaje: {ex.Message}");
                    }
                };

                await _channel.BasicConsumeAsync(QUEUE_PAGO, false, consumer);

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] Error al conectar: {ex.Message}");
            }
        }

        public override void Dispose()
        {
            _channel?.CloseAsync();
            _connection?.CloseAsync();
            base.Dispose();
        }
    }
}