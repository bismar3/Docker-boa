using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ContextDatabase _context;

        private const int MAX_INTENTOS_FALLIDOS = 5;
        private const int MINUTOS_BLOQUEO = 5;

        public UsuarioService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UsuarioDTO>> GetAllUsuarios()
        {
            var usuarios = await _context.Usuarios
                .AsNoTracking()
                .Include(u => u.Rol)
                    .ThenInclude(r => r.RolPermisos)
                        .ThenInclude(rp => rp.Permiso)
                .ToListAsync();
            return usuarios.Select(u => MapToDTO(u));
        }

        public async Task<UsuarioDTO> GetUsuarioById(int id)
        {
            var usuario = await _context.Usuarios
                .AsNoTracking()
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
            ValidarComplejidadPassword(usuario.Password);

            usuario.Password = BCrypt.Net.BCrypt.HashPassword(usuario.Password, workFactor: 11);
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        private void ValidarComplejidadPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");

            bool tieneLetra = password.Any(char.IsLetter);
            bool tieneNumero = password.Any(char.IsDigit);

            if (!tieneLetra || !tieneNumero)
                throw new ArgumentException("La contraseña debe contener al menos una letra y un número.");
        }

        public async Task UpdateUsuario(Usuario usuario)
        {
            var existente = await _context.Usuarios.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == usuario.UserId);

            if (existente != null)
            {
                if (string.IsNullOrWhiteSpace(usuario.Password))
                {
                    usuario.Password = existente.Password;
                }
                else if (!EsHashBCrypt(usuario.Password))
                {
                    ValidarComplejidadPassword(usuario.Password);
                    usuario.Password = BCrypt.Net.BCrypt.HashPassword(usuario.Password, workFactor: 11);
                }
            }

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

        private bool EsHashBCrypt(string valor)
        {
            return !string.IsNullOrEmpty(valor) &&
                   (valor.StartsWith("$2a$") || valor.StartsWith("$2b$") || valor.StartsWith("$2y$"));
        }

        public async Task<LoginResult> ValidateAsync(string userName, string password)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                    .ThenInclude(r => r.RolPermisos)
                        .ThenInclude(rp => rp.Permiso)
                .FirstOrDefaultAsync(x => x.Username == userName);

            if (usuario == null)
            {
                return new LoginResult { Exitoso = false, Mensaje = "Usuario o contraseña incorrectos." };
            }

            if (!string.IsNullOrEmpty(usuario.Estado) && usuario.Estado != "Activo")
            {
                return new LoginResult { Exitoso = false, Mensaje = "Tu cuenta está deshabilitada. Contacta a un administrador." };
            }

            if (usuario.Bloqueado_Hasta.HasValue && usuario.Bloqueado_Hasta.Value > DateTime.Now)
            {
                var minutosRestantes = (int)Math.Ceiling((usuario.Bloqueado_Hasta.Value - DateTime.Now).TotalMinutes);
                return new LoginResult
                {
                    Exitoso = false,
                    Mensaje = $"Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en {minutosRestantes} minuto(s)."
                };
            }

            bool passwordCorrecta;

            if (EsHashBCrypt(usuario.Password))
            {
                passwordCorrecta = BCrypt.Net.BCrypt.Verify(password, usuario.Password);
            }
            else
            {
                passwordCorrecta = usuario.Password == password;

                if (passwordCorrecta)
                {
                    usuario.Password = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
                }
            }

            if (!passwordCorrecta)
            {
                usuario.Intentos_Fallidos = usuario.Intentos_Fallidos + 1;

                if (usuario.Intentos_Fallidos >= MAX_INTENTOS_FALLIDOS)
                {
                    usuario.Bloqueado_Hasta = DateTime.Now.AddMinutes(MINUTOS_BLOQUEO);
                    usuario.Veces_Bloqueado = usuario.Veces_Bloqueado + 1;
                    usuario.Intentos_Fallidos = 0;

                    await _context.SaveChangesAsync();

                    return new LoginResult
                    {
                        Exitoso = false,
                        Mensaje = $"Cuenta bloqueada temporalmente por {MINUTOS_BLOQUEO} minutos debido a múltiples intentos fallidos."
                    };
                }

                await _context.SaveChangesAsync();
                return new LoginResult { Exitoso = false, Mensaje = "Usuario o contraseña incorrectos." };
            }

            usuario.Intentos_Fallidos = 0;
            await _context.SaveChangesAsync();

            return new LoginResult
            {
                Exitoso = true,
                Usuario = usuario,
                UsuarioConPermisos = MapToDTO(usuario)
            };
        }
    }
}