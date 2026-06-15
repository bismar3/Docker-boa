namespace MSVenta.Venta.Models
{
    public class Ruta
    {
        public int Id { get; set; }
        public int Aeropuerto_Origen_Id { get; set; }
        public int Aeropuerto_Destino_Id { get; set; }
        public decimal Distancia { get; set; }
        public string Duracion_Estimada { get; set; }
        public string Tipo { get; set; }
    }
}