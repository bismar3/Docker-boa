import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface VueloDisponible {
  programacionId: number;
  codigo_Vuelo: string;
  aeropuerto_Origen_Id: number;
  aeropuerto_Destino_Id: number;
  fecha_Salida: string;
  hora_Salida: string;
  fecha_Llegada: string;
  hora_Llegada: string;
  precio_Base: number;
  estado: string;
  ruta_Id: number;
  ruta_Tramo_Id: number;
  tramo_Id: number | null;
  es_Tramo_Parcial: boolean;
  duracion_Estimada: string | null;
  tiene_Escalas: boolean;
  num_Escalas: number;
}

@Injectable({ providedIn: 'root' })
export class BuscarVueloService {
  private url: string = `${environment.URL_SERVICIOS}/programacionvuelo`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  public buscarPorTramo(origenId: number, destinoId: number): Observable<VueloDisponible[]> {
    return this.http.get<VueloDisponible[]>(
      `${this.url}/buscar?origen=${origenId}&destino=${destinoId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of([])));
  }

  public getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.url, { headers: this.getHeaders() })
      .pipe(catchError(() => of([])));
  }
}