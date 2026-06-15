namespace BOA.Comercial.DTOs
{
    public class TicketDTO
    {
        public string Numero_Ticket { get; set; }
        public int Venta_Id { get; set; }
        public int? Asiento_Id { get; set; }
        public int? Sub_Tramo_Id { get; set; }
        public string Estado { get; set; }
        public string Pasajero_Nombre { get; set; }
        public string Pasajero_Apellido { get; set; }
    }
}