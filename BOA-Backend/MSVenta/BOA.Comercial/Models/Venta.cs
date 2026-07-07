using System;

namespace BOA.Comercial.Models
{
    public class Venta
    {
        public int Id { get; set; }
        public string Codigo_Venta { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public int Cliente_Id { get; set; }
        public int? Reserva_Id { get; set; }
        public decimal Monto_Total { get; set; }
        public string Estado { get; set; }
        public DateTime? Created_At { get; set; }
    }
}