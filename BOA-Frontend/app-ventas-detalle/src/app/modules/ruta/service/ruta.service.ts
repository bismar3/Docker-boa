import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Ruta } from '../../../interfaces/ruta.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class RutaService {
  private url: string = `${environment.URL_SERVICIOS}/ruta`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<Ruta[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Ruta[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }

  public getById(id: number): Observable<Ruta> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Ruta>(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError<Ruta>('getById')));
    return of();
  }

  public create(ruta: Ruta): Observable<Ruta> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<Ruta>(this.url, ruta, httpOptions(token)).pipe(catchError(this.handleError<Ruta>('create')));
    return of();
  }

  public update(ruta: Ruta): Observable<Ruta> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.put<Ruta>(`${this.url}/${ruta.id}`, ruta, httpOptions(token)).pipe(catchError(this.handleError<Ruta>('update')));
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