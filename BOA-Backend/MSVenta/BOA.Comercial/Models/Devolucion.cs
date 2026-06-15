namespace BOA.Comercial.Models
{
    public class Devolucion
    {
        public int Id { get; set; }
        public int Venta_Id { get; set; }
        public int Cliente_Id { get; set; }
        public decimal Monto_Devolucion { get; set; }
        public string Motivo { get; set; }
    }
}