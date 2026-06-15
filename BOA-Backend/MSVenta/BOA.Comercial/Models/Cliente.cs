using System;

namespace BOA.Comercial.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Documento_Identidad { get; set; }
        public DateTime Fecha_Nacimiento { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public int? Usuario_Id { get; set; }
    }
}