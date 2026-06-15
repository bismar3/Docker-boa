namespace MSVenta.Venta.DTOs
{
    public class ProgramacionVueloDTO
    {
        public string Codigo_Vuelo { get; set; }
        public int Aeronave_Id { get; set; }
        public int Ruta_Id { get; set; }
        public int Ruta_Tramo_Id { get; set; }
        public int? Aeropuerto_Origen_Id { get; set; }
        public int? Aeropuerto_Destino_Id { get; set; }
        public string Fecha_Salida { get; set; }
        public string Hora_Salida { get; set; }
        public string Fecha_Llegada { get; set; }
        public string Hora_Llegada { get; set; }
        public decimal Precio_Base { get; set; }
        public string Estado { get; set; }
    }
} 