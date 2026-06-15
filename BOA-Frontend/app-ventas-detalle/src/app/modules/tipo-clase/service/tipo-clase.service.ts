import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { TipoClase } from '../../../interfaces/tipo-clase.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class TipoClaseService {
  private url: string = `${environment.URL_SERVICIOS}/tipoclase`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<TipoClase[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<TipoClase[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }
  public create(tipoClase: TipoClase): Observable<TipoClase> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<TipoClase>(this.url, tipoClase, httpOptions(token)).pipe(catchError(this.handleError<TipoClase>('create')));
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