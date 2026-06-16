using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IProgramacionVueloService
    {
        Task<IEnumerable<ProgramacionVuelo>> GetAll();
        Task<ProgramacionVuelo> GetById(int id);
        Task<IEnumerable<VueloBusquedaResult>> BuscarPorTramo(int origenId, int destinoId);
        Task Create(ProgramacionVuelo p);
        Task Update(ProgramacionVuelo p);
        Task Delete(int id);
    }

    public class VueloBusquedaResult
    {
        public int ProgramacionId { get; set; }
        public string Codigo_Vuelo { get; set; }
        public int Aeropuerto_Origen_Id { get; set; }
        public int Aeropuerto_Destino_Id { get; set; }
        public string Fecha_Salida { get; set; }
        public string Hora_Salida { get; set; }
        public string Fecha_Llegada { get; set; }
        public string Hora_Llegada { get; set; }
        public decimal Precio_Base { get; set; }
        public string Estado { get; set; }
        public int Ruta_Id { get; set; }
        public int Ruta_Tramo_Id { get; set; }
        public int? Tramo_Id { get; set; }
        public bool Es_Tramo_Parcial { get; set; }
        public string Duracion_Estimada { get; set; }
        public bool Tiene_Escalas { get; set; }
        public int Num_Escalas { get; set; }
    }
}