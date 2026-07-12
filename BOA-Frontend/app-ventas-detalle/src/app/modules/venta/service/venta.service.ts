import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDetalle } from '../../../interfaces/venta.interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private apiUrl = `${environment.URL_SERVICIOS}/venta`;
  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  getAllDetalle(): Observable<VentaDetalle[]> {
    return this.http.get<VentaDetalle[]>(`${this.apiUrl}/detalle`, { headers: this.getHeaders() });
  }
}