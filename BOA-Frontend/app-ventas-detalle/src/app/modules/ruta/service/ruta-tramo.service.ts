import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface RutaTramo {
  id?: number;
  ruta_Id: number;
  tramo_Id: number;
  orden: number;
  tramo?: any;
}

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class RutaTramoService {
  private url: string = `${environment.URL_SERVICIOS}/rutatramo`;

  constructor(private http: HttpClient) { }

  public getByRutaId(rutaId: number): Observable<RutaTramo[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<RutaTramo[]>(`${this.url}/ruta/${rutaId}`, httpOptions(token)).pipe(catchError(this.handleError('getByRutaId', [])));
    return of([]);
  }

  public add(rutaTramo: RutaTramo): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post(this.url, rutaTramo, httpOptions(token)).pipe(catchError(this.handleError('add')));
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