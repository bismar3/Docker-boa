using System;
using System.ComponentModel.DataAnnotations;

namespace BOA.Finanzas.Models
{
    public class Egreso
    {
        [Key]
        public int Id { get; set; }
        public string Codigo_Venta { get; set; }
        public int Cliente_Id { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public decimal Monto { get; set; }
        public string Motivo { get; set; }
        public DateTime Fecha { get; set; }
        public string Estado { get; set; }
    }
}