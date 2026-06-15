namespace MSVenta.Venta.Models
{
    public class ProductoAlmacen
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public Producto Producto { get; set; }
        public int AlmacenId { get; set; }
        public Almacen Almacen { get; set; }
        public int Stock { get; set; }
    }
}
