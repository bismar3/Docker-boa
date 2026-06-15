namespace MSVenta.Venta.Models
{
    public class Aeronave
    {
        public int Id { get; set; }
        public string Matricula { get; set; }
        public string Modelo { get; set; }
        public string Fabricante { get; set; }
        public int Capacidad_Total { get; set; }
        public string Estado { get; set; }
    }
}