using Aforo255.Cross.Http.Src;
using Aforo255.Cross.Token.Src;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MSVenta.Venta.Repositories;
using MSVenta.Venta.Services;

namespace MSVenta.Venta
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddDbContext<ContextDatabase>(opt =>
            {
                opt.UseMySQL(Configuration["mysql:cn"]);
            });

            services.AddScoped<IAeropuertoService, AeropuertoService>();
            services.AddScoped<IAeronaveService, AeronaveService>();
            services.AddScoped<ITipoClaseService, TipoClaseService>();
            services.AddScoped<IEmpleadoService, EmpleadoService>();
            services.AddScoped<IRutaService, RutaService>();
            services.AddScoped<ITripulacionService, TripulacionService>();
            services.AddScoped<IProgramacionVueloService, ProgramacionVueloService>();
            services.AddScoped<ITramoService, TramoService>();
            services.AddScoped<IRutaTramoService, RutaTramoService>();
            services.AddScoped<IAsientoService, AsientoService>();

            services.AddProxyHttp();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseRouting();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}