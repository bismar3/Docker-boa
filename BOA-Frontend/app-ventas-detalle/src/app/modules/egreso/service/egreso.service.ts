import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Egreso {
  id: number;
  codigo_Venta: string;
  cliente_Id: number;
  programacion_Vuelo_Id: number;
  monto: number;
  motivo: string;
  fecha: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class EgresoService {
  private url: string = `${environment.URL_SERVICIOS}/egreso`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAll(): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(this.url, { headers: this.getHeaders() });
  }
}