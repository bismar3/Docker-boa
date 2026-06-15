namespace BOA.Comercial.Models
{
    public class Transaccion
    {
        public int Id { get; set; }
        public int? Venta_Id { get; set; }
        public string Referencia { get; set; }
        public decimal Monto { get; set; }
        public string Metodo_Pago { get; set; }
        public string Estado { get; set; }
    }
}