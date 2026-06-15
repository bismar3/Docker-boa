namespace MSVenta.Venta.Models
{
    public class ProgramacionPrecio
    {
        public int Id { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public int Tipo_Clase_Id { get; set; }
        public decimal Precio { get; set; }
        public ProgramacionVuelo ProgramacionVuelo { get; set; }
        public TipoClase TipoClase { get; set; }
    }
}