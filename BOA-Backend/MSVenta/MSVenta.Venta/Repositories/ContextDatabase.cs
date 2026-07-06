using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;

namespace MSVenta.Venta.Repositories
{
    public class ContextDatabase : DbContext
    {
        public ContextDatabase(DbContextOptions<ContextDatabase> options) : base(options) { }

        public DbSet<Aeropuerto> Aeropuertos { get; set; }
        public DbSet<Aeronave> Aeronaves { get; set; }
        public DbSet<TipoClase> TipoClases { get; set; }
        public DbSet<Asiento> Asientos { get; set; }
        public DbSet<Ruta> Rutas { get; set; }
        public DbSet<Tramo> Tramos { get; set; }
        public DbSet<RutaTramo> RutaTramos { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<ProgramacionVuelo> ProgramacionVuelos { get; set; }
        public DbSet<Tripulacion> Tripulaciones { get; set; }
        public DbSet<AsientoProgramacion> AsientoProgramaciones { get; set; }
        public DbSet<ProgramacionPrecio> ProgramacionPrecios { get; set; }
        public DbSet<Salida> Salidas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Aeropuerto>().ToTable("aeropuertos");
            modelBuilder.Entity<Aeronave>().ToTable("aeronaves");
            modelBuilder.Entity<TipoClase>().ToTable("tipo_clases");
            modelBuilder.Entity<Asiento>().ToTable("asientos");
            modelBuilder.Entity<Ruta>().ToTable("rutas");
            modelBuilder.Entity<Tramo>().ToTable("tramos");
            modelBuilder.Entity<RutaTramo>().ToTable("ruta_tramo");
            modelBuilder.Entity<Empleado>().ToTable("empleados");
            modelBuilder.Entity<ProgramacionVuelo>().ToTable("programacion_vuelos");
            modelBuilder.Entity<Tripulacion>().ToTable("tripulaciones");
            modelBuilder.Entity<AsientoProgramacion>().ToTable("asiento_programacion");
            modelBuilder.Entity<ProgramacionPrecio>().ToTable("programacion_precios");
            modelBuilder.Entity<Salida>().ToTable("salidas");

            // Tramo
            modelBuilder.Entity<Tramo>()
                .HasOne<Aeropuerto>()
                .WithMany()
                .HasForeignKey(t => t.Aeropuerto_Origen_Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tramo>()
                .HasOne<Aeropuerto>()
                .WithMany()
                .HasForeignKey(t => t.Aeropuerto_Destino_Id)
                .OnDelete(DeleteBehavior.Restrict);

            // RutaTramo
            modelBuilder.Entity<RutaTramo>()
                .HasOne(rt => rt.Ruta)
                .WithMany()
                .HasForeignKey(rt => rt.Ruta_Id);

            modelBuilder.Entity<RutaTramo>()
                .HasOne(rt => rt.Tramo)
                .WithMany()
                .HasForeignKey(rt => rt.Tramo_Id);

            // Asiento
            modelBuilder.Entity<Asiento>()
                .HasOne(a => a.Aeronave)
                .WithMany()
                .HasForeignKey(a => a.Aeronave_Id);

            modelBuilder.Entity<Asiento>()
                .HasOne(a => a.TipoClase)
                .WithMany()
                .HasForeignKey(a => a.Tipo_Clase_Id);

            // Tripulacion
            modelBuilder.Entity<Tripulacion>()
                .HasOne(t => t.ProgramacionVuelo)
                .WithMany()
                .HasForeignKey(t => t.Programacion_Vuelo_Id);

            modelBuilder.Entity<Tripulacion>()
                .HasOne(t => t.Empleado)
                .WithMany()
                .HasForeignKey(t => t.Empleado_Id);

            // AsientoProgramacion
            modelBuilder.Entity<AsientoProgramacion>()
                .HasOne(ap => ap.Asiento)
                .WithMany()
                .HasForeignKey(ap => ap.Asiento_Id);

            modelBuilder.Entity<AsientoProgramacion>()
                .HasOne(ap => ap.ProgramacionVuelo)
                .WithMany()
                .HasForeignKey(ap => ap.Programacion_Vuelo_Id);

            // ProgramacionPrecio
            modelBuilder.Entity<ProgramacionPrecio>()
                .HasOne(pp => pp.ProgramacionVuelo)
                .WithMany()
                .HasForeignKey(pp => pp.Programacion_Vuelo_Id);

            modelBuilder.Entity<ProgramacionPrecio>()
                .HasOne(pp => pp.TipoClase)
                .WithMany()
                .HasForeignKey(pp => pp.Tipo_Clase_Id);

            // ProgramacionVuelo
            modelBuilder.Entity<ProgramacionVuelo>()
                .HasOne(pv => pv.Aeronave)
                .WithMany()
                .HasForeignKey(pv => pv.Aeronave_Id);

            modelBuilder.Entity<ProgramacionVuelo>()
                .HasOne(pv => pv.Ruta)
                .WithMany()
                .HasForeignKey(pv => pv.Ruta_Id);
        }
    }
}