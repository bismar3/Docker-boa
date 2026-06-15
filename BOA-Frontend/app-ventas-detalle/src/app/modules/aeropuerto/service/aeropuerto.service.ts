import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({
  providedIn: 'root'
})
export class AeropuertoService {
  private url: string = `${environment.URL_SERVICIOS}/aeropuerto`;

  constructor(private http: HttpClient) { }

  public getAll(): Observable<Aeropuerto[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Aeropuerto[]>(this.url, httpOptions(token)).pipe(
        catchError(this.handleError('getAll', []))
      );
    }
    return of([]);
  }

  public getById(id: number): Observable<Aeropuerto> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Aeropuerto>(`${this.url}/${id}`, httpOptions(token)).pipe(
        catchError(this.handleError<Aeropuerto>('getById'))
      );
    }
    return of();
  }

  public create(aeropuerto: Aeropuerto): Observable<Aeropuerto> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<Aeropuerto>(this.url, aeropuerto, httpOptions(token)).pipe(
        catchError(this.handleError<Aeropuerto>('create'))
      );
    }
    return of();
  }

  public update(id: number, aeropuerto: Aeropuerto): Observable<Aeropuerto> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.put<Aeropuerto>(`${this.url}/${id}`, aeropuerto, httpOptions(token)).pipe(
        catchError(this.handleError<Aeropuerto>('update'))
      );
    }
    return of();
  }

  public delete(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.delete(`${this.url}/${id}`, httpOptions(token)).pipe(
        catchError(this.handleError('delete'))
      );
    }
    return of();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}