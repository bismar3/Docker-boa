namespace MSVenta.Venta.Models
{
    public class AsientoProgramacion
    {
        public int Id { get; set; }
        public int Asiento_Id { get; set; }
        public int Programacion_Vuelo_Id { get; set; }
        public string Estado { get; set; }
        public Asiento Asiento { get; set; }
        public ProgramacionVuelo ProgramacionVuelo { get; set; }
    }
}