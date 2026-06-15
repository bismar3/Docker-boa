namespace MSVenta.Venta.Models
{
    public class Asiento
    {
        public int Id { get; set; }
        public int Aeronave_Id { get; set; }
        public string Numero { get; set; }
        public int Fila { get; set; }
        public int Tipo_Clase_Id { get; set; }
        public Aeronave Aeronave { get; set; }
        public TipoClase TipoClase { get; set; }
    }
}