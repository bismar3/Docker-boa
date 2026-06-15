export interface Ruta {
  id?: number;
  aeropuerto_Origen_Id: number;
  aeropuerto_Destino_Id: number;
  distancia: number;
  duracion_Estimada: string;
  tipo: string;
}