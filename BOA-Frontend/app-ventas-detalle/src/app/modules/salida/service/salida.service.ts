import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Salida {
  id: number;
  programacion_Vuelo_Id: number;
  monto_Total: number;
  cantidad_Pasajes: number;
  created_At: string;
}

@Injectable({ providedIn: 'root' })
export class SalidaService {
  private url: string = `${environment.URL_SERVICIOS}/salida`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<Salida[]> {
    return this.http.get<Salida[]>(this.url, { headers: this.getHeaders() });
  }

  registrar(programacionVueloId: number): Observable<any> {
    return this.http.post(
      `${this.url}/registrar/${programacionVueloId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}