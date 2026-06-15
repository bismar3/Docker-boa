import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Empleado } from '../../../interfaces/empleado.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private url: string = `${environment.URL_SERVICIOS}/empleado`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<Empleado[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Empleado[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }
  public create(empleado: Empleado): Observable<Empleado> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<Empleado>(this.url, empleado, httpOptions(token)).pipe(catchError(this.handleError<Empleado>('create')));
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