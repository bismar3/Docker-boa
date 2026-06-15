namespace MSVenta.Venta.DTOs
{
    public class TramoDTO
    {
        public int? Tramo_Padre_Id { get; set; }
        public int Aeropuerto_Origen_Id { get; set; }
        public int Aeropuerto_Destino_Id { get; set; }
        public string Duracion_Estimada { get; set; }
        public string Tiempo_Escala { get; set; }
        public int Orden { get; set; }
    }
}