import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface VueloDisponible {
  id: number;
  codigo_vuelo: string;
  aeronave_Id: number;
  ruta_Id: number;
  ruta_Tramo_Id: number;
  aeropuerto_Origen_Id: number;
  aeropuerto_Destino_Id: number;
  fecha_Salida: string;
  hora_Salida: string;
  fecha_Llegada: string;
  hora_Llegada: string;
  precio_Base: number;
  asientos_Vendidos: number;
  estado: string;
}

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class BuscarVueloService {
  private url: string = `${environment.URL_SERVICIOS}/programacionvuelo`;

  constructor(private http: HttpClient) { }

  public buscar(origenId: number, destinoId: number, fecha: string): Observable<VueloDisponible[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<VueloDisponible[]>(
      `${this.url}?origen=${origenId}&destino=${destinoId}&fecha=${fecha}`,
      httpOptions(token)
    ).pipe(catchError(this.handleError('buscar', [])));
    return of([]);
  }

  public getAll(): Observable<VueloDisponible[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<VueloDisponible[]>(this.url, httpOptions(token))
      .pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => { console.error(error); return of(result as T); };
  }
}