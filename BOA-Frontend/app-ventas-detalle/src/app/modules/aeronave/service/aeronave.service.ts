import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Aeronave } from '../../../interfaces/aeronave.interface';

export interface ClaseConfig {
  tipo_Clase_Id: number;
  cantidad: number;
  columnas_Por_Fila: number;
}

export interface AeronaveConAsientos {
  matricula: string;
  modelo: string;
  fabricante: string;
  estado: string;
  clases: ClaseConfig[];
}

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class AeronaveService {
  private url: string = `${environment.URL_SERVICIOS}/aeronave`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<Aeronave[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Aeronave[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }
  public getById(id: number): Observable<Aeronave> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Aeronave>(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError<Aeronave>('getById')));
    return of();
  }
  public create(aeronave: Aeronave): Observable<Aeronave> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<Aeronave>(this.url, aeronave, httpOptions(token)).pipe(catchError(this.handleError<Aeronave>('create')));
    return of();
  }
  public createConAsientos(dto: AeronaveConAsientos): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post(`${this.url}/con-asientos`, dto, httpOptions(token));
    return of();
  }
  public update(id: number, aeronave: Aeronave): Observable<Aeronave> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.put<Aeronave>(`${this.url}/${id}`, aeronave, httpOptions(token)).pipe(catchError(this.handleError<Aeronave>('update')));
    return of();
  }
  public delete(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.delete(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError('delete')));
    return of();
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => { console.error(error); return of(result as T); };
  }
}