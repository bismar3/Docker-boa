namespace BOA.Comercial.DTOs
{
    public class ClienteDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Documento_Identidad { get; set; }
        public string Fecha_Nacimiento { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public int? Usuario_Id { get; set; }
    }
}