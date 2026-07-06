import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  documento_Identidad: string;
  fecha_Nacimiento: string;
  email: string;
  telefono: string;
  usuario_Id: number | null;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteAdminService {
  private url: string = `${environment.URL_SERVICIOS}/cliente`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url, { headers: this.getHeaders() });
  }

  update(id: number, cliente: Cliente): Observable<any> {
    return this.http.put(`${this.url}/${id}`, cliente, { headers: this.getHeaders() });
  }

  getHistorial(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.URL_SERVICIOS}/venta/detalle/cliente/${clienteId}`,
      { headers: this.getHeaders() }
    );
  }
}