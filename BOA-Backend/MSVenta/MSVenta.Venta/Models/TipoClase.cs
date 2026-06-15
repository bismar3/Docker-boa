namespace MSVenta.Venta.Models
{
    public class TipoClase
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Caracteristicas { get; set; }
        public decimal Multiplicador_Precio { get; set; }
    }
}