namespace MSVenta.Venta.Models
{
    public class Tripulacion
    {
        public int Id { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public int Empleado_Id { get; set; }
        public string Cargo { get; set; }
        public ProgramacionVuelo ProgramacionVuelo { get; set; }
        public Empleado Empleado { get; set; }
    }
}