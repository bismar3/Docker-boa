import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Tripulacion {
  id?: number;
  programacion_Vuelo_Id: number;
  empleado_Id: number;
  cargo: string;
  empleado?: any;
}

@Injectable({ providedIn: 'root' })
export class TripulacionService {
  private url: string = `${environment.URL_SERVICIOS}/tripulacion`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getByProgramacion(programacionId: number): Observable<Tripulacion[]> {
    return this.http.get<Tripulacion[]>(
      `${this.url}/vuelo/${programacionId}`,
      { headers: this.getHeaders() }
    );
  }

  create(tripulacion: Tripulacion): Observable<any> {
    return this.http.post(this.url, tripulacion, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}