namespace MSVenta.Venta.Models
{
    public class RutaTramo
    {
        public int Id { get; set; }
        public int Ruta_Id { get; set; }
        public int Tramo_Id { get; set; }
        public int Orden { get; set; }
        public Ruta Ruta { get; set; }
        public Tramo Tramo { get; set; }
    }
}