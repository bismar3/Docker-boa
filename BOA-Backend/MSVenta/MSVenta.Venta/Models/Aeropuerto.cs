namespace MSVenta.Venta.Models
{
    public class Aeropuerto
    {
        public int Id { get; set; }
        public string Codigo_IATA { get; set; }
        public string Nombre { get; set; }
        public string Ciudad { get; set; }
        public string Pais { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }
}