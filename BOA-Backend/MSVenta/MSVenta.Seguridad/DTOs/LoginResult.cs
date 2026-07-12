using MSVenta.Seguridad.Models;

namespace MSVenta.Seguridad.DTOs
{
    public class LoginResult
    {
        public bool Exitoso { get; set; }
        public Usuario Usuario { get; set; }
        public string Mensaje { get; set; }
        public UsuarioDTO UsuarioConPermisos { get; set; }
    }
}