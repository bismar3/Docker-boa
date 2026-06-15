using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ContextDatabase _context;

        public UsuarioService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UsuarioDTO>> GetAllUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.Rol)
                    .ThenInclude(r => r.RolPermisos)
                        .ThenInclude(rp => rp.Permiso)
                .ToListAsync();
            return usuarios.Select(u => MapToDTO(u));
        }

        public async Task<UsuarioDTO> GetUsuarioById(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                    .ThenInclude(r => r.RolPermisos)
                        .ThenInclude(rp => rp.Permiso)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (usuario == null) return null;
            return MapToDTO(usuario);
        }

        private UsuarioDTO MapToDTO(Usuario u)
        {
            var roles = new List<RolDTO>();
            if (u.Rol != null)
            {
                roles.Add(new RolDTO
                {
                    ID_Rol = u.Rol.ID_Rol,
                    Nombre_Rol = u.Rol.Nombre_Rol,
                    Permisos = u.Rol.RolPermisos?
                        .Where(rp => rp.Acceso)
                        .Select(rp => new PermisoDTO
                        {
                            ID_Permiso = rp.Permiso.ID_Permiso,
                            Nombre_Permiso = rp.Permiso.Nombre_Permiso
                        }).ToList() ?? new List<PermisoDTO>()
                });
            }

            return new UsuarioDTO
            {
                UserId = u.UserId,
                Fullname = u.Fullname,
                Username = u.Username,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Email = u.Email,
                Documento_Identidad = u.Documento_Identidad,
                Telefono = u.Telefono,
                Estado = u.Estado,
                Rol_Id = u.Rol_Id,
                Roles = roles
            };
        }

        public async Task<Usuario> CreateUsuario(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task UpdateUsuario(Usuario usuario)
        {
            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario != null)
            {
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();
            }
        }

        public Usuario Validate(string userName, string password)
        {
            return _context.Usuarios
                .FirstOrDefault(x => x.Username == userName && x.Password == password);
        }
    }
}