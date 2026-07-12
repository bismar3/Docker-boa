using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
namespace MSVenta.Venta
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Forzamos una cultura fija (Bolivia: día/mes/año) para que el formato
            // de fechas sea siempre el mismo, sin importar si la app corre en
            // Windows (desarrollo) o Linux (Docker) — evita el bug de formato
            // "07/08/2026" vs "8/7/2026" según la configuración regional del SO.
            var cultura = new CultureInfo("es-BO");
            CultureInfo.DefaultThreadCurrentCulture = cultura;
            CultureInfo.DefaultThreadCurrentUICulture = cultura;

            CreateHostBuilder(args).Build().Run();
        }
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}