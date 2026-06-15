export interface Tramo {
  id?: number;
  tramo_Padre_Id?: number;
  aeropuerto_Origen_Id: number;
  aeropuerto_Destino_Id: number;
  duracion_Estimada: string;
  tiempo_Escala?: string;
  orden: number;
}