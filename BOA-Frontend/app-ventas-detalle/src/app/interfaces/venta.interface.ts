export interface VentaDetalle {
  id: number;
  codigo_Venta: string;
  cliente_Id: number;
  cliente_Nombre: string;
  cliente_Documento: string;
  programacion_Vuelo_Id: number;
  numero_Ticket: string;
  asiento_Id: number | null;
  pasajero_Nombre: string;
  pasajero_Apellido: string;
  metodo_Pago: string;
  monto_Total: number;
  estado: string;
  transaccion_Estado: string;
  created_At?: string;
}