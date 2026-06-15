namespace MSVenta.Venta.DTOs
{
    public class RutaDTO
    {
        public int Aeropuerto_Origen_Id { get; set; }
        public int Aeropuerto_Destino_Id { get; set; }
        public decimal Distancia { get; set; }
        public string Duracion_Estimada { get; set; }
        public string Tipo { get; set; }
    }
}