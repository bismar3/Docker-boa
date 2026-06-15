using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class AeronaveConAsientosDTO
    {
        public string Matricula { get; set; }
        public string Modelo { get; set; }
        public string Fabricante { get; set; }
        public string Estado { get; set; }
        public List<ClaseConfigDTO> Clases { get; set; }
    }

    public class ClaseConfigDTO
    {
        public int Tipo_Clase_Id { get; set; }
        public int Cantidad { get; set; }
        public int Columnas_Por_Fila { get; set; }
    }
}