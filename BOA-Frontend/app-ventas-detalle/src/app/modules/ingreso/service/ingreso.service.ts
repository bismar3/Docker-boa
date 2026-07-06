import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Ingreso {
  id: number;
  codigo_Venta: string;
  cliente_Id: number;
  programacion_Vuelo_Id: number;
  monto: number;
  concepto: string;
  invoice_Id: string;
  fecha: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class IngresoService {
  private url: string = `${environment.URL_SERVICIOS}/ingreso`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAll(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(this.url, { headers: this.getHeaders() });
  }
}