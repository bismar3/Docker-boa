using QuestPDF.Fluent;
using QuestPDF.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using BOA.Finanzas.Models;

namespace BOA.Finanzas.Services
{
    public class PdfReportService
    {
        public byte[] GenerarReporteVentas(List<VentaDetalleDto> ventas, DateTime? desde, DateTime? hasta)
        {
            var confirmadas = ventas.Where(v => v.Estado == "Confirmada").ToList();
            var montoTotal = confirmadas.Sum(v => v.Monto_Total);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(9));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("BoA - Reporte de Ventas").FontSize(18).Bold();
                        col.Item().Text($"Periodo: {FormatoFecha(desde)} al {FormatoFecha(hasta)}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        col.Item().Text($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(8).FontColor(Colors.Grey.Medium);
                    });

                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Ventas: {ventas.Count}").Bold();
                            row.RelativeItem().Text($"Confirmadas: {confirmadas.Count}").Bold();
                            row.RelativeItem().Text($"Monto Confirmado: Bs. {montoTotal:F2}").Bold();
                        });

                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Codigo").Bold();
                                header.Cell().Text("Fecha").Bold();
                                header.Cell().Text("Cliente").Bold();
                                header.Cell().Text("Pago").Bold();
                                header.Cell().Text("Monto").Bold();
                                header.Cell().Text("Estado").Bold();
                            });

                            foreach (var v in ventas)
                            {
                                table.Cell().Text(v.Codigo_Venta ?? "-");
                                table.Cell().Text(v.Created_At.HasValue ? v.Created_At.Value.ToString("dd/MM/yyyy HH:mm") : "-");
                                table.Cell().Text(v.Cliente_Nombre ?? "-");
                                table.Cell().Text(v.Metodo_Pago ?? "-");
                                table.Cell().Text($"Bs. {v.Monto_Total:F2}");
                                table.Cell().Text(v.Estado ?? "-");
                            }
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("BOA-SisVentas | Pagina ");
                        x.CurrentPageNumber();
                    });
                });
            }).GeneratePdf();
        }

        public byte[] GenerarReporteFinanciero(List<Ingreso> ingresos, List<Egreso> egresos, DateTime? desde, DateTime? hasta)
        {
            var totalIngresos = ingresos.Sum(i => i.Monto);
            var totalEgresos = egresos.Sum(e => e.Monto);
            var balance = totalIngresos - totalEgresos;

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(9));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("BoA - Reporte Financiero").FontSize(18).Bold();
                        col.Item().Text($"Periodo: {FormatoFecha(desde)} al {FormatoFecha(hasta)}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        col.Item().Text($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(8).FontColor(Colors.Grey.Medium);
                    });

                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Ingresos: Bs. {totalIngresos:F2}").FontColor(Colors.Green.Darken1).Bold();
                            row.RelativeItem().Text($"Total Egresos: Bs. {totalEgresos:F2}").FontColor(Colors.Red.Darken1).Bold();
                            row.RelativeItem().Text($"Balance: Bs. {balance:F2}").Bold();
                        });

                        col.Item().PaddingTop(15).Text("Ingresos").FontSize(12).Bold();
                        col.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });
                            table.Header(header =>
                            {
                                header.Cell().Text("Codigo Venta").Bold();
                                header.Cell().Text("Concepto").Bold();
                                header.Cell().Text("Fecha").Bold();
                                header.Cell().Text("Monto").Bold();
                            });
                            foreach (var i in ingresos)
                            {
                                table.Cell().Text(i.Codigo_Venta ?? "-");
                                table.Cell().Text(i.Concepto ?? "-");
                                table.Cell().Text(i.Fecha.ToString("dd/MM/yyyy"));
                                table.Cell().Text($"Bs. {i.Monto:F2}");
                            }
                        });

                        col.Item().PaddingTop(15).Text("Egresos").FontSize(12).Bold();
                        col.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });
                            table.Header(header =>
                            {
                                header.Cell().Text("Codigo").Bold();
                                header.Cell().Text("Motivo").Bold();
                                header.Cell().Text("Fecha").Bold();
                                header.Cell().Text("Monto").Bold();
                            });
                            foreach (var e in egresos)
                            {
                                table.Cell().Text(e.Codigo_Venta ?? "-");
                                table.Cell().Text(e.Motivo ?? "-");
                                table.Cell().Text(e.Fecha.ToString("dd/MM/yyyy"));
                                table.Cell().Text($"Bs. {e.Monto:F2}");
                            }
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("BOA-SisVentas | Pagina ");
                        x.CurrentPageNumber();
                    });
                });
            }).GeneratePdf();
        }

        public byte[] GenerarReporteOcupacion(List<OcupacionVueloDto> vuelos, DateTime? desde, DateTime? hasta)
        {
            var promedioOcupacion = vuelos.Count > 0 ? vuelos.Average(v => v.Porcentaje_Ocupacion) : 0;

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(9));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("BoA - Reporte de Ocupacion de Vuelos").FontSize(18).Bold();
                        col.Item().Text($"Periodo: {FormatoFecha(desde)} al {FormatoFecha(hasta)}").FontSize(10).FontColor(Colors.Grey.Darken1);
                        col.Item().Text($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(8).FontColor(Colors.Grey.Medium);
                    });

                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Item().Text($"Vuelos analizados: {vuelos.Count} | Ocupacion promedio: {promedioOcupacion:F1}%").Bold();

                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                                c.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Vuelo").Bold();
                                header.Cell().Text("Fecha").Bold();
                                header.Cell().Text("Total").Bold();
                                header.Cell().Text("Ocupados").Bold();
                                header.Cell().Text("% Ocup.").Bold();
                            });

                            foreach (var v in vuelos)
                            {
                                table.Cell().Text(v.Codigo_Vuelo ?? "-");
                                table.Cell().Text(v.Fecha_Salida ?? "-");
                                table.Cell().Text(v.Total_Asientos.ToString());
                                table.Cell().Text(v.Asientos_Ocupados.ToString());
                                table.Cell().Text($"{v.Porcentaje_Ocupacion:F1}%");
                            }
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("BOA-SisVentas | Pagina ");
                        x.CurrentPageNumber();
                    });
                });
            }).GeneratePdf();
        }

        private string FormatoFecha(DateTime? f) => f.HasValue ? f.Value.ToString("dd/MM/yyyy") : "Todo el periodo";
    }
}