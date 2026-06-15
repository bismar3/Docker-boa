namespace BOA.Comercial.Models
{
    public class Reserva
    {
        public int Id { get; set; }
        public string Codigo_Reserva { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public int Cliente_Id { get; set; }
        public int Asiento_Id { get; set; }
        public decimal Monto { get; set; }
        public string Estado { get; set; }
    }
}