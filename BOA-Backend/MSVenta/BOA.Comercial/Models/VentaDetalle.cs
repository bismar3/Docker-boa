namespace BOA.Comercial.Models
{
    public class VentaDetalle
    {
        public int Id { get; set; }
        public string Codigo_Venta { get; set; }
        public int Cliente_Id { get; set; }
        public string Cliente_Nombre { get; set; }
        public string Cliente_Documento { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public string Numero_Ticket { get; set; }
        public int? Asiento_Id { get; set; }
        public string Pasajero_Nombre { get; set; }
        public string Pasajero_Apellido { get; set; }
        public string Metodo_Pago { get; set; }
        public decimal Monto_Total { get; set; }
        public string Estado { get; set; }
        public string Transaccion_Estado { get; set; }
    }
}