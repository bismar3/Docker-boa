namespace MSVenta.Venta.Models
{
    public class Producto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public double Precio { get; set; }
        public int Id_Categoria { get; set; }  // Relación con la categoría
        public Categoria Categoria { get; set; }  // Relación con el objeto Categoria
    }
}
