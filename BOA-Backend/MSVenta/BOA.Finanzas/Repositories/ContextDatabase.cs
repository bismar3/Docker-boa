using Microsoft.EntityFrameworkCore;
using BOA.Finanzas.Models;

namespace BOA.Finanzas.Repositories
{
    public class ContextDatabase : DbContext
    {
        public ContextDatabase(DbContextOptions<ContextDatabase> options) : base(options) { }
        public DbSet<Ingreso> Ingresos { get; set; }
        public DbSet<Egreso> Egresos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ingreso>().ToTable("ingresos");
            modelBuilder.Entity<Egreso>().ToTable("egresos");
        }
    }
}