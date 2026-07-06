export interface ProgramacionVuelo {
  id?: number;
  codigo_Vuelo: string;
  aeronave_Id: number;
  ruta_Id: number;
  ruta_Tramo_Id: number;
  aeropuerto_Origen_Id?: number;
  aeropuerto_Destino_Id?: number;
  fecha_Salida: string;
  hora_Salida: string;
  fecha_Llegada: string;
  hora_Llegada: string;
  precio_Base: number;
  estado: string;
  motivo_Reprogramacion?: string;
}