using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ProductoAlmacenService
    {
        private readonly ContextDatabase _context;

        public ProductoAlmacenService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoAlmacen>> GetAllAsync()
        {
            return await _context.ProductosAlmacenes
                .Include(pa => pa.Producto)
                    .ThenInclude(c => c.Categoria)
                .Include(pa => pa.Almacen)
                .ToListAsync();

        }

        public async Task<ProductoAlmacen> GetByIdAsync(int id)
        {
            return await _context.ProductosAlmacenes
                .Include(pa => pa.Producto) // Incluye el producto
                    .ThenInclude(p => p.Categoria) // Luego, incluye la categoría del producto
                .Include(pa => pa.Almacen) // Incluye el almacén
                .FirstOrDefaultAsync(pa => pa.Id == id);



        }


        public async Task<ProductoAlmacen> AddAsync(ProductoAlmacen productoAlmacen)
        {
            // 🔹 Validar que ProductoId y AlmacenId no sean nulos ni negativos
            if (productoAlmacen.ProductoId <= 0 || productoAlmacen.AlmacenId <= 0)
            {
                throw new ArgumentException("El ProductoId y el AlmacenId deben ser mayores que cero.");
            }

            // 🔹 Validar que el Stock no sea negativo o nulo
            if (productoAlmacen.Stock <= 0)
            {
                throw new ArgumentException("El stock debe ser mayor que cero.");
            }

            // 🔹 Verificar si el ProductoId y el AlmacenId existen en la base de datos
            var productoExiste = await _context.Productos.AnyAsync(p => p.Id == productoAlmacen.ProductoId);
            var almacenExiste = await _context.Almacenes.AnyAsync(a => a.Id == productoAlmacen.AlmacenId);

            if (!productoExiste)
            {
                throw new KeyNotFoundException($"No se encontró un producto con ID {productoAlmacen.ProductoId}.");
            }

            if (!almacenExiste)
            {
                throw new KeyNotFoundException($"No se encontró un almacén con ID {productoAlmacen.AlmacenId}.");
            }

            // 🔹 Verificar si la combinación ProductoId - AlmacenId ya existe
            var existe = await _context.ProductosAlmacenes
                .AnyAsync(pa => pa.ProductoId == productoAlmacen.ProductoId && pa.AlmacenId == productoAlmacen.AlmacenId);

            if (existe)
            {
                throw new InvalidOperationException("El producto ya está asignado a este almacén.");
            }

            // ✅ Si todas las validaciones se cumplen, guardar en la base de datos
            _context.ProductosAlmacenes.Add(productoAlmacen);
            await _context.SaveChangesAsync();
            return productoAlmacen;
        }

        public async Task<bool> UpdateAsync(ProductoAlmacen productoAlmacen)
        {
            var existingProductoAlmacen = await _context.ProductosAlmacenes.FindAsync(productoAlmacen.Id);
            if (existingProductoAlmacen == null) return false;

            existingProductoAlmacen.ProductoId = productoAlmacen.ProductoId;
            existingProductoAlmacen.AlmacenId = productoAlmacen.AlmacenId;
            existingProductoAlmacen.Stock = productoAlmacen.Stock;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var productoAlmacen = await _context.ProductosAlmacenes.FindAsync(id);
            if (productoAlmacen == null) return false;

            _context.ProductosAlmacenes.Remove(productoAlmacen);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AlmacenConProductosDto> GetAlmacenConProductosAsync(int almacenId)
        {
            // Obtener todos los productos relacionados con el almacén filtrado por AlmacenId
            var productosAlmacen = await _context.ProductosAlmacenes
                .Where(pa => pa.AlmacenId == almacenId)  // Filtrar por AlmacenId
                .Include(pa => pa.Producto)  // Incluir la entidad Producto asociada
                    .ThenInclude(p => p.Categoria)  // Incluir la entidad Categoria asociada al Producto
                .Include(pa => pa.Almacen)  // Incluir la entidad Almacen
                .ToListAsync();  // Devolver todos los registros encontrados

            // Verificar si no se encuentran registros
            if (productosAlmacen == null || !productosAlmacen.Any())
            {
                return null; // Si no se encuentra el almacén o productos, devuelve null
            }

            // Obtener la información del Almacén (usamos el primer elemento, ya que todos los productos tienen el mismo AlmacenId)
            var almacen = productosAlmacen.FirstOrDefault()?.Almacen;

            // Verificar si el almacén existe
            if (almacen == null)
            {
                return null; // Si no se encuentra el almacén, devuelve null
            }

            // Mapeamos los datos a un DTO (Data Transfer Object) que podemos devolver
            var almacenConProductosDto = new AlmacenConProductosDto
            {
                AlmacenId = almacen.Id,
                AlmacenNombre = almacen.Nombre,
                Productos = productosAlmacen.Select(pa => new ProductoDto
                {
                    ProductoId = pa.ProductoId,
                    Nombre = pa.Producto.Nombre,
                    Precio = (decimal)pa.Producto.Precio,
                    Categoria = pa.Producto.Categoria.Nombre,
                    Stock = pa.Stock
                }).ToList()
            };

            return almacenConProductosDto;
        }


        public async Task<bool> QuitarProductoDeAlmacenAsync(int productoId, int almacenId)
        {
            // Validación de parámetros
            if (productoId <= 0)
            {
                throw new ArgumentException("El ProductoId debe ser mayor que cero.");
            }

            if (almacenId <= 0)
            {
                throw new ArgumentException("El AlmacenId debe ser mayor que cero.");
            }

            try
            {
                // Validar si el producto existe en la base de datos
                var producto = await _context.Productos.FindAsync(productoId);
                if (producto == null)
                {
                    throw new KeyNotFoundException($"El producto con ID {productoId} no existe.");
                }

                // Validar si el almacén existe en la base de datos
                var almacen = await _context.Almacenes.FindAsync(almacenId);
                if (almacen == null)
                {
                    throw new KeyNotFoundException($"El almacén con ID {almacenId} no existe.");
                }

                // Buscar la relación entre el producto y el almacén
                var productoAlmacen = await _context.ProductosAlmacenes
                    .FirstOrDefaultAsync(pa => pa.ProductoId == productoId && pa.AlmacenId == almacenId);

                // Validar si existe la relación entre el producto y el almacén
                if (productoAlmacen == null)
                {
                    throw new InvalidOperationException($"El producto con ID {productoId} no está asociado al almacén con ID {almacenId}.");
                }

                // Eliminar la relación entre el producto y el almacén
                _context.ProductosAlmacenes.Remove(productoAlmacen);
                await _context.SaveChangesAsync();

                return true; // Eliminación exitosa
            }
            catch (ArgumentException ex)
            {
                // Excepción de argumentos inválidos
                throw new ArgumentException(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                // Excepción cuando no se encuentra el producto o el almacén
                throw new KeyNotFoundException(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Excepción cuando el producto no está asociado al almacén
                throw new InvalidOperationException(ex.Message);
            }
            catch (DbUpdateException dbEx)
            {
                // Excepción de actualización en la base de datos (por ejemplo, problemas con claves foráneas)
                if (dbEx.InnerException is MySqlException mySqlEx)
                {
                    if (mySqlEx.Message.Contains("Cannot delete or update a parent row"))
                    {
                        // Producto en uso en otra transacción
                        throw new InvalidOperationException("No se puede eliminar este producto porque está siendo utilizado en otra transacción, como una venta.");
                    }
                }

                // Si ocurre otro error en la base de datos
                throw new Exception("Ocurrió un error al intentar eliminar el producto del almacén.");
            }
            catch (Exception ex)
            {
                // Captura cualquier otro tipo de error general
                throw new Exception("Ocurrió un error inesperado: " + ex.Message);
            }
        }


    }
}
