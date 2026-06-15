namespace BOA.Comercial.DTOs
{
    public class TransaccionDTO
    {
        public int? Venta_Id { get; set; }
        public string Referencia { get; set; }
        public decimal Monto { get; set; }
        public string Metodo_Pago { get; set; }
        public string Estado { get; set; }
    }
}