import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class ProgramacionVueloService {
  private url: string = `${environment.URL_SERVICIOS}/programacionvuelo`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<ProgramacionVuelo[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<ProgramacionVuelo[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }

  public getById(id: number): Observable<ProgramacionVuelo> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<ProgramacionVuelo>(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError<ProgramacionVuelo>('getById')));
    return of();
  }

  public create(p: ProgramacionVuelo): Observable<ProgramacionVuelo> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<ProgramacionVuelo>(this.url, p, httpOptions(token));
    return of();
  }

  public update(p: ProgramacionVuelo): Observable<ProgramacionVuelo> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.put<ProgramacionVuelo>(`${this.url}/${p.id}`, p, httpOptions(token));
    return of();
  }

  public delete(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.delete(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError('delete')));
    return of();
  }

  public regenerarAsientos(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post(`${this.url}/${id}/regenerar-asientos`, {}, httpOptions(token));
    }
    return of(null);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => { console.error(error); return of(result as T); };
  }
}