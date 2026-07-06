using System;

namespace MSVenta.Venta.Models
{
    public class Salida
    {
        public int Id { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public decimal Monto_Total { get; set; }
        public int Cantidad_Pasajes { get; set; }
        public DateTime Created_At { get; set; }
    }
}