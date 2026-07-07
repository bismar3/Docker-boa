namespace BOA.Finanzas.Models
{
    public class OcupacionVueloDto
    {
        public int ProgramacionId { get; set; }
        public string Codigo_Vuelo { get; set; }
        public string Fecha_Salida { get; set; }
        public string Hora_Salida { get; set; }
        public int Total_Asientos { get; set; }
        public int Asientos_Ocupados { get; set; }
        public double Porcentaje_Ocupacion { get; set; }
    }
}