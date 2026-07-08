using Aforo255.Cross.Token.Src;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Services;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IUsuarioService _accessService;
        private readonly JwtOptions _jwtOption;

        public AuthController(IUsuarioService accessService,
            IOptionsSnapshot<JwtOptions> jwtOption)
        {
            _accessService = accessService;
            _jwtOption = jwtOption.Value;
        }

        public IActionResult Get()
        {
            return Ok(_accessService.GetAllUsuarios());
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AuthRequest request)
        {
            var resultado = await _accessService.ValidateAsync(request.UserName, request.Password);

            if (!resultado.Exitoso)
            {
                return Unauthorized(new { message = resultado.Mensaje });
            }

            UsuarioDTO userPermisos = await _accessService.GetUsuarioById(resultado.Usuario.UserId);
            var token = JwtToken.Create(_jwtOption);
            Response.Headers.Add("access-control-expose-headers", "Authorization");
            Response.Headers.Add("Authorization", token);

            var response = new
            {
                user = new
                {
                    userPermisos.UserId,
                    userPermisos.Fullname,
                    userPermisos.Username,
                    userPermisos.Nombre,
                    userPermisos.Apellido,
                    userPermisos.Email,
                    userPermisos.Documento_Identidad,
                    userPermisos.Telefono,
                    userPermisos.Estado,
                    userPermisos.Rol_Id,
                    Roles = userPermisos.Roles.Select(role => new
                    {
                        role.ID_Rol,
                        role.Nombre_Rol,
                        Permisos = role.Permisos.Select(permiso => new
                        {
                            permiso.ID_Permiso,
                            permiso.Nombre_Permiso
                        })
                    }),
                    token,
                }
            };
            return Ok(response);
        }
    }
}